// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { GameState, PaddleState, BallState, ScoreState, GameAreaState } from './types/GameState';
import GameCanvas from './components/GameCanvas';

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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Ping Pong Game</p>

        {gameState ? (
          <>
            {/* Game Score Display - can remain here or be part of a HUD component later */}
            <div style={{ marginBottom: '10px', color: 'white', fontSize: '24px' }}>
              Player 1: {gameState.score.player1} | Player 2: {gameState.score.player2}
            </div>

            {/* Render the GameCanvas component and pass the gameState */}
            <GameCanvas gameState={gameState} />
          </>
        ) : (
          <p>Loading game state or connecting...</p>
        )}
      </header>
    </div>
  );
}

export default App;