import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io'; // Import Server and Socket type from socket.io

// Initialize the Express application
const app = express();

// Define the port the server will listen on
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- Socket.IO Integration ---
// Create an HTTP server instance using the Express app
const httpServer = http.createServer(app);

// Initialize a new Socket.IO server instance, attached to the HTTP server
// Configure CORS for Socket.IO: allow connections from any origin for now.
// For production, you'd restrict this to your frontend's URL (e.g., 'http://localhost:3000')
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Listen for new connections to Socket.IO
io.on('connection', (socket: Socket) => { // Explicitly type socket as Socket
  console.log('A user connected:', socket.id);

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // You can add more event listeners for this socket here
  // e.g., socket.on('chat message', (msg) => { /* ... */ });
});
// --- End Socket.IO Integration ---

// Define a simple default route (still useful for health checks)
app.get('/', (req: Request, res: Response) => {
  res.send('Ping Pong Server with Socket.IO is running!');
});

// Start the HTTP server (which now includes Socket.IO) and listen on the defined port
httpServer.listen(PORT, () => {
  console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);
});