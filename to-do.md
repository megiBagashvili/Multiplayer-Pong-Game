# Real-Time Ping Pong Game: Detailed To-Do List

## Phase 1: Core Backend Setup & Game Logic Foundation (Branches: `feature/backend-setup`, `feature/backend-game-logic`)

### Chunk 1.1: Backend Project Initialization & Socket.IO Setup

-   [x] **To-do 1.1.1: Initialize Backend Project:**
    -   Navigate to the `backend` folder in your project directory in the terminal.
    -   Run `npm init -y` to create a `package.json` file with default settings.
    -   Install essential backend dependencies: `npm install express cors socket.io @types/express @types/cors @types/socket.io --save`.
    -   Install development dependencies for TypeScript: `npm install typescript ts-node nodemon @types/node --save-dev`.
    -   Initialize TypeScript configuration: Run `npx tsc --init`.
    -   **GitHub Action:** Create a new branch named `feature/backend-setup`.
-   [x] **To-do 1.1.2: Configure `tsconfig.json`:**
    -   Open `backend/tsconfig.json` and adjust the compiler options as follows (or as per your preference):
        ```json
        {
          "compilerOptions": {
            "target": "ES2020",
            "module": "commonjs",
            "outDir": "./dist",
            "rootDir": "./src",
            "strict": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "forceConsistentCasingInFileNames": true
          },
          "include": ["src/**/*"],
          "exclude": ["node_modules", "dist"]
        }
        ```
    -   **GitHub Action:** Commit the changes to `feature/backend-setup`.
-   [x] **To-do 1.1.3: Basic Express Server Setup:**
    -   Create a new directory `backend/src`.
    -   Create a file `backend/src/server.ts`.
    -   Implement a basic Express server that listens on a specified port (e.g., 3001). Include a simple default route (e.g., `/`) that sends a "Ping Pong Server is running!" message.
    -   Add the following script to the `scripts` section of your `backend/package.json`: `"dev": "nodemon src/server.ts"`.
    -   **GitHub Action:** Commit the changes to `feature/backend-setup`.
-   [x] **To-do 1.1.4: Integrate Socket.IO:**
    -   In `backend/src/server.ts`, import `http` and `socket.io`.
    -   Create an HTTP server instance using your Express app.
    -   Initialize a Socket.IO server instance, attaching it to the HTTP server.
    -   Implement a basic connection event listener using `io.on('connection', (socket) => { console.log('A user connected:', socket.id); socket.on('disconnect', () => { console.log('User disconnected:', socket.id); }); });`.
    -   Make the HTTP server listen instead of the Express app directly.
    -   Install `@types/node` if you haven't already: `npm install @types/node --save-dev`.
    -   **GitHub Action:** Commit the changes to `feature/backend-setup`.
-   [x] **To-do 1.1.5: Test Basic Socket Connection (Manual):**
    -   Run the backend server using `npm run dev`.
    -   On the frontend (even a basic HTML page with Socket.IO client included via CDN for now), try to establish a connection to the backend server. Observe the console logs on the backend when a connection and disconnection occur.
    -   **GitHub Action:** (No code change, ensure testing).
-   [x] **To-do 1.1.6: Merge Backend Setup:**
    -   Create a Pull Request (PR) from the `feature/backend-setup` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

### Chunk 1.2: Core Game Logic - Ball and Paddle Entities

-   [x] **To-do 1.2.1: Create `Game` Class:**
    -   Create a new directory `backend/src/game`.
    -   Create a file `backend/src/game/Game.ts`.
    -   Define a `Game` class that will encapsulate the state and logic of a single game instance. This class should hold information about the paddles, ball, and score.
    -   **GitHub Action:** Create a new branch named `feature/backend-game-logic` based on `main`.
-   [x] **To-do 1.2.2: Define `Paddle` Interface/Class:**
    -   In `backend/src/game/Paddle.ts`, define an interface `Paddle` or a class `Paddle`. It should have properties like `x`, `y`, `width`, `height`. Consider methods for updating the paddle's `y` position.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.3: Define `Ball` Interface/Class:**
    -   In `backend/src/game/Ball.ts`, define an interface `Ball` or a class `Ball`. It should have properties like `x`, `y`, `radius`, `velocityX`, `velocityY`. Consider a method for updating the ball's position based on its velocity.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.4: Initialize Game State in `Game` Class:**
    -   In the `Game` class in `backend/src/game/Game.ts`, initialize the positions and properties of the two paddles and the ball. Define initial scores for both players (e.g., 0). Determine the initial direction and speed of the ball.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.5: Implement Ball Movement Logic:**
    -   In the `Game` class, implement a method (e.g., `updateBall()`) that updates the ball's `x` and `y` coordinates based on its `velocityX` and `velocityY`.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.6: Implement Basic Wall Collision Detection:**
    -   In the `updateBall()` method, add logic to detect collisions with the top and bottom walls of the game area. When a collision occurs, the `velocityY` of the ball should be reversed. Assume a defined height for the game area.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.7: Basic Game State Representation (Console Logging):**
    -   Add a method to the `Game` class (e.g., `getGameState()`) that returns a simple object containing the positions of the paddles and the ball, and the current score.
    -   In `backend/src/server.ts`, create a basic game instance and periodically (e.g., every second using `setInterval`) call `updateBall()` and `getGameState()`, logging the output to the console. This is for initial testing of the game logic.
    -   **GitHub Action:** Commit the changes to `feature/backend-game-logic`.
-   [x] **To-do 1.2.8: Merge Backend Game Logic Foundation:**
    -   Create a Pull Request (PR) from the `feature/backend-game-logic` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

## Phase 2: Real-Time Synchronization & Frontend Basics (Branches: `feature/frontend-setup`, `feature/realtime-sync`, `feature/frontend-ui`)

### Chunk 2.1: Frontend Project Initialization & Socket.IO Client Setup

-   [x] **To-do 2.1.1: Initialize Frontend Project:**
    -   Navigate to the project root in the terminal.
    -   Run `npx create-react-app frontend --template typescript`.
    -   `cd frontend`.
    -   Install the Socket.IO client library: `npm install socket.io-client --save`.
    -   **GitHub Action:** Create a new branch named `feature/frontend-setup` based on `main`.
-   [x] **To-do 2.1.2: Define Frontend Game State Interface:**
    -   Create a new directory `frontend/src/types`.
    -   Create a file `frontend/src/types/GameState.ts`.
    -   Define an interface `GameState` that mirrors the game state object you plan to send from the backend (paddle positions, ball position, scores).
    -   **GitHub Action:** Commit the changes to `feature/frontend-setup`.
-   [x] **To-do 2.1.3: Basic Socket.IO Client Connection:**
    -   In `frontend/src/App.tsx`, import the `io` function from `socket.io-client`.
    -   Establish a connection to your backend server (e.g., `const socket = io('http://localhost:3001');`).
    -   Implement basic event listeners for `connect` and `disconnect` events, logging messages to the console.
    -   **GitHub Action:** Commit the changes to `feature/frontend-setup`.
-   [x] **To-do 2.1.4: Test Frontend Socket Connection (Manual):**
    -   Start both the backend (`npm run dev` in `backend`) and the frontend (`npm start` in `frontend`).
    -   Open your browser and navigate to the frontend URL (usually `http://localhost:3000`).
    -   Observe the console logs in both the browser (frontend) and the terminal (backend) to verify successful connection and disconnection events.
    -   **GitHub Action:** (No code change, ensure testing).
-   [x] **To-do 2.1.5: Merge Frontend Setup:**
    -   Create a Pull Request (PR) from the `feature/frontend-setup` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

### Chunk 2.2: Real-Time Game State Synchronization

-   [x] **To-do 2.2.1: Emit Game State from Backend:**
    -   **GitHub Action:** Create a new branch named `feature/realtime-sync` based on `main`.
    -   In `backend/src/server.ts`, when a new client connects, emit the current game state to that client using a custom event name (e.g., `'gameState'`).
    -   Modify the periodic game logic update in `backend/src/server.ts` to emit the updated game state to all connected clients using `io.emit('gameState', gameState)`.
    -   **GitHub Action:** Commit the changes to `feature/realtime-sync`.
-   [x] **To-do 2.2.2: Receive and Update Game State on Frontend:**
    -   In `frontend/src/App.tsx`, create a state variable using `useState` to hold the current `GameState`. Initialize it with default values.
    -   In the `useEffect` hook (that runs once on component mount), set up an event listener for the `'gameState'` event from the backend.
    -   When the `'gameState'` event is received, update the frontend's state with the received data.
    -   **GitHub Action:** Commit the changes to `feature/realtime-sync`.
-   [x] **To-do 2.2.3: Basic Rendering of Game State on Frontend:**
    -   In `frontend/src/App.tsx`, render the basic elements of the game (e.g., two `div`s representing paddles and a `div` representing the ball) based on the `x` and `y` coordinates received in the `GameState`. Use inline styles for now for simplicity.
    -   **GitHub Action:** Commit the changes to `feature/realtime-sync`.
-   [x] **To-do 2.2.4: Test Real-Time Synchronization (Manual):**
    -   Run both the backend and frontend.
    -   Observe if the positions of the paddles and the ball (even if not visually accurate yet) are being updated in the browser based on the backend's game logic. You might need to open two browser windows to simulate two players (though paddle control isn't implemented yet).
    -   **GitHub Action:** (No code change, ensure testing).
-   [x] **To-do 2.2.5: Merge Real-Time Synchronization:**
    -   Create a Pull Request (PR) from the `feature/realtime-sync` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

### Chunk 2.3: Basic Frontend UI Structure and Styling

-   [x] **To-do 2.3.1: Create Game Canvas Component:**
    -   **GitHub Action:** Create a new branch named `feature/frontend-ui` based on `main`.
    -   Create a new component `frontend/src/components/GameCanvas.tsx`. This component will be responsible for rendering the game elements.
    -   Move the rendering logic for the paddles and the ball from `App.tsx` to `GameCanvas.tsx`.
    -   `App.tsx` should now render the `GameCanvas` component and pass the `gameState` as props.
    -   **GitHub Action:** Commit the changes to `feature/frontend-ui`.
-   [x] **To-do 2.3.2: Implement Basic Styling:**
    -   Create a CSS file `frontend/src/components/GameCanvas.css`.
    -   Style the game area, paddles, and ball to make them visually distinct and appropriately sized. Use CSS properties like `width`, `height`, `backgroundColor`, `borderRadius`, `position: absolute`, etc.
    -   Import and apply the styles to the `GameCanvas` component.
    -   **GitHub Action:** Commit the changes to `feature/frontend-ui`.
-   [x] **To-do 2.3.3: Render Scores:**
    -   Add state variables in `App.tsx` to hold the scores of both players.
    -   Update these score states when the `gameState` from the backend includes score information.
    -   Render the scores above or below the `GameCanvas` in `App.tsx`.
    -   Add basic styling for the score display.
    -   **GitHub Action:** Commit the changes to `feature/frontend-ui`.
-   [x] **To-do 2.3.4: Merge Basic Frontend UI:**
    -   Create a Pull Request (PR) from the `feature/frontend-ui` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

## Phase 3: Player Input and Backend Game Mechanics (Branches: `feature/player-input`, `feature/backend-mechanics`)

### Chunk 3.1: Frontend Player Input Handling

-   [x] **To-do 3.1.1: Capture Keyboard Input:**
    -   **GitHub Action:** Create a new branch named `feature/player-input` based on `main`.
    -   In `frontend/src/components/GameCanvas.tsx` (or `App.tsx`), add event listeners for keyboard events (`keydown` and `keyup`) on the `window` or the `document`.
    -   Identify specific keys that will control each player's paddle movement (e.g., 'w' and 's' for player 1, 'ArrowUp' and 'ArrowDown' for player 2).
    -   Maintain state to track which movement keys are currently being pressed.
    -   **GitHub Action:** Commit the changes to `feature/player-input`.
-   [x] **To-do 3.1.2: Emit Paddle Movement to Backend:**
    -   When a relevant movement key is pressed or released, emit a custom Socket.IO event (e.g., `'paddleMove'`) to the backend, including information about which player is moving and the direction of movement.
    -   Consider sending updates at a reasonable interval while the key is held down to ensure smooth movement.
    -   **GitHub Action:** Commit the changes to `feature/player-input`.
-   [x] **To-do 3.1.3: Merge Player Input Handling:**
    -   Create a Pull Request (PR) from the `feature/player-input` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

### Chunk 3.2: Backend Game Mechanics - Paddle Movement, Collision, Scoring

-   [x] **To-do 3.2.1: Handle Paddle Movement on Backend:**
    -   **GitHub Action:** Create a new branch named `feature/backend-mechanics` based on `main`.
    -   In `backend/src/server.ts` (or a dedicated game management module), set up a Socket.IO event listener for the `'paddleMove'` event.
    -   Based on the received player and direction, update the `y` position of the corresponding paddle in the `Game` instance. Ensure the paddle stays within the game bounds.
    -   **GitHub Action:** Commit the changes to `feature/backend-mechanics`.
-   [x] **To-do 3.2.2: Implement Ball-Paddle Collision Detection:**
    -   In the `updateBall()` method of the `Game` class in `backend/src/game/Game.ts`, add logic to detect collisions between the ball and each of the paddles.
    -   A collision occurs if the ball's horizontal position overlaps with the paddle's horizontal position, and the ball's vertical position overlaps with the paddle's vertical range.
    -   When a collision occurs, the `velocityX` of the ball should be reversed to make it bounce off the paddle. You might also want to slightly adjust the `velocityY` based on where the ball hits the paddle for more realistic gameplay.
    -   **GitHub Action:** Commit the changes to `feature/backend-mechanics`.
-   [x] **To-do 3.2.3: Implement Scoring Logic:**
    -   In the `updateBall()` method, add logic to check if the ball has gone past the left or right edges of the game area.
    -   If the ball goes past the left edge, the right player scores a point. If it goes past the right edge, the left player scores a point.
    -   When a player scores, increment their score in the `Game` state.
    -   After a score, reset the ball to the center of the game area and potentially reverse its horizontal direction. You might also want to briefly pause the game before restarting.
    -   Update the `getGameState()` method to include the current scores of both players.
    -   **GitHub Action:** Commit the changes to `feature/backend-mechanics`.
-   [x] **To-do 3.2.4: Update Frontend on Score Changes:**
    -   Ensure that the `'gameState'` event emitted from the backend includes the updated scores.
    -   In `frontend/src/App.tsx`, update the score state variables when a new `gameState` is received.
    -   The rendered score display should now reflect the real-time scoring.
    -   **GitHub Action:** Commit the changes to `feature/backend-mechanics`.
-   [x] **To-do 3.2.5: Basic Win Condition (Optional):**
    -   As a basic addition, you can implement a simple win condition (e.g., first player to reach a certain score wins). When a player wins, update the game state and potentially emit a `'gameOver'` event to the frontend.
    -   **GitHub Action:** Commit the changes to `feature/backend-mechanics`.
-   [x] **To-do 3.2.6: Merge Backend Game Mechanics:**
    -   Create a Pull Request (PR) from the `feature/backend-mechanics` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

## Phase 4: Game Session/Room Management (Branch: `feature/game-rooms`)

### Chunk 4.1: Backend Game Room Logic

-   [x] **To-do 4.1.1: Create `GameManager` Class:**
    -   **GitHub Action:** Create a new branch named `feature/game-rooms` based on `main`.
    -   Create a new directory `backend/src/game-management`.
    -   Create a file `backend/src/game-management/GameManager.ts`.
    -   Implement a `GameManager` class that will be responsible for managing multiple game sessions (rooms). It should store a collection of active `Game` instances, each identified by a unique game ID.
    -   **GitHub Action:** Commit the changes to `feature/game-rooms`.
-   [x] **To-do 4.1.2: Implement Game Creation:**
    -   In the `GameManager`, implement a method to create a new `Game` instance and generate a unique game ID for it. Store the new game in the collection.
    -   **GitHub Action:** Commit the changes to `feature/game-rooms`.
-   [x] **To-do 4.1.3: Implement Player Joining:**
    -   In the `GameManager`, implement a method to allow two players to join a specific game room (identified by its ID). You'll need to keep track of which players are in which room. Consider assigning each player a 'player number' (e.g., 1 or 2) or a side (left or right).
    -   Handle the case where a third player tries to join a full room (you can either reject them or implement spectator mode later).
    -   Associate each connected Socket.IO socket with a game room and a player within that room.
    -   **GitHub Action:** Commit the changes to `feature/game-rooms`.
-   [x] **To-do 4.1.4: Modify Socket Event Handling:**
    -   In `backend/src/server.ts`, implement Socket.IO event listeners for:
        -   Creating a new game room. When a client emits an event (e.g., `'createGame'`), the server should use the `GameManager` to create a new game and respond with the game ID. The client should then join this room.
        -   Joining an existing game room. When a client emits an event (e.g., `'joinGame'` with a `gameId`), the server should use the `GameManager` to add the client to the specified room. If successful, notify the client and potentially other players in the room.
        -   Ensure that game state updates and paddle movement events are now specific to a particular game room (e.g., using `io.to(gameId).emit(...)`).
    -   **GitHub Action:** Commit the changes to `feature/game-rooms`.
-   [x] **To-do 4.1.5: Update Game Logic to Use Game ID:**
    -   Modify the game logic to operate on the `Game` instance associated with a specific `gameId` managed by the `GameManager`.
    -   Ensure that paddle movements and game state updates are correctly routed to the appropriate `Game` instance based on the room the players are in.
    -   **GitHub Action:** Commit the changes to `feature/game-rooms`.
-   [x] **To-do 4.1.6: Merge Game Room Management:**
    -   Create a Pull Request (PR) from the `feature/game-rooms` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

## Phase 5: Frontend Game Room UI and Connection Logic (Branch: `feature/frontend-rooms`)

### Chunk 5.1: Frontend Game Room UI

-   [x] **To-do 5.1.1: Create Game Lobby/Join Screen:**
    -   **GitHub Action:** Create a new branch named `feature/frontend-rooms` based on `main`.
    -   Create new React components (e.g., `GameLobby.tsx`, `JoinGame.tsx`).
    -   Implement a UI in `GameLobby` that allows a player to create a new game. Upon creation, the server should return a `gameId`, and the player should be navigated to the game screen.
    -   Implement a UI in `JoinGame` that allows a player to enter a `gameId` and attempt to join an existing game.
    -   You might need to manage different states in your `App.tsx` or a routing library (like React Router) to switch between the lobby/join screen and the game screen.
    -   **GitHub Action:** Commit the changes to `feature/frontend-rooms`.
-   [x] **To-do 5.1.2: Connect Frontend to Backend for Room Management:**
    -   In your React components, use the Socket.IO client to emit the `'createGame'` and `'joinGame'` events to the backend when the user interacts with the UI.
    -   Handle the backend's responses (e.g., receiving a `gameId` after creating a game, or an error message if joining fails).
    -   Update the frontend's state (e.g., store the current `gameId`) based on these responses.
    -   **GitHub Action:** Commit the changes to `feature/frontend-rooms`.
-   [x] **To-do 5.1.3: Display Game ID (Optional):**
    -   Once a game is created, you can display the `gameId` to the creating player so they can share it with another player.
    -   **GitHub Action:** Commit the changes to `feature/frontend-rooms`.
-   [x] **To-do 5.1.4: Merge Frontend Game Room UI:**
    -   Create a Pull Request (PR) from the `feature/frontend-rooms` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.

## Phase 6: Polishing and Refinements (Branch: `feature/polish`)

### Chunk 6.1: Visual Enhancements and User Experience

-   [ ] **To-do 6.1.1: Improve Styling:**
    -   **GitHub Action:** Create a new branch named `feature/polish` based on `main`.
    -   Refine the CSS for the game area, paddles, ball, and scores to create a more visually appealing and polished look.
    -   Consider adding animations or transitions for smoother movement.
    -   **GitHub Action:** Commit the changes to `feature/polish`.
-   [ ] **To-do 6.1.2: Add User Feedback:**
    -   Provide visual feedback to the players (e.g., when a point is scored, when a player joins a game).
    -   Display messages for game over conditions.
    -   **GitHub Action:** Commit the changes to `feature/polish`.
-   [ ] **To-do 6.1.3: Responsive Design (Basic):**
    -   Ensure that the game layout adapts reasonably well to different screen sizes.
    -   **GitHub Action:** Commit the changes to `feature/polish`.

### Chunk 6.2: Code Cleanup and Refactoring

-   [ ] **To-do 6.2.1: Code Formatting and Linting:**
    -   Set up and use a code formatter (e.g., Prettier) and a linter (e.g., ESLint with recommended TypeScript rules) for consistent code style and to catch potential issues.
    -   Apply formatting and fix any linting errors.
    -   **GitHub Action:** Commit the changes to `feature/polish`.
-   [ ] **To-do 6.2.2: Refactor Components and Logic:**
    -   Review your frontend and backend code for areas that can be made more modular, readable, and maintainable.
    -   Extract logic into reusable functions or components.
    -   **GitHub Action:** Commit the changes to `feature/polish`.

### Chunk 6.3: Testing and Bug Fixing

-   [ ] **To-do 6.3.1: Manual Testing:**
    -   Thoroughly test the game with two players in different browsers, focusing on real-time synchronization, paddle control, ball physics, collision detection, scoring, and room management.
    -   Identify and document any bugs or issues.
    -   **GitHub Action:** (No code change, ensure testing).
-   [ ] **To-do 6.3.2: Bug Fixing:**
    -   Address the identified bugs and issues. Commit the fixes.
    -   **GitHub Action:** Commit bug fixes to `feature/polish`.
-   [ ] **To-do 6.3.3: Merge Polishing and Refinements:**
    -   Create a Pull Request (PR) from the `feature/polish` branch to the `main` branch on GitHub.
    -   Review the code and merge the PR. Note the merge commit link.
