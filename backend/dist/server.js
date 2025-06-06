"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const GameManager_1 = require("./game-management/GameManager");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const PADDLE_SPEED = 8;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const gameManager = new GameManager_1.GameManager();
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.data = {};
    socket.on('createGame', (callback) => {
        const gameId = gameManager.createGame();
        console.log(`Socket ${socket.id} created game ${gameId}`);
        if (typeof callback === 'function') {
            callback({ gameId });
        }
        else {
            socket.emit('gameCreated', { gameId });
        }
    });
    socket.on('joinGame', (data, callback) => {
        if (!data || typeof data.gameId !== 'string') {
            if (typeof callback === 'function')
                callback({ success: false, message: 'Invalid gameId provided.' });
            return;
        }
        const { gameId } = data;
        const joinResult = gameManager.joinGame(gameId, socket.id);
        if (joinResult.success && joinResult.playerRole) {
            socket.join(gameId);
            socket.data.gameId = gameId;
            socket.data.playerRole = joinResult.playerRole;
            console.log(`Socket ${socket.id} successfully joined game ${gameId} as ${joinResult.playerRole}`);
            if (typeof callback === 'function') {
                callback({
                    success: true,
                    gameId,
                    playerRole: joinResult.playerRole,
                    message: 'Successfully joined game.'
                });
            }
            const gameInstance = gameManager.getGame(gameId);
            if (gameInstance) {
                io.to(gameId).emit('gameState', gameInstance.getGameState());
            }
        }
        else {
            console.log(`Socket ${socket.id} failed to join game ${gameId}: ${joinResult.message}`);
            if (typeof callback === 'function') {
                callback({ success: false, message: joinResult.message });
            }
        }
    });
    socket.on('paddleMove', (data) => {
        const { gameId, playerRole } = socket.data;
        if (!gameId || !playerRole) {
            console.warn(`Socket ${socket.id} sent paddleMove without being in a game or assigned a role.`);
            return;
        }
        if (data.playerId !== playerRole) {
            console.warn(`Socket ${socket.id} (role: ${playerRole}) tried to move paddle for ${data.playerId}. Denied.`);
            return;
        }
        const game = gameManager.getGame(gameId);
        if (!game) {
            console.warn(`Game ${gameId} not found for paddleMove from socket ${socket.id}`);
            return;
        }
        if (game.isGameOver)
            return;
        let targetPaddle;
        if (playerRole === 'player1') {
            targetPaddle = game.paddle1;
        }
        else if (playerRole === 'player2') {
            targetPaddle = game.paddle2;
        }
        else {
            console.warn(`Invalid playerRole ${playerRole} for socket ${socket.id} in game ${gameId}`);
            return;
        }
        if (data.action === 'start') {
            if (data.direction === 'up')
                targetPaddle.moveUp(PADDLE_SPEED);
            else if (data.direction === 'down')
                targetPaddle.moveDown(PADDLE_SPEED);
        }
        else if (data.action === 'stop') {
            targetPaddle.stop();
        }
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const disconnectInfo = gameManager.handlePlayerDisconnect(socket.id);
        if (disconnectInfo) {
            const { gameId } = disconnectInfo;
            console.log(`Player (socket ${socket.id}, role ${socket.data.playerRole}) left game ${gameId}.`);
            const game = gameManager.getGame(gameId);
            if (game) {
                io.to(gameId).emit('gameState', game.getGameState());
                io.to(gameId).emit('playerLeft', {
                    disconnectedPlayerId: socket.data.playerRole,
                    newPlayerCount: game.playerCount
                });
                if (game.playerCount === 0) {
                    console.log(`Game ${gameId} has no players left. Removing game.`);
                    gameManager.removeGame(gameId);
                }
                else if (!game.isGameOver) {
                    console.log(`Game ${gameId} now has ${game.playerCount} player(s).`);
                }
            }
        }
    });
});
app.get('/', (req, res) => {
    res.send('Ping Pong Server with Socket.IO is running!');
});
const FPS = 60;
const gameLoopInterval = 1000 / FPS;
const activeGameLoops = new Map();
setInterval(() => {
    gameManager.getActiveGames().forEach((game, gameId) => {
        const wasGameOver = game.isGameOver;
        if (!game.isGameOver && game.playerCount === 2) {
            game.paddle1.updatePosition(game.gameAreaHeight);
            game.paddle2.updatePosition(game.gameAreaHeight);
            game.updateBall();
        }
        const currentGameState = game.getGameState();
        io.to(gameId).emit('gameState', currentGameState);
        if (currentGameState.isGameOver && !wasGameOver) {
            console.log(`Game ${gameId} ended. Winner: ${currentGameState.winner}. Broadcasting 'gameOver' event.`);
            io.to(gameId).emit('gameOver', {
                winner: currentGameState.winner,
                score: currentGameState.score
            });
        }
    });
}, gameLoopInterval);
httpServer.listen(PORT, () => {
    console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);
});
