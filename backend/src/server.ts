// backend/src/server.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Game } from './game/Game';

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// HTTP Server and Socket.IO
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//Create a single Game instance
const game = new Game();
//End Game instance

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Ping Pong Server with Socket.IO is running!');
});

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);

  //Start a simple game loop for testing game logic
  const gameLoopInterval = 1000; // 1000ms = 1 second, as per to-do
  // For smoother animation testing later, you might use ~50ms (20 FPS) or ~16ms (~60 FPS)
  setInterval(() => {
    game.updateBall(); // Update ball position and check wall collisions
    // Paddle updates would go here too, once we have input
    // game.updatePaddle1(...);
    // game.updatePaddle2(...);

    const gameState = game.getGameState();
    // For now, just log it to the server console
    console.log('Current Game State:', JSON.stringify(gameState, null, 2));

    // Later, instead of console logging, we'll emit this to connected clients:
    // io.emit('gameState', gameState);
  }, gameLoopInterval);
});