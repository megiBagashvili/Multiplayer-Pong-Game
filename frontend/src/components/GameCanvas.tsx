import React from 'react';
import { GameState, PaddleState, BallState } from '../types/GameState';
import './GameCanvas.css';

interface GameCanvasProps {
  gameState: GameState | null;
  scale?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, scale = 1 }) => {
  if (!gameState) {
    return <div className="game-canvas-placeholder">Loading game state...</div>;
  }

  const getPaddleDynamicStyles = (paddle: PaddleState): React.CSSProperties => ({
    left: `${paddle.x}px`,
    top: `${paddle.y}px`,
    width: `${paddle.width}px`,
    height: `${paddle.height}px`,
  });

  const getBallDynamicStyles = (ball: BallState): React.CSSProperties => ({
    left: `${ball.x - ball.radius}px`,
    top: `${ball.y - ball.radius}px`,
    width: `${ball.radius * 2}px`,
    height: `${ball.radius * 2}px`,
  });

  const scalerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
  };

  return (
    <div className="game-canvas-scaler" style={scalerStyle}>
      <div className="game-area">
        <div
          className="paddle"
          style={getPaddleDynamicStyles(gameState.paddle1)}
          data-testid="paddle-1"
        ></div>
        <div
          className="paddle"
          style={getPaddleDynamicStyles(gameState.paddle2)}
          data-testid="paddle-2"
        ></div>
        <div
          className="ball"
          style={getBallDynamicStyles(gameState.ball)}
          data-testid="ball"
        ></div>
      </div>
    </div>
  );
};

export default GameCanvas;