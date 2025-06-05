Real-Time Multiplayer Ping Pong Game

This project is a simple two-player Ping Pong game built with a Node.js (TypeScript) backend and a React (TypeScript) frontend, featuring real-time communication using Socket.IO.

🎮 Game Overview
Two players connect to a game session, each controlling a paddle on their screen. The objective is to hit the ball past your opponent's paddle to score points. The first player to reach the winning score - 5 points - wins the match!

To access the game and play:
1. Download or clone the repository
If you haven't already, clone this repository to your local machine.

2. Set up and run the backend server
The backend server manages game logic and real-time communication.

# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run dev

You should see a message in your terminal like: Server with Socket.IO is running on http://localhost:3001. Keep this terminal window open.

3. Set up and run the frontend application

# Open a NEW terminal window or tab
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Start the development server
npm start

This should automatically open the game in your default web browser, usually at http://localhost:3000. If not, open this URL manually.

🕹️ How to Play
Once both the backend and frontend are running:

Open the Game: Navigate to http://localhost:3000 in your web browser. You'll be in the game lobby.

Player 1 - Create a game:

Click the "Create New Game" button.

You'll be taken to a "Waiting for Opponent..." screen.

A Game ID will be displayed on this screen. Copy this game ID.

Player 2 - Join the game:

Open http://localhost:3000 in a different browser window or a different browser, or a new tab.

In the game lobby, paste the game ID (shared by Player 1) into the "Enter Game ID" field.

Click the "Join Game" button.

Play!

Once Player 2 joins, the game will start automatically for both players.

Controls:

Player 1: Use the W key to move your paddle up and the S key to move it down.

Player 2: Use the ArrowUp key to move your paddle up and the ArrowDown key to move it down.

The first player to score 5 points wins!

Play Again:

After a game ends, click the "Play Again (Lobby)" button to return to the main lobby screen to start or join a new game.