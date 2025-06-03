import { Paddle } from "./Paddle";
import { Ball } from "./Ball";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 7;
const INITIAL_BALL_SPEED_X = 5;
const INITIAL_BALL_SPEED_Y = 2;
const MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT = 7;
const WINNING_SCORE = 2;

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
  isGameOver: boolean;
  winner: "player1" | "player2" | null;
}

export class Game {
  public paddle1: Paddle;
  public paddle2: Paddle;
  public ball: Ball;
  public score: Score;
  public gameAreaWidth: number;
  public gameAreaHeight: number;
  public isGameOver: boolean;
  public winner: "player1" | "player2" | null;

  constructor() {
    this.gameAreaWidth = GAME_WIDTH;
    this.gameAreaHeight = GAME_HEIGHT;

    const paddle1X = PADDLE_WIDTH;
    const paddle1Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2;
    this.paddle1 = new Paddle(paddle1X, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    const paddle2X = this.gameAreaWidth - PADDLE_WIDTH - PADDLE_WIDTH;
    const paddle2Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2;
    this.paddle2 = new Paddle(paddle2X, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    this.score = { player1: 0, player2: 0 };
    this.isGameOver = false;
    this.winner = null;

    this.ball = new Ball(
      this.gameAreaWidth / 2,
      this.gameAreaHeight / 2,
      BALL_RADIUS,
      0,
      0
    );
    this.resetBallAndServe(Math.random() < 0.5);

    console.log("New Game instance created and initialized.");
  }

  private stopGame(): void {
    // Optional: Move ball to center and stop it completely
    // this.ball.x = this.gameAreaWidth / 2;
    // this.ball.y = this.gameAreaHeight / 2;
    this.ball.velocityX = 0;
    this.ball.velocityY = 0;
    console.log(
      `Game Over! Winner: ${this.winner}. Final Score: P1: ${this.score.player1} - P2: ${this.score.player2}`
    );
  }

  private resetBallAndServe(serveToRightPlayer: boolean): void {
    if (this.isGameOver) {
      this.stopGame();
      return;
    }

    const ballX = this.gameAreaWidth / 2;
    const ballY = this.gameAreaHeight / 2;
    let newVelocityX = INITIAL_BALL_SPEED_X;
    if (!serveToRightPlayer) {
      newVelocityX *= -1;
    }
    const newVelocityY =
      (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED_Y * Math.random();
    this.ball.reset(ballX, ballY, newVelocityX, newVelocityY);
    console.log(
      `Ball reset. Serving to ${
        serveToRightPlayer ? "Player 2 (right)" : "Player 1 (left)"
      }.`
    );
  }

  public updateBall(): void {
    if (this.isGameOver) {
      return;
    }

    this.ball.updatePosition();

    // Paddle collision logic (as before)
    // ... (your existing paddle collision logic)
    if (this.ball.velocityX < 0) {
      // Moving left
      if (
        this.ball.x - this.ball.radius < this.paddle1.x + this.paddle1.width &&
        this.ball.x + this.ball.radius > this.paddle1.x &&
        this.ball.y + this.ball.radius > this.paddle1.y &&
        this.ball.y - this.ball.radius < this.paddle1.y + this.paddle1.height
      ) {
        this.ball.x = this.paddle1.x + this.paddle1.width + this.ball.radius;
        this.ball.velocityX *= -1;
        let relY = this.paddle1.y + this.paddle1.height / 2 - this.ball.y;
        this.ball.velocityY =
          (relY / (this.paddle1.height / 2)) *
          -MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT;
      }
    } else if (this.ball.velocityX > 0) {
      if (
        this.ball.x + this.ball.radius > this.paddle2.x &&
        this.ball.x - this.ball.radius < this.paddle2.x + this.paddle2.width &&
        this.ball.y + this.ball.radius > this.paddle2.y &&
        this.ball.y - this.ball.radius < this.paddle2.y + this.paddle2.height
      ) {
        this.ball.x = this.paddle2.x - this.ball.radius;
        this.ball.velocityX *= -1;
        let relY = this.paddle2.y + this.paddle2.height / 2 - this.ball.y;
        this.ball.velocityY =
          (relY / (this.paddle2.height / 2)) *
          -MAX_BALL_SPEED_Y_AFTER_PADDLE_HIT;
      }
    }

    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      if (this.ball.velocityY < 0) this.ball.velocityY *= -1;
    } else if (this.ball.y + this.ball.radius > this.gameAreaHeight) {
      this.ball.y = this.gameAreaHeight - this.ball.radius;
      if (this.ball.velocityY > 0) this.ball.velocityY *= -1;
    }

    let playerScored = false;
    if (this.ball.x + this.ball.radius < 0) {
      this.score.player2++;
      console.log(
        `Player 2 scores! Score: P1: ${this.score.player1} - P2: ${this.score.player2}`
      );
      playerScored = true;
      if (this.score.player2 >= WINNING_SCORE) {
        this.isGameOver = true;
        this.winner = "player2";
      }
      this.resetBallAndServe(false);
    } else if (this.ball.x - this.ball.radius > this.gameAreaWidth) {
      this.score.player1++;
      console.log(
        `Player 1 scores! Score: P1: ${this.score.player1} - P2: ${this.score.player2}`
      );
      playerScored = true;
      if (this.score.player1 >= WINNING_SCORE) {
        this.isGameOver = true;
        this.winner = "player1";
      }
      this.resetBallAndServe(true);
    }

    if (this.isGameOver && playerScored) {
      this.stopGame();
    }
  }

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
      ball: { x: this.ball.x, y: this.ball.y, radius: this.ball.radius },
      score: { ...this.score },
      gameArea: { width: this.gameAreaWidth, height: this.gameAreaHeight },
      isGameOver: this.isGameOver,
      winner: this.winner,
    };
  }
}
