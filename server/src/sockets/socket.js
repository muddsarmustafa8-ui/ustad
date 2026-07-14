const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Simple token authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-jwt-secret-key-32-characters-minimum');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Token invalid'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected to socket: ${socket.userId} (Socket: ${socket.id})`);

    // Join a private room named after the userId to receive personal notifications & direct messages
    socket.join(socket.userId.toString());

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected from socket: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = {
  initSocket,
};
