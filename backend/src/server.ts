// backend/src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Game, GameState } from './game/Game';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const game = new Game();

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // 1. Emit the current game state to the newly connected client
  // This ensures the new player gets the game state immediately upon joining.
  const currentGameState: GameState = game.getGameState();
  socket.emit('gameState', currentGameState);
  console.log(`Sent initial gameState to ${socket.id}`);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Future: Listen for player input events from this socket
  // socket.on('paddleMove', (data) => { /* ... */ });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Ping Pong Server with Socket.IO is running!');
});

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);

  const gameLoopInterval = 1000;
  setInterval(() => {
    game.updateBall();
    // Paddle updates would go here too, once we have input based on game rooms
    // game.updatePaddle1(...);
    // game.updatePaddle2(...);

    const gameState: GameState = game.getGameState();

    // 2. Emit the updated game state to ALL connected clients
    // This line replaces the previous console.log for game state.
    io.emit('gameState', gameState);

    // The console.log for game state is now removed to reduce noise,
    // as the state is being actively emitted.
    // If you need to debug the state on the server, you can temporarily add it back:
    // console.log('Broadcasting Game State:', JSON.stringify(gameState, null, 2));

  }, gameLoopInterval);
});