import { Game } from '../game/Game';
import crypto from 'crypto';

// You might want to define a type for what a "room" or "session" looks like
// For now, a Game instance itself is the primary content of a room.
// Later, you might add player socket IDs, etc., to this structure if needed.

export class GameManager {
  private activeGames: Map<string, Game>;

  constructor() {
    this.activeGames = new Map<string, Game>();
    console.log('GameManager initialized.');
  }

  /**
   * Creates a new game session.
   * - Generates a unique ID for the game.
   * - Creates a new Game instance.
   * - Stores the game in the activeGames collection.
   * @returns The unique gameId for the newly created game.
   */
  public createGame(): string {
    let gameId: string;
    do {
      gameId = crypto.randomUUID();
    } while (this.activeGames.has(gameId));

    const newGame = new Game();
    this.activeGames.set(gameId, newGame);

    console.log(`New game created with ID: ${gameId}. Total active games: ${this.activeGames.size}`);
    return gameId;
  }

  /**
   * Retrieves an active game instance by its ID.
   * @param gameId The ID of the game to retrieve.
   * @returns The Game instance if found, otherwise undefined.
   */
  public getGame(gameId: string): Game | undefined {
    return this.activeGames.get(gameId);
  }

  /**
   * Removes a game from the active sessions.
   * Call this when a game ends or all players leave.
   * @param gameId The ID of the game to remove.
   * @returns True if a game was removed, false otherwise.
   */
  public removeGame(gameId: string): boolean {
    const game = this.activeGames.get(gameId);
    if (game) {
        // Potentially add any cleanup logic for the Game instance itself if needed
    }
    const deleted = this.activeGames.delete(gameId);
    if (deleted) {
      console.log(`Game removed with ID: ${gameId}. Total active games: ${this.activeGames.size}`);
    }
    return deleted;
  }

  // Future methods:
  // - joinGame(gameId: string, playerId: string, socketId: string): boolean | Error
  // - leaveGame(gameId: string, playerId: string)
  // - handlePlayerDisconnect(socketId: string)
  // - getGameState(gameId: string) // Might delegate to the Game instance
}