import React, { useState } from 'react';
import './GameLobby.css';

interface GameLobbyProps {
  onCreateGame: () => void; // Placeholder for now, will emit socket event later
  onJoinGame: (gameId: string) => void; // Placeholder for now, will emit socket event later
  isLoading: boolean;
  errorMessage?: string | null;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onCreateGame, onJoinGame, isLoading, errorMessage }) => {
  const [joinGameId, setJoinGameId] = useState<string>('');

  const handleJoinGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameId.trim()) {
      onJoinGame(joinGameId.trim());
    }
  };

  return (
    <div className="game-lobby-container">
      <div className="lobby-card">
        <h2>Welcome to Ping Pong!</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="lobby-actions">
          <button
            onClick={onCreateGame}
            disabled={isLoading}
            className="lobby-button create-button"
          >
            {isLoading ? 'Creating...' : 'Create New Game'}
          </button>

          <hr className="divider" />

          <form onSubmit={handleJoinGameSubmit} className="join-game-form">
            <p>Or join an existing game:</p>
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="lobby-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !joinGameId.trim()}
              className="lobby-button join-button"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;