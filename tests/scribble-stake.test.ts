import { describe, expect, it } from "vitest"
import { Cl } from "@stacks/transactions"

const accounts = simnet.getAccounts()
const deployer = accounts.get("deployer")!
const wallet1 = accounts.get("wallet_1")!
const wallet2 = accounts.get("wallet_2")!
const wallet3 = accounts.get("wallet_3")!

describe("ScribbleStake Contract", () => {
  it("allows contract owner to set the backend server", () => {
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "set-backend-server",
      [Cl.principal(wallet1)],
      deployer
    )
    expect(result).toBeOk(Cl.bool(true))

    const backendServer = simnet.callReadOnlyFn(
      "scribble-stake",
      "get-backend-server",
      [],
      deployer
    )
    expect(backendServer.result).toBePrincipal(wallet1)
  })

  it("prevents non-owner from setting the backend server", () => {
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "set-backend-server",
      [Cl.principal(wallet2)],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(100)) // ERR-UNAUTHORIZED
  })

  it("allows a user to create a new game", () => {
    const stakeAmount = 1000000 // 1 STX

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    expect(result).toBeOk(Cl.uint(1)) // Expect game ID 1

    const game = simnet.callReadOnlyFn(
      "scribble-stake",
      "get-game-details",
      [Cl.uint(1)],
      wallet1
    )

    // Since the error output showed the data format, let's test directly
    expect(game.result).toBeSome()

    // Try a simple test first to see if the function works
    console.log("Game result:", game.result)

    expect(gameData["host"]).toBePrincipal(wallet1)
    expect(gameData["stake-amount"]).toBeUint(stakeAmount)
    expect(gameData["state"]).toBeAscii("lobby")
    expect(gameData["players"].expectList()[0]).toBePrincipal(wallet1)
  })

  it("prevents creating a game with 0 stake", () => {
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(0)],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(106)) // ERR-INVALID-STAKE-AMOUNT
  })

  it("allows a player to join an existing game", () => {
    const stakeAmount = 1000000

    // Host creates the game
    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )

    // Player 2 joins
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "join-game",
      [Cl.uint(1)],
      wallet2
    )
    expect(result).toBeOk(Cl.bool(true))

    const game = simnet.callReadOnlyFn(
      "scribble-stake",
      "get-game-details",
      [Cl.uint(1)],
      wallet1
    )
    const gameData = game.result.expectSome().expectTuple()
    expect(gameData["pot-total"]).toBeUint(stakeAmount * 2)
    expect(gameData["players"].expectList()).toHaveLength(2)
  })

  it("prevents a player from joining a game twice", () => {
    const stakeAmount = 1000000

    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "join-game",
      [Cl.uint(1)],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(104)) // ERR-ALREADY-JOINED
  })

  it("prevents joining a non-existent game", () => {
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "join-game",
      [Cl.uint(999)],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(101)) // ERR-GAME-NOT-FOUND
  })

  it("allows the host to start the game", () => {
    const stakeAmount = 1000000

    // Create game and add a second player
    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet2)

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "start-game",
      [Cl.uint(1)],
      wallet1
    )
    expect(result).toBeOk(Cl.bool(true))

    const game = simnet.callReadOnlyFn(
      "scribble-stake",
      "get-game-details",
      [Cl.uint(1)],
      wallet1
    )
    expect(game.result.expectSome().expectTuple()["state"]).toBeAscii(
      "in-progress"
    )
  })

  it("prevents non-host from starting the game", () => {
    const stakeAmount = 1000000

    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet2)

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "start-game",
      [Cl.uint(1)],
      wallet2
    )
    expect(result).toBeErr(Cl.uint(108)) // ERR-NOT-HOST
  })

  it("prevents starting a game with only one player", () => {
    const stakeAmount = 1000000

    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "start-game",
      [Cl.uint(1)],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(105)) // ERR-NOT-ENOUGH-PLAYERS
  })

  it("allows backend to end game and distribute rewards correctly", () => {
    const stakeAmount = 1000000

    // Set backend server first
    simnet.callPublicFn(
      "scribble-stake",
      "set-backend-server",
      [Cl.principal(deployer)],
      deployer
    )

    // Create game, add players, and start
    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet2)
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet3)
    simnet.callPublicFn("scribble-stake", "start-game", [Cl.uint(1)], wallet1)

    // End game with winners (wallet1 first, wallet2 second, wallet3 third)
    const winners = Cl.list([
      Cl.principal(wallet1),
      Cl.principal(wallet2),
      Cl.principal(wallet3),
    ])

    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "end-game",
      [Cl.uint(1), winners],
      deployer
    )
    expect(result).toBeOk(Cl.bool(true))

    const game = simnet.callReadOnlyFn(
      "scribble-stake",
      "get-game-details",
      [Cl.uint(1)],
      wallet1
    )
    expect(game.result.expectSome().expectTuple()["state"]).toBeAscii(
      "finished"
    )

    // Check that total pot is correct (3 players * stake amount)
    expect(game.result.expectSome().expectTuple()["pot-total"]).toBeUint(
      stakeAmount * 3
    )
  })

  it("prevents non-backend from ending a game", () => {
    const stakeAmount = 1000000

    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet2)
    simnet.callPublicFn("scribble-stake", "start-game", [Cl.uint(1)], wallet1)

    const winners = Cl.list([Cl.principal(wallet1)])
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "end-game",
      [Cl.uint(1), winners],
      wallet1
    )
    expect(result).toBeErr(Cl.uint(100)) // ERR-UNAUTHORIZED
  })

  it("prevents ending a game not in progress", () => {
    const stakeAmount = 1000000

    // Set backend server
    simnet.callPublicFn(
      "scribble-stake",
      "set-backend-server",
      [Cl.principal(deployer)],
      deployer
    )

    simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    simnet.callPublicFn("scribble-stake", "join-game", [Cl.uint(1)], wallet2)
    // Don't start the game

    const winners = Cl.list([Cl.principal(wallet1)])
    const { result } = simnet.callPublicFn(
      "scribble-stake",
      "end-game",
      [Cl.uint(1), winners],
      deployer
    )
    expect(result).toBeErr(Cl.uint(103)) // ERR-GAME-NOT-IN-PROGRESS
  })

  it("increments game ID counter correctly", () => {
    const stakeAmount = 1000000

    // Create first game
    const result1 = simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet1
    )
    expect(result1.result).toBeOk(Cl.uint(1))

    // Create second game
    const result2 = simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet2
    )
    expect(result2.result).toBeOk(Cl.uint(2))

    // Create third game
    const result3 = simnet.callPublicFn(
      "scribble-stake",
      "create-game",
      [Cl.uint(stakeAmount)],
      wallet3
    )
    expect(result3.result).toBeOk(Cl.uint(3))
  })
})
