// frontend/src/components/GameCanvas.tsx
import React from 'react';
import { GameState, PaddleState, BallState } from '../types/GameState';

interface GameCanvasProps {
  gameState: GameState | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const gameAreaStyles: React.CSSProperties = {
    width: `${gameState.gameArea.width}px`,
    height: `${gameState.gameArea.height}px`,
    backgroundColor: 'black',
    position: 'relative',
    border: '2px solid white',
    margin: '0 auto',
  };

  const getPaddleStyles = (paddle: PaddleState): React.CSSProperties => ({
    position: 'absolute',
    left: `${paddle.x}px`,
    top: `${paddle.y}px`,
    width: `${paddle.width}px`,
    height: `${paddle.height}px`,
    backgroundColor: 'lightgray',
  });

  const getBallStyles = (ball: BallState): React.CSSProperties => ({
    position: 'absolute',
    left: `${ball.x - ball.radius}px`,
    top: `${ball.y - ball.radius}px`,
    width: `${ball.radius * 2}px`,
    height: `${ball.radius * 2}px`,
    backgroundColor: 'white',
    borderRadius: '50%',
  });

  return (
    <div style={gameAreaStyles}>
      {/* Paddle 1 */}
      <div style={getPaddleStyles(gameState.paddle1)}></div>
      {/* Paddle 2 */}
      <div style={getPaddleStyles(gameState.paddle2)}></div>
      {/* Ball */}
      <div style={getBallStyles(gameState.ball)}></div>
    </div>
  );
};

export default GameCanvas;