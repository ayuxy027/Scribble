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
(define-constant MAX-PLAYERS u20)

;; --- Data Storage ---

;; Stores the state of each game room.
(define-map games
  uint
  {
    host: principal,
    stake-amount: uint,
    pot-total: uint,
    state: (string-ascii 12),
    players: (list 20 principal)
  }
)

;; Tracks the total number of games created to generate new game IDs.
(define-data-var game-id-nonce uint u0)

;; Stores the designated backend server principal authorized to end games.
(define-data-var backend-server principal tx-sender)

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

;; --- Public Functions ---

;; @desc Creates a new game room.
;; @param stake-amount: The amount of STX required to join. Must be > 0.
;; @returns (ok uint) with the new game ID or (err uint).
(define-public (create-game (stake-amount uint))
  (begin
    (asserts! (> stake-amount u0) ERR-INVALID-STAKE-AMOUNT)
    (let ((new-game-id (+ (var-get game-id-nonce) u1)))
      (map-set games new-game-id {
        host: tx-sender,
        stake-amount: stake-amount,
        pot-total: u0,
        state: "lobby",
        players: (list tx-sender)
      })
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

    ;; Transfer stake to the contract
    (try! (stx-transfer? (get stake-amount game) tx-sender (as-contract tx-sender)))

    ;; Update game state
    (let ((updated-pot (+ (get pot-total game) (get stake-amount game)))
          (updated-players (unwrap! (as-max-len? (append (get players game) tx-sender) u20) (err u999)))) ;; Should not fail given list constraints
      (map-set games game-id
        (merge game {
          pot-total: updated-pot,
          players: updated-players
        })
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

        (map-set games game-id (merge game { state: "in-progress" }))
        (ok true)
    )
)


;; @desc Ends the game and distributes the prize pot. Can only be called by the backend server.
;; @param game-id: The ID of the game to end.
;; @param winners: A list of the top 3 winning principals.
;; @returns (ok bool) or (err uint).
(define-public (end-game (game-id uint) (winners (list 3 principal)))
  (begin
    (asserts! (is-eq tx-sender (var-get backend-server)) ERR-UNAUTHORIZED)
    (let ((game (unwrap! (map-get? games game-id) ERR-GAME-NOT-FOUND)))
      (asserts! (is-eq (get state game) "in-progress") ERR-GAME-NOT-IN-PROGRESS)
      (asserts! (is-eq (len winners) u3) ERR-INVALID-WINNERS-LIST)

      (let ((pot (get pot-total game))
            (winner-1 (unwrap! (element-at winners u0) ERR-INVALID-WINNERS-LIST))
            (winner-2 (unwrap! (element-at winners u1) ERR-INVALID-WINNERS-LIST))
            (winner-3 (unwrap! (element-at winners u2) ERR-INVALID-WINNERS-LIST)))

        ;; Distribute rewards: 50% to 1st, 30% to 2nd, 20% to 3rd
        (let ((reward-1 (/ (* pot u50) u100))
              (reward-2 (/ (* pot u30) u100))
              (reward-3 (/ (* pot u20) u100)))

          (try! (as-contract (stx-transfer? reward-1 tx-sender winner-1)))
          (try! (as-contract (stx-transfer? reward-2 tx-sender winner-2)))
          (try! (as-contract (stx-transfer? reward-3 tx-sender winner-3)))

          ;; Mark game as finished
          (map-set games game-id (merge game { state: "finished" }))
          (ok true)
        )
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

;; @desc Gets the current backend server principal.
;; @returns principal
(define-read-only (get-backend-server)
    (var-get backend-server)
)
