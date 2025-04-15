const app = require('./app');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');


dotenv.config({ path: './config/config.env' });

const server = http.createServer(app);


const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 30000,
  pingInterval: 15000,
  maxHttpBufferSize: 1e8,
  transports: ['websocket', 'polling'],
  allowUpgrades: true
});


const activeBoards = new Set();

io.on('connection', (socket) => {
  console.log('🔥 New client connected:', socket.id);


  socket.on('join-board', (boardId, callback) => {
    try {
      if (!boardId) {
        throw new Error('Board ID is required');
      }
      
      socket.join(boardId);
      activeBoards.add(boardId);
      console.log(`📌 User ${socket.id} joined board ${boardId}`);
      
     
      setupBoardEvents(socket, boardId);
      
      callback({ status: 'success', boardId });
    } catch (error) {
      console.error('❌ Join board error:', error);
      callback({ status: 'error', message: error.message });
    }
  });


  socket.on('disconnect', () => {
    console.log(`⚠️ Client disconnected: ${socket.id}`);
  });


  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

function setupBoardEvents(socket, boardId) {

  console.log(`⚡ Setup events for board ${boardId}`);
}


app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  server.close(() => process.exit(1));
});