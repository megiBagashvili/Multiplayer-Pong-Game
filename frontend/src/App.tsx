import React, { useEffect, useState, useCallback, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import { io, Socket } from "socket.io-client";
import {
  GameState,
  PaddleState,
  BallState,
  ScoreState,
} from "./types/GameState";
import GameCanvas from "./components/GameCanvas";
import GameLobby from "./components/GameLobby";

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:3001';
const NATIVE_GAME_WIDTH = 800;
const NATIVE_GAME_HEIGHT = 600;

const PLAYER_1_UP_KEY = "w";
const PLAYER_1_DOWN_KEY = "s";
const PLAYER_2_UP_KEY = "ArrowUp";
const PLAYER_2_DOWN_KEY = "ArrowDown";

const isGameKey = (key: string): boolean => {
  return [
    PLAYER_1_UP_KEY,
    PLAYER_1_DOWN_KEY,
    PLAYER_2_UP_KEY,
    PLAYER_2_DOWN_KEY,
  ].includes(key);
};

interface PaddleMovePayload {
  playerId: "player1" | "player2";
  action: "start" | "stop";
  direction: "up" | "down";
}

type AppView = "lobby" | "waitingForPlayer" | "inGame" | "gameOver";
type PlayerRole = "player1" | "player2" | null;


function App() {
  const [appView, _setAppView] = useState<AppView>("lobby");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);
  const [gameId, _setGameId] = useState<string | null>(null);
  const [playerRole, _setPlayerRole] = useState<PlayerRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lobbyErrorMessage, setLobbyErrorMessage] = useState<string | null>(null);

  const [gameScale, setGameScale] = useState(1);
  const gameCanvasWrapperRef = useRef<HTMLDivElement>(null);

  const appViewRef = useRef(appView);
  const gameIdRef = useRef(gameId);
  const playerRoleRef = useRef(playerRole);

  const setAppView = (newView: AppView) => {
    console.log(`[setAppView] Changing from ${appViewRef.current} to ${newView}`);
    appViewRef.current = newView;
    _setAppView(newView);
  };
  const setGameId = (newId: string | null) => {
    gameIdRef.current = newId;
    _setGameId(newId);
  };
  const setPlayerRole = (newRole: PlayerRole | null) => {
    console.log(`[setPlayerRole] Setting role to: ${newRole}`);
    playerRoleRef.current = newRole;
    _setPlayerRole(newRole);
  };

  useEffect(() => {
    const calculateScale = () => {
      if (gameCanvasWrapperRef.current) {
        const wrapper = gameCanvasWrapperRef.current;
        const wrapperWidth = wrapper.offsetWidth;
        const wrapperHeight = wrapper.offsetHeight;

        if (wrapperWidth > 0 && wrapperHeight > 0) {
          const scaleBasedOnWidth = wrapperWidth / NATIVE_GAME_WIDTH;
          const scaleBasedOnHeight = wrapperHeight / NATIVE_GAME_HEIGHT;
          const newScale = Math.min(scaleBasedOnWidth, scaleBasedOnHeight);
          setGameScale(Math.max(0.1, Math.min(newScale, 1.2))); 
        }
      }
    };

    if (appViewRef.current !== 'lobby' && gameCanvasWrapperRef.current) {
      calculateScale(); 
      
      const resizeObserver = new ResizeObserver(calculateScale);
      resizeObserver.observe(gameCanvasWrapperRef.current);
      window.addEventListener('resize', calculateScale); 
      
      return () => {
        window.removeEventListener('resize', calculateScale);
        if (gameCanvasWrapperRef.current) {
          resizeObserver.unobserve(gameCanvasWrapperRef.current);
        }
        resizeObserver.disconnect();
      };
    } else {
      setGameScale(1); 
    }
  }, [appView]); 

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    socketRef.current = newSocket;
    (window as any).socketForTesting = newSocket;

    newSocket.on("connect", () => {
      console.log(
        `Frontend: Successfully connected! Socket ID: ${newSocket.id}`
      );
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`Frontend: Disconnected. Reason: ${reason}`);
      if (
        appViewRef.current === "inGame" ||
        appViewRef.current === "waitingForPlayer"
      ) {
        setLobbyErrorMessage("You have been disconnected. Please try again.");
        setAppView("lobby");
        setGameId(null);
        setPlayerRole(null);
        setGameState(null);
        setIsLoading(false);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Frontend: Connection error:", error);
      setLobbyErrorMessage(
        `Connection Error: ${error.message}. Ensure the server is running.`
      );
      setAppView("lobby");
      setIsLoading(false);
    });

    newSocket.on("gameState", (newState: GameState) => {
      const currentAppView = appViewRef.current;
      const currentGameId = gameIdRef.current;
      const currentPlayerRole = playerRoleRef.current;
      setGameState(newState);

      if (currentAppView === "lobby" && currentGameId === null) {
        return;
      }

      if (currentGameId) {
        if (newState.isGameOver) {
          setAppView("gameOver");
        } else if (newState.playerCount === 2 && currentPlayerRole) {
          setAppView("inGame");
        } else if (newState.playerCount === 1 && currentPlayerRole) {
          setAppView("waitingForPlayer");
        } else if (newState.playerCount === 0) {
          setLobbyErrorMessage("The game session has ended.");
          setAppView("lobby");
          setGameId(null);
          setPlayerRole(null);
        }
      } else {
        if (
          !newState.isGameOver &&
          newState.playerCount > 0 &&
          currentPlayerRole
        ) {
          if (newState.playerCount === 1) setAppView("waitingForPlayer");
          if (newState.playerCount === 2) setAppView("inGame");
        }
      }
    });

    newSocket.on(
      "playerLeft",
      (data: { disconnectedPlayerId: PlayerRole; newPlayerCount: number }) => {
        const currentGameId = gameIdRef.current;
        console.log(
          `Frontend: Player ${data.disconnectedPlayerId} left game ${currentGameId}. New count: ${data.newPlayerCount}`
        );

        if (gameState && currentGameId) {
          if (!gameState.isGameOver && data.newPlayerCount < 2) {
            setAppView("waitingForPlayer");
            setGameState((prev) =>
              prev ? { ...prev, playerCount: data.newPlayerCount } : null
            );
          } else if (data.newPlayerCount === 0) {
            setLobbyErrorMessage("Opponent left and the game has ended.");
            setAppView("lobby");
            setGameId(null);
            setPlayerRole(null);
          }
        }
      }
    );

    newSocket.on(
      "gameOver",
      (data: { winner: PlayerRole; score: ScoreState }) => {
        console.log(`Frontend: Game Over event! Winner: ${data.winner}`);
        if (gameIdRef.current) {
          setAppView("gameOver");
        }
      }
    );

    return () => {
      console.log(
        "Frontend: Disconnecting socket in main App.tsx useEffect cleanup..."
      );
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("gameState");
      newSocket.off("playerLeft");
      newSocket.off("gameOver");
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentView = appViewRef.current;
    console.log(`[handleKeyDown] Key: "${event.key}", AppView: ${currentView}, PlayerRole: ${playerRoleRef.current}`);
    if (isGameKey(event.key) && currentView === "inGame") {
      event.preventDefault();
      setPressedKeys((prevKeys) => {
        if (prevKeys[event.key]) return prevKeys;
        console.log(`[handleKeyDown] Setting pressed key: ${event.key}`);
        return { ...prevKeys, [event.key]: true };
      });
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const currentView = appViewRef.current;
    if (isGameKey(event.key) && currentView === "inGame") {
      event.preventDefault();
      setPressedKeys((prevKeys) => {
        if (!prevKeys[event.key] && typeof prevKeys[event.key] !== "boolean") return prevKeys;
        return { ...prevKeys, [event.key]: false };
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const prevPressedKeysRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const currentAppView = appViewRef.current;
    const currentPlayerRole = playerRoleRef.current;

    if (
      !socketRef.current ||
      !socketRef.current.connected ||
      currentAppView !== "inGame" ||
      !currentPlayerRole
    ) {
      return;
    }

    const currentSocket = socketRef.current;
    let keysToWatch: { up: string; down: string } | null = null;
    if (currentPlayerRole === "player1") {
      keysToWatch = { up: PLAYER_1_UP_KEY, down: PLAYER_1_DOWN_KEY };
    } else if (currentPlayerRole === "player2") {
      keysToWatch = { up: PLAYER_2_UP_KEY, down: PLAYER_2_DOWN_KEY };
    }

    if (!keysToWatch) {
      console.warn(`[PaddleMoveEffect] No keysToWatch for role: ${currentPlayerRole}`);
      return;
    }

    const actions: Array<{ key: string; direction: "up" | "down" }> = [
      { key: keysToWatch.up, direction: "up" },
      { key: keysToWatch.down, direction: "down" },
    ];

    let emitted = false;
    actions.forEach((action) => {
      const isPressed = !!pressedKeys[action.key];
      const wasPressed = !!prevPressedKeysRef.current[action.key];

      if (isPressed !== wasPressed) {
        const payload: PaddleMovePayload = {
          playerId: currentPlayerRole,
          action: isPressed ? "start" : "stop",
          direction: action.direction,
        };
        console.log(`[PaddleMoveEffect] Emitting 'paddleMove':`, payload);
        currentSocket.emit("paddleMove", payload);
        emitted = true;
      }
    });
    // if (emitted || Object.keys(pressedKeys).some(key => pressedKeys[key] !== prevPressedKeysRef.current[key])) {
       prevPressedKeysRef.current = { ...pressedKeys };
    // }
  }, [pressedKeys]);


  const handleCreateGame = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      setLobbyErrorMessage("Not connected to server. Cannot create game.");
      return;
    }
    setIsLoading(true);
    setLobbyErrorMessage(null);
    setGameState(null);
    console.log("Frontend: Attempting to create game...");
    socketRef.current.emit(
      "createGame",
      (response: { gameId?: string; error?: string }) => {
        if (response && response.gameId) {
          const newGameId = response.gameId;
          console.log(
            `Frontend: Game creation initiated. Game ID: ${newGameId}. Attempting to join...`
          );
          socketRef.current?.emit(
            "joinGame",
            { gameId: newGameId },
            (joinResponse: {
              success: boolean;
              gameId?: string;
              playerRole?: PlayerRole;
              message?: string;
            }) => {
              setIsLoading(false);
              if (
                joinResponse &&
                joinResponse.success &&
                joinResponse.gameId &&
                joinResponse.playerRole
              ) {
                console.log(
                  `Frontend: Successfully joined own game ${joinResponse.gameId} as ${joinResponse.playerRole}`
                );
                setGameId(joinResponse.gameId);
                setPlayerRole(joinResponse.playerRole);
                setAppView("waitingForPlayer");
              } else {
                setLobbyErrorMessage(
                  joinResponse.message || "Failed to auto-join created game."
                );
                setGameId(null);
                setPlayerRole(null);
                setAppView("lobby");
              }
            }
          );
        } else {
          setIsLoading(false);
          console.error("Frontend: Failed to create game.", response?.error);
          setLobbyErrorMessage(
            response?.error || "Failed to create game. Unknown error."
          );
          setAppView("lobby");
        }
      }
    );
  }, []);

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
    setGameState(null);
    console.log(`Frontend: Attempting to join game ${idToJoin}...`);
    socketRef.current.emit(
      "joinGame",
      { gameId: idToJoin },
      (response: {
        success: boolean;
        gameId?: string;
        playerRole?: PlayerRole;
        message?: string;
      }) => {
        setIsLoading(false);
        if (
          response &&
          response.success &&
          response.gameId &&
          response.playerRole
        ) {
          console.log(
            `Frontend: Successfully joined game ${response.gameId} as ${response.playerRole}`
          );
          setGameId(response.gameId);
          setPlayerRole(response.playerRole);
          setAppView("waitingForPlayer");
        } else {
          console.error("Frontend: Failed to join game.", response?.message);
          setLobbyErrorMessage(
            response?.message || "Failed to join game. Invalid ID or room full."
          );
          setAppView("lobby");
        }
      }
    );
  }, []);

  const handleReturnToLobby = () => {
    console.log(
      "[handleReturnToLobby] Setting view to lobby and clearing game context."
    );
    setAppView("lobby");
    setGameState(null);
    setGameId(null);
    setPlayerRole(null);
    setLobbyErrorMessage(null);
    setIsLoading(false);
  };


  const renderContent = () => {
    switch (appViewRef.current) {
      case "lobby":
        return (
          <GameLobby
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            isLoading={isLoading}
            errorMessage={lobbyErrorMessage}
          />
        );
      case "waitingForPlayer":
      case "inGame":
      case "gameOver":
        return (
          <div className="game-view-container"> 
            {appViewRef.current === "waitingForPlayer" && (
              <div className="status-text-container waiting-screen-text">
                <h2>Waiting for Opponent...</h2>
                {gameIdRef.current && (
                  <p>
                    Game ID: <strong>{gameIdRef.current}</strong> (Share with friend!)
                  </p>
                )}
                {playerRoleRef.current && (
                  <p>
                    You are: <strong>{playerRoleRef.current}</strong>
                  </p>
                )}
              </div>
            )}
            {appViewRef.current === "inGame" && gameState && (
              <div className="score-display">
                Player 1: {gameState.score.player1} | Player 2:{" "}
                {gameState.score.player2}
                <p style={{ fontSize: "0.8em", margin: "5px 0" }}>
                  You are: {playerRoleRef.current} | Game ID: {gameIdRef.current}
                </p>
              </div>
            )}
            {appViewRef.current === "gameOver" && gameState && (
              <div className="status-text-container game-over-text">
                <h2>Game Over!</h2>
                {gameState.winner && (
                  <p>
                    Winner:{" "}
                    {gameState.winner === playerRoleRef.current
                      ? `You (${gameState.winner})`
                      : gameState.winner}
                    !
                  </p>
                )}
                <p>
                  Final Score: Player 1: {gameState.score.player1} - Player 2:{" "}
                  {gameState.score.player2}
                </p>
              </div>
            )}

            <div className="game-canvas-wrapper" ref={gameCanvasWrapperRef}>
              {gameState && <GameCanvas gameState={gameState} scale={gameScale} />}
            </div>
            
            {(appViewRef.current === "waitingForPlayer" || appViewRef.current === "gameOver") && (
              <button onClick={handleReturnToLobby} className="app-button">
                {appViewRef.current === "gameOver" ? "Play Again (Lobby)" : "Return to Lobby"}
              </button>
            )}
          </div>
        );
      default:
        return <p>Loading or unknown application state...</p>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {appViewRef.current !== "lobby" && (
          <img src={logo} className="App-logo-small" alt="logo" />
        )}
        <h1>Ping Pong Game</h1>
        {renderContent()}
      </header>
    </div>
  );
}

export default App;