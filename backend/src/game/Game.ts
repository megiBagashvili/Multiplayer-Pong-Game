// backend/src/game/Game.ts

import { Paddle } from './Paddle'; // Import the Paddle class
import { Ball } from './Ball';     // Import the Ball class

// Game constants - these could be made configurable later
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 10; // Speed for paddle movement (can be adjusted)
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

    // Initialize Paddles
    // Paddle 1 (left)
    const paddle1X = PADDLE_WIDTH; // A bit of offset from the left wall
    const paddle1Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2; // Centered vertically
    this.paddle1 = new Paddle(paddle1X, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Paddle 2 (right)
    const paddle2X = this.gameAreaWidth - PADDLE_WIDTH * 2; // A bit of offset from the right wall
    const paddle2Y = (this.gameAreaHeight - PADDLE_HEIGHT) / 2; // Centered vertically
    this.paddle2 = new Paddle(paddle2X, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Initialize Ball
    const ballX = this.gameAreaWidth / 2;  // Center of the game area
    const ballY = this.gameAreaHeight / 2; // Center of the game area

    // Determine initial ball direction randomly (optional, or just pick one)
    // For example, can serve to player 1 or player 2
    const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
    const randomDirectionY = Math.random() < 0.5 ? -1 : 1;

    this.ball = new Ball(
      ballX,
      ballY,
      BALL_RADIUS,
      INITIAL_BALL_SPEED_X * randomDirectionX, // Initial horizontal velocity
      INITIAL_BALL_SPEED_Y * randomDirectionY  // Initial vertical velocity
    );

    // Initialize Score
    this.score = { player1: 0, player2: 0 };

    console.log('New Game instance created and initialized.');
    // You can log the initial state for debugging if you want:
    // console.log('Initial Paddle 1:', this.paddle1);
    // console.log('Initial Paddle 2:', this.paddle2);
    // console.log('Initial Ball:', this.ball);
    // console.log('Initial Score:', this.score);
  }

  // Game logic methods will be added here in subsequent tasks:
  // updateBallPosition() -> To-do 1.2.5
  // checkCollisions()
  // updateScore()
  // resetBall()
  // getGameState() -> To-do 1.2.7
}