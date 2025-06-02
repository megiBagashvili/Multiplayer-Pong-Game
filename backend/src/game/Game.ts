import { Paddle } from './Paddle';
import { Ball } from './Ball';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 7;
const INITIAL_BALL_SPEED_X = 5;
const INITIAL_BALL_SPEED_Y = 5;
const MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT = 7;

interface Score {
  player1: number;
  player2: number;
}

export interface GameState {
  paddle1: { x: number; y: number; width: number; height: number };
  paddle2: { x: number; y: number; width: number; height: number };
  ball: { x: number; y: number; radius: number };
  score: Score;
  gameArea: { width: number; height: number };
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

    const paddle1X = PADDLE_WIDTH;
    const paddle1Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2;
    this.paddle1 = new Paddle(paddle1X, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    const paddle2X = this.gameAreaWidth - PADDLE_WIDTH - PADDLE_WIDTH;
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
    // 1. Update ball's raw position based on its current velocity
    this.ball.updatePosition();

    // 2. Check for collisions with paddles
    let collidedWithPaddle = false;

    // Check collision with paddle1 (left paddle)
    if (this.ball.velocityX < 0) { // Ball is moving left
      if (
        this.ball.x - this.ball.radius < this.paddle1.x + this.paddle1.width && // Ball's left edge is to the left of paddle's right edge
        this.ball.x + this.ball.radius > this.paddle1.x &&                     // Ball's right edge is to the right of paddle's left edge
        this.ball.y + this.ball.radius > this.paddle1.y &&                     // Ball's bottom edge is below paddle's top edge
        this.ball.y - this.ball.radius < this.paddle1.y + this.paddle1.height  // Ball's top edge is above paddle's bottom edge
      ) {
        // Collision with paddle1
        this.ball.x = this.paddle1.x + this.paddle1.width + this.ball.radius; // Snap ball to paddle surface
        this.ball.velocityX *= -1; // Reverse horizontal direction

        // Calculate bounce angle effect on velocityY
        // relativeIntersectY: where the ball hit the paddle relative to the paddle's center
        // (-1 means top of paddle, 0 means center, 1 means bottom of paddle)
        let relativeIntersectY = (this.paddle1.y + (this.paddle1.height / 2)) - this.ball.y;
        let normalizedRelativeIntersectY = relativeIntersectY / (this.paddle1.height / 2);
        this.ball.velocityY = normalizedRelativeIntersectY * -MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT;

        collidedWithPaddle = true;
      }
    }
    // Check collision with paddle2 (right paddle)
    else if (this.ball.velocityX > 0) { // Ball is moving right
      if (
        this.ball.x + this.ball.radius > this.paddle2.x &&                         // Ball's right edge is to the right of paddle's left edge
        this.ball.x - this.ball.radius < this.paddle2.x + this.paddle2.width &&   // Ball's left edge is to the left of paddle's right edge
        this.ball.y + this.ball.radius > this.paddle2.y &&                         // Ball's bottom edge is below paddle's top edge
        this.ball.y - this.ball.radius < this.paddle2.y + this.paddle2.height    // Ball's top edge is above paddle's bottom edge
      ) {
        // Collision with paddle2
        this.ball.x = this.paddle2.x - this.ball.radius; // Snap ball to paddle surface
        this.ball.velocityX *= -1; // Reverse horizontal direction

        // Calculate bounce angle effect on velocityY
        let relativeIntersectY = (this.paddle2.y + (this.paddle2.height / 2)) - this.ball.y;
        let normalizedRelativeIntersectY = relativeIntersectY / (this.paddle2.height / 2);
        this.ball.velocityY = normalizedRelativeIntersectY * -MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT;
        
        collidedWithPaddle = true;
      }
    }

    // 3. Check for collisions with top/bottom walls (always do this after paddle checks)
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius; // Snap to wall
      if (this.ball.velocityY < 0) { // Only reverse if it's actually heading into the wall
        this.ball.velocityY *= -1;
      }
    } else if (this.ball.y + this.ball.radius > this.gameAreaHeight) {
      this.ball.y = this.gameAreaHeight - this.ball.radius; // Snap to wall
      if (this.ball.velocityY > 0) { // Only reverse if it's actually heading into the wall
        this.ball.velocityY *= -1;
      }
    }

    // Scoring (ball passes left or right walls) will be handled in To-do 3.2.3
  }

  public getGameState(): GameState {
    // ... (this method remains the same)
    return {
      paddle1: {
        x: this.paddle1.x,
        y: this.paddle1.y,
        width: this.paddle1.width,
        height: this.paddle1.height,
      },
      paddle2: {
        x: this.paddle2.x,
        y: this.paddle2.y,
        width: this.paddle2.width,
        height: this.paddle2.height,
      },
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        radius: this.ball.radius,
      },
      score: { ...this.score },
      gameArea: {
        width: this.gameAreaWidth,
        height: this.gameAreaHeight,
      }
    };
  }
}