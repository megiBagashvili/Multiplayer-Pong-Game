// frontend/src/App.tsx

import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function App() {
  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL, {
      // Optional: You can add connection options here if needed
      // transports: ['websocket'], // Example: force websocket transport
    });

    socket.on('connect', () => {
      console.log(`Frontend: Successfully connected to Socket.IO server! Socket ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Frontend: Disconnected from Socket.IO server. Reason: ${reason}`);
      if (reason === 'io server disconnect') {
        // The server intentionally disconnected the socket.
        // You might want to reconnect manually if that's desired behavior.
        // socket.connect(); // Example
      }
      // Else, the socket will automatically try to reconnect for other reasons
    });

    socket.on('connect_error', (error) => {
      console.error('Frontend: Socket.IO connection error:', error);
    });

    // Cleanup on component unmount
    // This is important to prevent memory leaks and multiple connections
    // if the App component were to be unmounted and remounted.
    return () => {
      console.log('Frontend: Disconnecting Socket.IO socket...');
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>
          Open your browser's developer console to see Socket.IO connection logs.
        </p>
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