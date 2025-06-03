import { Game } from "../game/Game";
import crypto from "crypto";

export interface JoinGameResult {
  success: boolean;
  message?: string;
  playerRole?: "player1" | "player2";
  gameId?: string;
}

export interface DisconnectedPlayerInfo {
  gameId: string;
  wasPlayer1: boolean;
  remainingPlayerSocketId?: string;
}

export class GameManager {
  private activeGames: Map<string, Game>;

  constructor() {
    this.activeGames = new Map<string, Game>();
    console.log("GameManager initialized.");
  }

  public createGame(): string {
    let gameId: string;
    do {
      gameId = crypto.randomUUID();
    } while (this.activeGames.has(gameId));
    const newGame = new Game();
    this.activeGames.set(gameId, newGame);
    console.log(
      `New game created with ID: ${gameId}. Total: ${this.activeGames.size} active games.`
    );
    return gameId;
  }

  public getGame(gameId: string): Game | undefined {
    return this.activeGames.get(gameId);
  }

  public joinGame(gameId: string, socketId: string): JoinGameResult {
    const game = this.activeGames.get(gameId);
    if (!game) {
      return { success: false, message: "Game not found." };
    }
    if (
      game.player1SocketId === socketId ||
      game.player2SocketId === socketId
    ) {
      const existingRole =
        game.player1SocketId === socketId ? "player1" : "player2";
      return {
        success: true,
        playerRole: existingRole,
        gameId: gameId,
        message: "Already joined this game.",
      };
    }
    if (game.playerCount >= 2) {
      if (game.player1SocketId !== null && game.player2SocketId !== null) {
        return { success: false, message: "Game room is full." };
      }
    }
    if (game.player1SocketId === null) {
      game.player1SocketId = socketId;
      game.playerCount++;
      console.log(
        `Socket ${socketId} joined game ${gameId} as Player 1. Player count: ${game.playerCount}`
      );
      return { success: true, playerRole: "player1", gameId: gameId };
    } else if (game.player2SocketId === null) {
      game.player2SocketId = socketId;
      game.playerCount++;
      console.log(
        `Socket ${socketId} joined game ${gameId} as Player 2. Player count: ${game.playerCount}`
      );
      if (game.playerCount === 2) {
        console.log(`Game ${gameId} is now full and ready to start.`);
      }
      return { success: true, playerRole: "player2", gameId: gameId };
    } else {
      return {
        success: false,
        message: "Game room is full (unexpected state).",
      };
    }
  }

  /**
   * Handles a player's disconnection.
   * Updates the game state by removing the player and decreasing player count.
   * @param socketId The socket ID of the disconnected player.
   * @returns Information about the disconnection, or null if the socket was not in any game.
   */
  public handlePlayerDisconnect(
    socketId: string
  ): DisconnectedPlayerInfo | null {
    for (const [gameId, game] of this.activeGames.entries()) {
      if (game.player1SocketId === socketId) {
        console.log(
          `Player 1 (Socket ${socketId}) disconnected from game ${gameId}`
        );
        game.player1SocketId = null;
        game.playerCount--;
        return {
          gameId,
          wasPlayer1: true,
          remainingPlayerSocketId: game.player2SocketId || undefined,
        };
      } else if (game.player2SocketId === socketId) {
        console.log(
          `Player 2 (Socket ${socketId}) disconnected from game ${gameId}`
        );
        game.player2SocketId = null;
        game.playerCount--;
        return {
          gameId,
          wasPlayer1: false,
          remainingPlayerSocketId: game.player1SocketId || undefined,
        };
      }
    }
    return null;
  }

  public removeGame(gameId: string): boolean {
    const game = this.activeGames.get(gameId);
    if (game) {
    }
    const deleted = this.activeGames.delete(gameId);
    if (deleted) {
      console.log(
        `Game removed: ${gameId}. Total: ${this.activeGames.size} active games.`
      );
    }
    return deleted;
  }
}
