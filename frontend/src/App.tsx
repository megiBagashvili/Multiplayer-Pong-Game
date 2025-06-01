// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { GameState, PaddleState, BallState, ScoreState, GameAreaState } from './types/GameState';

const SOCKET_SERVER_URL = 'http://localhost:3001';

// Define an initial state for the game.
// These values should ideally match or be close to the backend's initial state
// to avoid a jarring update on first connection.
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
  // State variable to hold the current game state
  const [gameState, setGameState] = useState<GameState | null>(initialGameStateData);
  // We can also have a loading/connection status state if needed
  // const [isConnected, setIsConnected] = useState<boolean>(false);


  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log(`Frontend: Successfully connected to Socket.IO server! Socket ID: ${socket.id}`);
      // setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Frontend: Disconnected from Socket.IO server. Reason: ${reason}`);
      // setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Frontend: Socket.IO connection error:', error);
      // setIsConnected(false);
    });

    // === New: Event listener for 'gameState' ===
    socket.on('gameState', (newState: GameState) => {
      // console.log('Frontend: Received gameState update:', newState); // For debugging
      setGameState(newState); // Update the frontend's state with the received data
    });
    // === End New ===

    // Cleanup on component unmount
    return () => {
      console.log('Frontend: Disconnecting Socket.IO socket...');
      // It's good practice to remove specific listeners before disconnecting
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('gameState'); // Make sure to turn off the gameState listener
      socket.disconnect();
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  // For now, we can log the gameState to see it change (optional)
  // useEffect(() => {
  //   if (gameState) {
  //     console.log("Frontend: Current game state in component:", gameState);
  //   }
  // }, [gameState]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>
          Socket.IO connection is being managed. Check console for logs.
        </p>
        {/* In the next step, we will render elements based on gameState */}
        {gameState && (
          <div>
            <p>Ball X: {gameState.ball.x}, Ball Y: {gameState.ball.y}</p>
            <p>Score: P1: {gameState.score.player1} - P2: {gameState.score.player2}</p>
          </div>
        )}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;