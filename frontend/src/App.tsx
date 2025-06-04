import React, { useEffect, useState, useCallback, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { GameState, PaddleState, BallState, ScoreState, GameAreaState } from './types/GameState'; // Ensure GameState includes playerCount
import GameCanvas from './components/GameCanvas';
import GameLobby from './components/GameLobby';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const initialPaddle1State: PaddleState = { x: 10, y: 250, width: 10, height: 100 };
const initialPaddle2State: PaddleState = { x: 780, y: 250, width: 10, height: 100 };
const initialBallState: BallState = { x: 400, y: 300, radius: 7 };
const initialScoreState: ScoreState = { player1: 0, player2: 0 };
const initialGameAreaState: GameAreaState = { width: 800, height: 600 };

// This initial state is less critical now as gameState will be null initially
// and populated by the server.
const initialGameStateData: GameState = {
  paddle1: initialPaddle1State,
  paddle2: initialPaddle2State,
  ball: initialBallState,
  score: initialScoreState,
  gameArea: initialGameAreaState,
  isGameOver: false,
  winner: null,
  playerCount: 0,
};

const PLAYER_1_UP_KEY = 'w';
const PLAYER_1_DOWN_KEY = 's';
const PLAYER_2_UP_KEY = 'ArrowUp';
const PLAYER_2_DOWN_KEY = 'ArrowDown';

const isGameKey = (key: string): boolean => {
  return [PLAYER_1_UP_KEY, PLAYER_1_DOWN_KEY, PLAYER_2_UP_KEY, PLAYER_2_DOWN_KEY].includes(key);
};

interface PaddleMovePayload {
  playerId: 'player1' | 'player2';
  action: 'start' | 'stop';
  direction: 'up' | 'down';
}

type AppView = 'lobby' | 'waitingForPlayer' | 'inGame' | 'gameOver';
type PlayerRole = 'player1' | 'player2' | null;

function App() {
  const [appView, setAppView] = useState<AppView>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lobbyErrorMessage, setLobbyErrorMessage] = useState<string | null>(null);

  // Socket connection and core event listeners
  useEffect(() => {
    // This effect should run once on mount to establish the socket connection
    // and clean up on unmount.
    const newSocket = io(SOCKET_SERVER_URL);
    socketRef.current = newSocket;

    (window as any).socketForTesting = newSocket;
    // Initial connection log moved to 'connect' event handler for accuracy
    
    newSocket.on('connect', () => {
      console.log(`Frontend: Successfully connected! Socket ID: ${newSocket.id}`);
      // If the user was in a game and got disconnected, they might try to rejoin upon reconnect.
      // This is advanced. For now, a fresh connection takes them to the lobby if not already in a game flow.
      // If gameId and playerRole are already set (e.g. from a previous state before a brief disconnect),
      // we might want to inform the server.
      // For this project, if a disconnect happens, they'll likely go back to lobby.
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Frontend: Disconnected. Reason: ${reason}`);
      // Consider resetting to lobby if in game, to prevent stale UI
      // setAppView('lobby');
      // setGameId(null);
      // setPlayerRole(null);
      // setGameState(null);
      // setLobbyErrorMessage("You have been disconnected. Please try again.");
      // setIsLoading(false); // Ensure loading is false
    });

    newSocket.on('connect_error', (error) => {
      console.error('Frontend: Connection error:', error);
      setLobbyErrorMessage(`Connection Error: ${error.message}. Ensure the server is running.`);
      setAppView('lobby');
      setIsLoading(false);
    });

    newSocket.on('gameState', (newState: GameState) => {
      console.log('Frontend: Received gameState:', newState);
      setGameState(newState); // Always update with the latest state from server

      // Determine AppView based on the new game state
      if (newState.isGameOver) {
        setAppView('gameOver');
      } else if (newState.playerCount === 2) {
        setAppView('inGame');
      } else if (newState.playerCount === 1 && gameId && playerRole) { 
        // Only go to waiting if we know we are part of this game
        setAppView('waitingForPlayer');
      } else {
        // If gameState is received but doesn't fit other criteria (e.g. game just ended and playerCount is 0)
        // it might be stale or an edge case. For now, this logic covers main flows.
        // If gameId is null, it implies we are not actively in a game, so lobby is safe.
        if (!gameId) setAppView('lobby');
      }
    });
    
    // This event is not strictly necessary if createGame callback handles everything
    // newSocket.on('gameCreated', (data: { gameId: string }) => {
    //     console.log('Frontend: Game created by us (event)!', data);
    // });

    newSocket.on('playerLeft', (data: { disconnectedPlayerId: PlayerRole, newPlayerCount: number }) => {
        console.log(`Frontend: Player ${data.disconnectedPlayerId} left. New count: ${data.newPlayerCount}`);
        if (gameState && !gameState.isGameOver) { // gameState might be null if player leaves from lobby/waiting
            if (data.newPlayerCount < 2) {
                setAppView('waitingForPlayer');
                // Update local game state to reflect player count if not already done by a 'gameState' emit
                if(gameState) setGameState(prev => prev ? {...prev, playerCount: data.newPlayerCount} : null);
            }
        }
    });
    
    newSocket.on('gameOver', (data: { winner: PlayerRole, score: ScoreState }) => {
        console.log(`Frontend: Game Over event! Winner: ${data.winner}`);
        setAppView('gameOver');
        // The gameState event should also update the scores and winner details.
        // This event primarily signals the change in view.
    });

    return () => {
      console.log('Frontend: Disconnecting socket in main App.tsx useEffect cleanup...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('gameState');
      // newSocket.off('gameCreated');
      newSocket.off('playerLeft');
      newSocket.off('gameOver');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []); // <--- CRITICAL CHANGE: Empty dependency array

  // Keyboard input handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key) && (appView === 'inGame')) { // Allow input only when inGame
      event.preventDefault();
      setPressedKeys(prevKeys => {
        if (prevKeys[event.key]) return prevKeys;
        return { ...prevKeys, [event.key]: true };
      });
    }
  }, [appView]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (isGameKey(event.key) && (appView === 'inGame')) { // Allow input only when inGame
      event.preventDefault();
      setPressedKeys(prevKeys => {
        if (!prevKeys[event.key] && typeof prevKeys[event.key] !== 'boolean') return prevKeys;
        return { ...prevKeys, [event.key]: false };
      });
    }
  }, [appView]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Effect for emitting paddle movements
  const prevPressedKeysRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected || appView !== 'inGame' || !playerRole) {
      return;
    }

    const currentSocket = socketRef.current;
    // Determine which keys belong to the current player based on their role
    let keysToWatch: { up: string, down: string } | null = null;
    if (playerRole === 'player1') {
        keysToWatch = { up: PLAYER_1_UP_KEY, down: PLAYER_1_DOWN_KEY };
    } else if (playerRole === 'player2') {
        keysToWatch = { up: PLAYER_2_UP_KEY, down: PLAYER_2_DOWN_KEY };
    }

    if (!keysToWatch) return;

    const actions: Array<{key: string, direction: 'up' | 'down'}> = [
        { key: keysToWatch.up, direction: 'up'},
        { key: keysToWatch.down, direction: 'down'}
    ];

    actions.forEach(action => {
        const isPressed = !!pressedKeys[action.key];
        const wasPressed = !!prevPressedKeysRef.current[action.key];

        if (isPressed !== wasPressed) {
            const payload: PaddleMovePayload = {
                playerId: playerRole, // Send our assigned role
                action: isPressed ? 'start' : 'stop',
                direction: action.direction,
            };
            // console.log(`Emitting 'paddleMove':`, payload);
            currentSocket.emit('paddleMove', payload);
        }
    });
    prevPressedKeysRef.current = { ...pressedKeys };
  }, [pressedKeys, appView, playerRole]);

  const handleCreateGame = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
        setLobbyErrorMessage("Not connected to server. Cannot create game.");
        return;
    }
    setIsLoading(true);
    setLobbyErrorMessage(null);
    console.log("Frontend: Attempting to create game...");
    socketRef.current.emit('createGame', (response: { gameId?: string; error?: string }) => {
        // No setIsLoading(false) here, as joinGame will follow
        if (response && response.gameId) {
            console.log(`Frontend: Game creation initiated by server. Game ID: ${response.gameId}. Attempting to join...`);
            // Immediately try to join the game we just asked to create
            socketRef.current?.emit('joinGame', { gameId: response.gameId }, (joinResponse: { success: boolean; gameId?: string; playerRole?: PlayerRole; message?: string }) => {
                setIsLoading(false); // Set loading false after join attempt
                if (joinResponse && joinResponse.success && joinResponse.gameId && joinResponse.playerRole) {
                    setGameId(joinResponse.gameId);
                    setPlayerRole(joinResponse.playerRole);
                    // The 'gameState' event from the server will now dictate the appView.
                    // We can optimistically set to waiting, but gameState listener is key.
                    setAppView('waitingForPlayer'); 
                    console.log(`Frontend: Successfully joined own game ${joinResponse.gameId} as ${joinResponse.playerRole}`);
                } else {
                    setLobbyErrorMessage(joinResponse.message || "Failed to auto-join created game.");
                    setGameId(null); 
                }
            });
        } else {
            setIsLoading(false); // Set loading false if createGame itself failed
            console.error("Frontend: Failed to create game.", response?.error);
            setLobbyErrorMessage(response?.error || "Failed to create game. Unknown error.");
        }
    });
  }, []); // Empty dependency array is fine as socketRef.current is a ref.

  const handleJoinGame = useCallback((idToJoin: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
        setLobbyErrorMessage("Not connected to server. Cannot join game.");
        return;
    }
    if (!idToJoin.trim()) {
        setLobbyErrorMessage("Please enter a Game ID.");
        return;
    }
    setIsLoading(true);
    setLobbyErrorMessage(null);
    console.log(`Frontend: Attempting to join game ${idToJoin}...`);
    socketRef.current.emit('joinGame', { gameId: idToJoin }, (response: { success: boolean; gameId?: string; playerRole?: PlayerRole; message?: string }) => {
        setIsLoading(false);
        if (response && response.success && response.gameId && response.playerRole) {
            console.log(`Frontend: Successfully joined game ${response.gameId} as ${response.playerRole}`);
            setGameId(response.gameId);
            setPlayerRole(response.playerRole);
            // The 'gameState' event from the server will dictate the view.
            // Optimistically set to waitingForPlayer.
            setAppView('waitingForPlayer');
        } else {
            console.error("Frontend: Failed to join game.", response?.message);
            setLobbyErrorMessage(response?.message || "Failed to join game. Invalid ID or room full.");
        }
    });
  }, []); // Empty dependency array

  const handleReturnToLobby = () => {
    // If currently in a game, we might want to inform the server we are leaving.
    // For now, this is a client-side reset. Disconnect will handle server cleanup.
    // if (socketRef.current && gameId) {
    //   socketRef.current.emit('leaveGame', { gameId }); // Requires backend handler
    // }
    setAppView('lobby');
    setGameState(null);
    setGameId(null);
    setPlayerRole(null);
    setLobbyErrorMessage(null);
    setIsLoading(false);
  };

  const renderContent = () => {
    switch (appView) {
      case 'lobby':
        return (
            <GameLobby
                onCreateGame={handleCreateGame}
                onJoinGame={handleJoinGame}
                isLoading={isLoading}
                errorMessage={lobbyErrorMessage}
            />
        );
      case 'waitingForPlayer':
        return (
          <div className="waiting-screen">
            <h2>Waiting for Opponent...</h2>
            {gameId && <p>Game ID: <strong>{gameId}</strong> (Share this with your friend!)</p>}
            {playerRole && <p>You are: <strong>{playerRole}</strong></p>}
            {gameState && <GameCanvas gameState={gameState} />}
            <button onClick={handleReturnToLobby} className="lobby-button">Return to Lobby</button>
          </div>
        );
      case 'inGame':
        if (!gameState) return <p>Loading game state...</p>;
        return (
          <>
            <div className="score-display">
              Player 1: {gameState.score.player1} | Player 2: {gameState.score.player2}
              <p style={{fontSize: '0.8em', margin: '5px 0'}}>You are: {playerRole} | Game ID: {gameId}</p>
            </div>
            <GameCanvas gameState={gameState} />
            {/* Optionally add a "Leave Game" button here that calls handleReturnToLobby */}
          </>
        );
      case 'gameOver':
        return (
          <div className="game-over-screen">
            <h2>Game Over!</h2>
            {gameState && gameState.winner && <p>Winner: {gameState.winner === playerRole ? `You (${gameState.winner})` : gameState.winner}!</p>}
            {gameState && <p>Final Score: Player 1: {gameState.score.player1} - Player 2: {gameState.score.player2}</p>}
            <button onClick={handleReturnToLobby} className="lobby-button">Play Again (Lobby)</button>
          </div>
        );
      default:
        return <p>Loading or unknown application state...</p>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {appView !== 'lobby' && <img src={logo} className="App-logo-small" alt="logo" />}
        <h1>Ping Pong Game</h1>
        {renderContent()}
      </header>
    </div>
  );
}

export default App;
