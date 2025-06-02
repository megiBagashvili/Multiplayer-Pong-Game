import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Game, GameState } from './game/Game';

const app = express();
const PORT = process.env.PORT || 3001;

const PADDLE_SPEED = 8;

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

interface PaddleMovePayload {
  playerId: 'player1' | 'player2';
  action: 'start' | 'stop';
  direction: 'up' | 'down';
}

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  const currentGameState: GameState = game.getGameState();
  socket.emit('gameState', currentGameState);
  console.log(`Sent initial gameState to ${socket.id}`);

  socket.on('paddleMove', (data: PaddleMovePayload) => {
    if (!data || typeof data.playerId !== 'string' || typeof data.action !== 'string' || typeof data.direction !== 'string') {
      console.warn(`Received malformed paddleMove data from ${socket.id}:`, data);
      return;
    }

    // console.log(`Received paddleMove from ${socket.id}:`, data); // For debugging

    let targetPaddle;
    if (data.playerId === 'player1') {
      targetPaddle = game.paddle1;
    } else if (data.playerId === 'player2') {
      targetPaddle = game.paddle2;
    } else {
      console.warn(`Invalid playerId in paddleMove from ${socket.id}: ${data.playerId}`);
      return;
    }


    if (data.action === 'start') {
      if (data.direction === 'up') {
        targetPaddle.moveUp(PADDLE_SPEED);
      } else if (data.direction === 'down') {
        targetPaddle.moveDown(PADDLE_SPEED);
      }
    } else if (data.action === 'stop') {
      // The paddle's stop() method doesn't currently care about which direction was stopped,
      // it just sets dy to 0. If current dy is already 0 or in the opposite direction
      // of the key released, this still correctly stops or doesn't interfere.
      // However, to be more precise, you could check if the paddle's current dy matches the stop direction.
      // For example: if (data.direction === 'up' && targetPaddle.dy < 0) targetPaddle.stop();
      // else if (data.direction === 'down' && targetPaddle.dy > 0) targetPaddle.stop();
      // But a simple stop() is fine for most cases.
      targetPaddle.stop();
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Future: If a player disconnects, you might want to stop their paddle.
    // This requires knowing which paddle this socket controlled.
    // For now, we handle explicit stop commands.
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Ping Pong Server with Socket.IO is running!');
});

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);

  const gameLoopInterval = 1000;
  setInterval(() => {
    game.paddle1.updatePosition(game.gameAreaHeight);
    game.paddle2.updatePosition(game.gameAreaHeight);

    game.updateBall();

    const gameState: GameState = game.getGameState();
    io.emit('gameState', gameState);
  }, gameLoopInterval);
});