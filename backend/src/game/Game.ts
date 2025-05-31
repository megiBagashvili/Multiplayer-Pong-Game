import { Paddle } from './Paddle';
import { Ball } from './Ball';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 7;
const INITIAL_BALL_SPEED_X = 5;
const INITIAL_BALL_SPEED_Y = 5;

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
    this.ball.updatePosition();
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.velocityY *= -1;
    } else if (this.ball.y + this.ball.radius > this.gameAreaHeight) {
      this.ball.y = this.gameAreaHeight - this.ball.radius;
      this.ball.velocityY *= -1;
    }
  }

  /**
   * Returns a snapshot of the current game state.
   * This will be useful for sending updates to clients.
   */
  public getGameState(): GameState {
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