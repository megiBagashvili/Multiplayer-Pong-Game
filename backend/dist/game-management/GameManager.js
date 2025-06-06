"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("../game/Game");
const crypto_1 = __importDefault(require("crypto"));
class GameManager {
    constructor() {
        this.activeGames = new Map();
        console.log("GameManager initialized.");
    }
    getActiveGames() {
        return this.activeGames;
    }
    createGame() {
        let gameId;
        do {
            gameId = crypto_1.default.randomUUID();
        } while (this.activeGames.has(gameId));
        const newGame = new Game_1.Game();
        this.activeGames.set(gameId, newGame);
        console.log(`New game created with ID: ${gameId}. Total: ${this.activeGames.size} active games.`);
        return gameId;
    }
    getGame(gameId) {
        return this.activeGames.get(gameId);
    }
    joinGame(gameIdToJoin, socketId) {
        for (const [otherGameId, otherGame] of this.activeGames.entries()) {
            if (otherGameId === gameIdToJoin) {
                continue;
            }
            let playerRemovedFromOldGame = false;
            if (otherGame.player1SocketId === socketId) {
                console.log(`Socket ${socketId} was Player 1 in old game ${otherGameId}. Removing before joining new game ${gameIdToJoin}.`);
                otherGame.player1SocketId = null;
                otherGame.playerCount--;
                playerRemovedFromOldGame = true;
            }
            else if (otherGame.player2SocketId === socketId) {
                console.log(`Socket ${socketId} was Player 2 in old game ${otherGameId}. Removing before joining new game ${gameIdToJoin}.`);
                otherGame.player2SocketId = null;
                otherGame.playerCount--;
                playerRemovedFromOldGame = true;
            }
            if (playerRemovedFromOldGame) {
                console.log(`Player count for old game ${otherGameId} is now ${otherGame.playerCount}. Game state will update via main loop.`);
                if (otherGame.playerCount <= 0) {
                    this.removeGame(otherGameId);
                }
            }
        }
        const game = this.activeGames.get(gameIdToJoin);
        if (!game) {
            return { success: false, message: "Game not found (it may have been cleaned up or never existed)." };
        }
        if (game.isGameOver) {
            console.log(`Attempt to join game ${gameIdToJoin} which has already ended. Removing this ended game.`);
            this.removeGame(gameIdToJoin);
            return { success: false, message: "This game has already ended and is no longer available." };
        }
        if (game.player1SocketId === socketId ||
            game.player2SocketId === socketId) {
            const existingRole = game.player1SocketId === socketId ? "player1" : "player2";
            console.log(`Socket ${socketId} is already Player ${existingRole === 'player1' ? 1 : 2} in game ${gameIdToJoin}. Re-confirming join.`);
            return {
                success: true,
                playerRole: existingRole,
                gameId: gameIdToJoin,
                message: "Already joined this game.",
            };
        }
        if (game.playerCount >= 2) {
            return { success: false, message: "Game room is full." };
        }
        if (game.player1SocketId === null) {
            game.player1SocketId = socketId;
            game.playerCount++;
            console.log(`Socket ${socketId} joined game ${gameIdToJoin} as Player 1. Player count: ${game.playerCount}`);
            if (game.playerCount === 2 && !game.isGameOver) {
                console.log(`Game ${gameIdToJoin} is now full. Triggering initial serve.`);
                game.resetBallAndServe(Math.random() < 0.5);
            }
            return { success: true, playerRole: "player1", gameId: gameIdToJoin };
        }
        else if (game.player2SocketId === null) {
            game.player2SocketId = socketId;
            game.playerCount++;
            console.log(`Socket ${socketId} joined game ${gameIdToJoin} as Player 2. Player count: ${game.playerCount}`);
            if (game.playerCount === 2 && !game.isGameOver) {
                console.log(`Game ${gameIdToJoin} is now full and ready to start. Triggering initial serve.`);
                game.resetBallAndServe(Math.random() < 0.5);
            }
            return { success: true, playerRole: "player2", gameId: gameIdToJoin };
        }
        else {
            return {
                success: false,
                message: "Game room is full (unexpected state during slot assignment).",
            };
        }
    }
    handlePlayerDisconnect(socketId) {
        for (const [gameId, game] of this.activeGames.entries()) {
            let wasPlayer1 = false;
            if (game.player1SocketId === socketId) {
                console.log(`Player 1 (Socket ${socketId}) disconnected from game ${gameId}`);
                game.player1SocketId = null;
                game.playerCount--;
                return {
                    gameId,
                    wasPlayer1: true,
                    remainingPlayerSocketId: game.player2SocketId || undefined,
                };
            }
            else if (game.player2SocketId === socketId) {
                console.log(`Player 2 (Socket ${socketId}) disconnected from game ${gameId}`);
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
    removeGame(gameId) {
        const game = this.activeGames.get(gameId);
        if (game) {
            console.log(`Preparing to remove game ${gameId}. Current player count: ${game.playerCount}, IsGameOver: ${game.isGameOver}`);
        }
        const deleted = this.activeGames.delete(gameId);
        if (deleted) {
            console.log(`Game removed: ${gameId}. Total: ${this.activeGames.size} active games.`);
        }
        else {
            console.warn(`Attempted to remove game ${gameId}, but it was not found in activeGames.`);
        }
        return deleted;
    }
}
exports.GameManager = GameManager;
