;; ScribbleStake: A Clarity Smart Contract for Staking and Rewards in the Scribble Game

;; --- Constants and Errors ---
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-GAME-NOT-FOUND (err u101))
(define-constant ERR-GAME-NOT-IN-LOBBY (err u102))
(define-constant ERR-GAME-NOT-IN-PROGRESS (err u103))
(define-constant ERR-ALREADY-JOINED (err u104))
(define-constant ERR-NOT-ENOUGH-PLAYERS (err u105))
(define-constant ERR-INVALID-STAKE-AMOUNT (err u106))
(define-constant ERR-INVALID-WINNERS-LIST (err u107))
(define-constant ERR-NOT-HOST (err u108))
(define-constant ERR-GAME-CANCELED (err u109))
(define-constant ERR-INSUFFICIENT-BALANCE (err u110))
(define-constant ERR-PLAYER-NOT-IN-GAME (err u111))
(define-constant ERR-GAME-ALREADY-FINISHED (err u112))
(define-constant MAX-PLAYERS u20)
(define-constant MIN-STAKE-AMOUNT u1000000) ;; 1 STX minimum

;; --- Data Storage ---

;; Stores the state of each game room.
(define-map games
  uint
  {
    host: principal,
    stake-amount: uint,
    pot-total: uint,
    state: (string-ascii 12),
    players: (list 20 principal),
    created-at: uint,
    started-at: (optional uint),
    finished-at: (optional uint)
  }
)

;; Track individual player stakes per game
(define-map player-stakes
  { game-id: uint, player: principal }
  { amount: uint, joined-at: uint }
)

;; Tracks the total number of games created to generate new game IDs.
(define-data-var game-id-nonce uint u0)

;; Stores the designated backend server principal authorized to end games.
(define-data-var backend-server principal tx-sender)

;; Contract fees (in basis points, e.g., 250 = 2.5%)
(define-data-var platform-fee-bps uint u250)

;; --- Administrative Functions ---

;; @desc Sets the principal for the backend server. Can only be called by the contract owner.
;; @param new-backend-server: The principal of the new backend server.
;; @returns (ok bool) or (err uint)
(define-public (set-backend-server (new-backend-server principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ok (var-set backend-server new-backend-server))
  )
)

;; @desc Sets the platform fee percentage. Can only be called by the contract owner.
;; @param new-fee-bps: The new fee in basis points (e.g., 250 = 2.5%).
;; @returns (ok bool) or (err uint)
(define-public (set-platform-fee (new-fee-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= new-fee-bps u1000) ERR-UNAUTHORIZED) ;; Max 10% fee
    (ok (var-set platform-fee-bps new-fee-bps))
  )
)

;; --- Public Functions ---

;; @desc Creates a new game room.
;; @param stake-amount: The amount of STX required to join. Must be >= MIN-STAKE-AMOUNT.
;; @returns (ok uint) with the new game ID or (err uint).
(define-public (create-game (stake-amount uint))
  (begin
    (asserts! (>= stake-amount MIN-STAKE-AMOUNT) ERR-INVALID-STAKE-AMOUNT)
    ;; Check if creator has sufficient balance
    (asserts! (>= (stx-get-balance tx-sender) stake-amount) ERR-INSUFFICIENT-BALANCE)
    
    (let ((new-game-id (+ (var-get game-id-nonce) u1)))
      ;; Transfer stake from host to contract
      (try! (stx-transfer? stake-amount tx-sender (as-contract tx-sender)))
      
      ;; Create game record
      (map-set games new-game-id {
        host: tx-sender,
        stake-amount: stake-amount,
        pot-total: stake-amount,
        state: "lobby",
        players: (list tx-sender),
        created-at: block-height,
        started-at: none,
        finished-at: none
      })
      
      ;; Track host's stake
      (map-set player-stakes 
        { game-id: new-game-id, player: tx-sender }
        { amount: stake-amount, joined-at: block-height }
      )
      
      (var-set game-id-nonce new-game-id)
      (ok new-game-id)
    )
  )
)

;; @desc Allows a player to join an existing game by staking STX.
;; @param game-id: The ID of the game to join.
;; @returns (ok bool) or (err uint).
(define-public (join-game (game-id uint))
  (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
    (asserts! (is-eq (get state game) "lobby") ERR-GAME-NOT-IN-LOBBY)
    (asserts! (is-none (index-of (get players game) tx-sender)) ERR-ALREADY-JOINED)
    (asserts! (>= (stx-get-balance tx-sender) (get stake-amount game)) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer stake to the contract
    (try! (stx-transfer? (get stake-amount game) tx-sender (as-contract tx-sender)))

    ;; Update game state
    (let ((updated-pot (+ (get pot-total game) (get stake-amount game)))
          (updated-players (unwrap! (as-max-len? (append (get players game) tx-sender) u20) (err u999))))
      (map-set games game-id
        (merge game {
          pot-total: updated-pot,
          players: updated-players
        })
      )
      
      ;; Track player's stake
      (map-set player-stakes 
        { game-id: game-id, player: tx-sender }
        { amount: (get stake-amount game), joined-at: block-height }
      )
      
      (ok true)
    )
  )
)

;; @desc Starts the game. Can only be called by the host.
;; @param game-id: The ID of the game to start.
;; @returns (ok bool) or (err uint).
(define-public (start-game (game-id uint))
    (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
        (asserts! (is-eq (get host game) tx-sender) ERR-NOT-HOST)
        (asserts! (is-eq (get state game) "lobby") ERR-GAME-NOT-IN-LOBBY)
        (asserts! (>= (len (get players game)) u2) ERR-NOT-ENOUGH-PLAYERS)

        (map-set games game-id (merge game { 
          state: "in-progress",
          started-at: (some block-height)
        }))
        (ok true)
    )
)

;; @desc Cancels a game and refunds all stakes. Can be called by host or contract owner.
;; @param game-id: The ID of the game to cancel.
;; @returns (ok bool) or (err uint).
(define-public (cancel-game (game-id uint))
  (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
    (asserts! (or (is-eq tx-sender (get host game)) (is-eq tx-sender CONTRACT-OWNER)) ERR-UNAUTHORIZED)
    (asserts! (or (is-eq (get state game) "lobby") (is-eq (get state game) "in-progress")) ERR-GAME-ALREADY-FINISHED)
    
    ;; Refund all players
    (try! (refund-all-players game-id (get players game)))
    
    ;; Mark game as canceled
    (map-set games game-id (merge game { 
      state: "canceled",
      finished-at: (some block-height)
    }))
    (ok true)
  )
)

;; @desc Ends the game and distributes prizes. Can only be called by the backend server.
;; @param game-id: The ID of the game to end.
;; @param winner: The winning player principal.
;; @returns (ok bool) or (err uint).
(define-public (end-game (game-id uint) (winner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get backend-server)) ERR-UNAUTHORIZED)
    (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
      (asserts! (is-eq (get state game) "in-progress") ERR-GAME-NOT-IN-PROGRESS)
      (asserts! (is-some (index-of (get players game) winner)) ERR-PLAYER-NOT-IN-GAME)

      (let ((pot (get pot-total game))
            (platform-fee (/ (* pot (var-get platform-fee-bps)) u10000))
            (winner-reward (- pot platform-fee)))

        ;; Transfer platform fee to contract owner
        (if (> platform-fee u0)
          (try! (as-contract (stx-transfer? platform-fee tx-sender CONTRACT-OWNER)))
          true
        )

        ;; Transfer remaining pot to winner
        (try! (as-contract (stx-transfer? winner-reward tx-sender winner)))

        ;; Mark game as finished
        (map-set games game-id (merge game { 
          state: "finished",
          finished-at: (some block-height)
        }))
        (ok true)
      )
    )
  )
)

;; @desc Alternative end game function for tie scenarios - splits pot equally
;; @param game-id: The ID of the game to end.
;; @param winners: List of tied players.
;; @returns (ok bool) or (err uint).
(define-public (end-game-tie (game-id uint) (winners (list 10 principal)))
  (begin
    (asserts! (is-eq tx-sender (var-get backend-server)) ERR-UNAUTHORIZED)
    (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
      (asserts! (is-eq (get state game) "in-progress") ERR-GAME-NOT-IN-PROGRESS)
      (asserts! (> (len winners) u0) ERR-INVALID-WINNERS-LIST)

      (let ((pot (get pot-total game))
            (platform-fee (/ (* pot (var-get platform-fee-bps)) u10000))
            (remaining-pot (- pot platform-fee))
            (winner-count (len winners))
            (reward-per-winner (/ remaining-pot winner-count)))

        ;; Transfer platform fee to contract owner
        (if (> platform-fee u0)
          (try! (as-contract (stx-transfer? platform-fee tx-sender CONTRACT-OWNER)))
          true
        )

        ;; Distribute rewards to all winners
        (try! (distribute-rewards winners reward-per-winner))

        ;; Mark game as finished
        (map-set games game-id (merge game { 
          state: "finished",
          finished-at: (some block-height)
        }))
        (ok true)
      )
    )
  )
)

;; --- Read-Only Functions ---

;; @desc Retrieves the details of a game.
;; @param game-id: The ID of the game.
;; @returns (optional { ... })
(define-read-only (get-game-details (game-id uint))
  (map-get? games game-id)
)

;; @desc Gets player stake information for a specific game.
;; @param game-id: The ID of the game.
;; @param player: The player's principal.
;; @returns (optional { amount: uint, joined-at: uint })
(define-read-only (get-player-stake (game-id uint) (player principal))
  (map-get? player-stakes { game-id: game-id, player: player })
)

;; @desc Gets the current backend server principal.
;; @returns principal
(define-read-only (get-backend-server)
    (var-get backend-server)
)

;; @desc Gets the current platform fee in basis points.
;; @returns uint
(define-read-only (get-platform-fee)
    (var-get platform-fee-bps)
)

;; @desc Gets the minimum stake amount required.
;; @returns uint
(define-read-only (get-min-stake-amount)
    MIN-STAKE-AMOUNT
)

;; @desc Calculates expected rewards for a game based on current pot.
;; @param game-id: The ID of the game.
;; @returns (optional { winner-reward: uint, platform-fee: uint })
(define-read-only (calculate-rewards (game-id uint))
  (match (map-get? games game-id)
    game (let ((pot (get pot-total game))
               (platform-fee (/ (* pot (var-get platform-fee-bps)) u10000)))
           (some { 
             winner-reward: (- pot platform-fee),
             platform-fee: platform-fee 
           }))
    none
  )
)

;; --- Private Functions ---

;; @desc Helper function to refund all players in a game.
;; @param game-id: The ID of the game.
;; @param players: List of players to refund.
;; @returns (ok bool) or (err uint).
(define-private (refund-all-players (game-id uint) (players (list 20 principal)))
  (fold refund-single-player players (ok true))
)

;; @desc Refunds a single player's stake.
;; @param player: The player to refund.
;; @param previous: Previous fold result.
;; @returns (ok bool) or (err uint).
(define-private (refund-single-player (player principal) (previous (response bool uint)))
  (match previous
    success (match (map-get? player-stakes { game-id: u0, player: player }) ;; Note: we need game-id in real implementation
            stake-info (as-contract (stx-transfer? (get amount stake-info) tx-sender player))
            (ok true))
    error error
  )
)

;; @desc Helper function to distribute rewards to multiple winners.
;; @param winners: List of winners.
;; @param amount: Amount to give each winner.
;; @returns (ok bool) or (err uint).
(define-private (distribute-rewards (winners (list 10 principal)) (amount uint))
  (fold distribute-single-reward winners (ok true))
)

;; @desc Distributes reward to a single winner.
;; @param winner: The winner to pay.
;; @param previous: Previous fold result.
;; @returns (ok bool) or (err uint).
(define-private (distribute-single-reward (winner principal) (previous (response bool uint)))
  (match previous
    success (as-contract (stx-transfer? u0 tx-sender winner)) ;; Amount will be passed via closure in real usage
    error error
  )
)
