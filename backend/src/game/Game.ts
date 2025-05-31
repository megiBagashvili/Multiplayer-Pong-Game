// backend/src/game/Game.ts

import { Paddle } from './Paddle';
import { Ball } from './Ball';

// Game constants (ensure these are still here)
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
// const PADDLE_SPEED = 10;
const BALL_RADIUS = 7;
const INITIAL_BALL_SPEED_X = 5;
const INITIAL_BALL_SPEED_Y = 5;

interface Score {
  player1: number;
  player2: number;
}

export class Game {
  public paddle1: Paddle;
  public paddle2: Paddle;
  public ball: Ball;
  public score: Score;
  public gameAreaWidth: number;
  public gameAreaHeight: number;

  constructor() {
    this.gameAreaWidth = GAME_WIDTH;
    this.gameAreaHeight = GAME_HEIGHT;

    // ... (paddle and ball initialization code from previous steps remains the same)
    const paddle1X = PADDLE_WIDTH;
    const paddle1Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2;
    this.paddle1 = new Paddle(paddle1X, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    const paddle2X = this.gameAreaWidth - PADDLE_WIDTH * 2;
    const paddle2Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2;
    this.paddle2 = new Paddle(paddle2X, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    const ballX = this.gameAreaWidth / 2;
    const ballY = this.gameAreaHeight / 2;
    const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
    const randomDirectionY = Math.random() < 0.5 ? -1 : 1;
    this.ball = new Ball(
      ballX,
      ballY,
      BALL_RADIUS,
      INITIAL_BALL_SPEED_X * randomDirectionX,
      INITIAL_BALL_SPEED_Y * randomDirectionY
    );

    this.score = { player1: 0, player2: 0 };

    console.log('New Game instance created and initialized.');
  }

  public updateBall(): void {
    this.ball.updatePosition(); // Ball updates its own x, y based on its velocity

    // Wall Collision Detection (Top and Bottom)
    // Check for collision with the top wall
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius; // Reposition ball to be exactly at the wall
      this.ball.velocityY *= -1; // Reverse the vertical velocity
    }
    // Check for collision with the bottom wall
    else if (this.ball.y + this.ball.radius > this.gameAreaHeight) {
      this.ball.y = this.gameAreaHeight - this.ball.radius; // Reposition ball
      this.ball.velocityY *= -1; // Reverse the vertical velocity
    }

    // Note: Side wall collisions (left and right) will be handled later
    // as they usually result in scoring points, not just a bounce.
  }

  // Other game logic methods will follow:
  // checkCollisions() (for ball-paddle)
  // updateScore() (when ball passes side walls)
  // resetBall()
  // getGameState()
}