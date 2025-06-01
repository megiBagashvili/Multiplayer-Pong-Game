import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { GameState, PaddleState, BallState, ScoreState, GameAreaState } from './types/GameState';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const initialPaddle1State: PaddleState = { x: 10, y: 250, width: 10, height: 100 };
const initialPaddle2State: PaddleState = { x: 780, y: 250, width: 10, height: 100 };
const initialBallState: BallState = { x: 400, y: 300, radius: 7 };
const initialScoreState: ScoreState = { player1: 0, player2: 0 };
const initialGameAreaState: GameAreaState = { width: 800, height: 600 };

const initialGameStateData: GameState = {
  paddle1: initialPaddle1State,
  paddle2: initialPaddle2State,
  ball: initialBallState,
  score: initialScoreState,
  gameArea: initialGameAreaState,
};

function App() {
  const [gameState, setGameState] = useState<GameState | null>(initialGameStateData);

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log(`Frontend: Successfully connected to Socket.IO server! Socket ID: ${socket.id}`);
    });
    socket.on('disconnect', (reason) => {
      console.log(`Frontend: Disconnected from Socket.IO server. Reason: ${reason}`);
    });
    socket.on('connect_error', (error) => {
      console.error('Frontend: Socket.IO connection error:', error);
    });
    socket.on('gameState', (newState: GameState) => {
      setGameState(newState);
    });

    return () => {
      console.log('Frontend: Disconnecting Socket.IO socket...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('gameState');
      socket.disconnect();
    };
  }, []);

  // Define styles (can be moved to a separate CSS file later or refined)
  // We define them here so they can access gameState if needed, though for fixed sizes it's not strictly necessary.
  // For dynamic properties (like left, top), they need to be applied directly in the JSX or be functions.

  const gameAreaStyles: React.CSSProperties = gameState ? {
    width: `${gameState.gameArea.width}px`,
    height: `${gameState.gameArea.height}px`,
    backgroundColor: 'black',
    position: 'relative',
    border: '2px solid white',
    margin: '20px auto',
  } : {};

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
    borderRadius: '50%', // Makes it a circle
  });


  return (
    <div className="App">
      <header className="App-header">
        {/* You can keep or remove the default React logo and text */}
        <img src={logo} className="App-logo" alt="logo" />
        <p>Ping Pong Game</p>

        {gameState ? (
          <>
            {/* Game Score Display */}
            <div style={{ marginBottom: '10px', color: 'white', fontSize: '24px' }}>
              Player 1: {gameState.score.player1} | Player 2: {gameState.score.player2}
            </div>

            {/* Game Area */}
            <div style={gameAreaStyles}>
              {/* Paddle 1 */}
              <div style={getPaddleStyles(gameState.paddle1)}></div>
              {/* Paddle 2 */}
              <div style={getPaddleStyles(gameState.paddle2)}></div>
              {/* Ball */}
              <div style={getBallStyles(gameState.ball)}></div>
            </div>
          </>
        ) : (
          <p>Loading game state or connecting...</p>
        )}
      </header>
    </div>
  );
}

export default App;