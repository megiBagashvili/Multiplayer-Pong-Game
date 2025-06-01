// frontend/src/components/GameCanvas.tsx
import React from 'react';
import { GameState, PaddleState, BallState } from '../types/GameState';
import './GameCanvas.css'; // Import the CSS file

interface GameCanvasProps {
  gameState: GameState | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  if (!gameState) {
    return <div>Loading game...</div>;
  }

  // Dynamic styles that depend on gameState values
  const gameAreaDynamicStyles: React.CSSProperties = {
    width: `${gameState.gameArea.width}px`,
    height: `${gameState.gameArea.height}px`,
  };

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

  return (
    <div className="game-area" style={gameAreaDynamicStyles}>
      <div
        className="paddle"
        style={getPaddleDynamicStyles(gameState.paddle1)}
        data-testid="paddle-1" // Optional: for testing
      ></div>
      <div
        className="paddle"
        style={getPaddleDynamicStyles(gameState.paddle2)}
        data-testid="paddle-2" // Optional: for testing
      ></div>
      <div
        className="ball"
        style={getBallDynamicStyles(gameState.ball)}
        data-testid="ball" // Optional: for testing
      ></div>
    </div>
  );
};

export default GameCanvas;