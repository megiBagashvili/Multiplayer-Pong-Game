import React, { useEffect, useState, useCallback, useRef } from 'react';
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

interface PaddleMovePayload {
  // Later, we'll get the actual player ID (or side) from the server upon connection/room join
  // For now, we derive it based on the key pressed.
  playerId: 'player1' | 'player2';
  action: 'start' | 'stop';
  direction: 'up' | 'down';
}


function App() {
  const [gameState, setGameState] = useState<GameState | null>(initialGameStateData);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    socketRef.current = newSocket;

    newSocket.on('connect', () => console.log(`Frontend: Successfully connected! Socket ID: ${newSocket.id}`));
    newSocket.on('disconnect', (reason) => console.log(`Frontend: Disconnected. Reason: ${reason}`));
    newSocket.on('connect_error', (error) => console.error('Frontend: Connection error:', error));
    newSocket.on('gameState', (newState: GameState) => setGameState(newState));

    return () => {
      console.log('Frontend: Disconnecting socket...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('gameState');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key)) {
      event.preventDefault();
      setPressedKeys(prevKeys => {
        if (prevKeys[event.key]) return prevKeys;
        console.log('Key Down:', event.key);
        return { ...prevKeys, [event.key]: true };
      });
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key)) {
      event.preventDefault();
      setPressedKeys(prevKeys => {
        if (!prevKeys[event.key] && typeof prevKeys[event.key] !== 'boolean') return prevKeys;
        console.log('Key Up:', event.key);
        return { ...prevKeys, [event.key]: false };
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const prevPressedKeysRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.log('Socket not connected, skipping paddle move emit.');
      return;
    }

    const currentSocket = socketRef.current;

    const keyActions: Record<string, { playerId: 'player1' | 'player2'; direction: 'up' | 'down' }> = {
      [PLAYER_1_UP_KEY]: { playerId: 'player1', direction: 'up' },
      [PLAYER_1_DOWN_KEY]: { playerId: 'player1', direction: 'down' },
      [PLAYER_2_UP_KEY]: { playerId: 'player2', direction: 'up' },
      [PLAYER_2_DOWN_KEY]: { playerId: 'player2', direction: 'down' },
    };

    for (const key of Object.keys(keyActions)) {
      const keyDetail = keyActions[key];
      const isPressed = !!pressedKeys[key];
      const wasPressed = !!prevPressedKeysRef.current[key];

      if (isPressed !== wasPressed) {
        const payload: PaddleMovePayload = {
          playerId: keyDetail.playerId,
          action: isPressed ? 'start' : 'stop',
          direction: keyDetail.direction,
        };
        console.log(`Emitting 'paddleMove':`, payload);
        currentSocket.emit('paddleMove', payload);
      }
    }

    prevPressedKeysRef.current = { ...pressedKeys };

  }, [pressedKeys]);

  return (
    <div className="App">
      {/* ... (JSX remains the same as before) ... */}
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