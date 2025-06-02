import React, { useEffect, useState, useCallback } from 'react';
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

const PLAYER_1_UP_KEY = 'w';
const PLAYER_1_DOWN_KEY = 's';
const PLAYER_2_UP_KEY = 'ArrowUp';
const PLAYER_2_DOWN_KEY = 'ArrowDown';
const isGameKey = (key: string): boolean => {
  return [PLAYER_1_UP_KEY, PLAYER_1_DOWN_KEY, PLAYER_2_UP_KEY, PLAYER_2_DOWN_KEY].includes(key);
};

function App() {
  const [gameState, setGameState] = useState<GameState | null>(initialGameStateData);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL);
    socket.on('connect', () => console.log(`Frontend: Successfully connected! Socket ID: ${socket.id}`));
    socket.on('disconnect', (reason) => console.log(`Frontend: Disconnected. Reason: ${reason}`));
    socket.on('connect_error', (error) => console.error('Frontend: Connection error:', error));
    socket.on('gameState', (newState: GameState) => setGameState(newState));
    return () => {
      console.log('Frontend: Disconnecting socket...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('gameState');
      socket.disconnect();
    };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key)) {
      event.preventDefault(); 
      setPressedKeys(prevKeys => {
        if (prevKeys[event.key]) {
          return prevKeys;
        }
        console.log('Key Down:', event.key);
        return {
          ...prevKeys,
          [event.key]: true,
        };
      });
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key)) {
      event.preventDefault();
      setPressedKeys(prevKeys => {
        if (!prevKeys[event.key] && typeof prevKeys[event.key] !== 'boolean') {
             return prevKeys;
        }
        console.log('Key Up:', event.key);
        return {
          ...prevKeys,
          [event.key]: false,
        };
      });
    }
  }, []);

  useEffect(() => {
    console.log('Attaching keyboard listeners');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      console.log('Removing keyboard listeners');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);


  // Optional: Log pressedKeys state for verification (keep if you like for testing this step)
  useEffect(() => {
    console.log('Currently pressed keys:', pressedKeys);
  }, [pressedKeys]);

  return (
    <div className="App">
      {/* ... (rest of your JSX remains the same) ... */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Ping Pong Game</p>
        {/* For debugging: Display pressed keys */}
        {/* <div>Pressed Keys: {JSON.stringify(pressedKeys)}</div> */}

        {gameState ? (
          <>
            <div className="score-display">
              Player 1: {gameState.score.player1} | Player 2: {gameState.score.player2}
            </div>
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