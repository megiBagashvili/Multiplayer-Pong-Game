export interface PaddleState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BallState {
  x: number;
  y: number;
  radius: number;
}

export interface ScoreState {
  player1: number;
  player2: number;
}

export interface GameAreaState {
  width: number;
  height: number;
}

export interface GameState {
  paddle1: PaddleState;
  paddle2: PaddleState;
  ball: BallState;
  score: ScoreState;
  gameArea: GameAreaState;
  isGameOver: boolean;
  winner: 'player1' | 'player2' | null;
  playerCount: number;
}