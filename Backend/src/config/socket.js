let _io = null;

/**
 * Initialize the Socket.io instance. Called once from app.js.
 */
const initSocket = (io) => {
  _io = io;

  io.on("connection", (socket) => {
    // Client sends their userId to join a personal notification room
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`room:${userId}`);
      }
    });

    // --- Chat events ---

    // Join a specific conversation room for real-time chat
    socket.on("chat:join", (conversationId) => {
      if (conversationId) {
        socket.join(`chat:${conversationId}`);
      }
    });

    // Leave a conversation room
    socket.on("chat:leave", (conversationId) => {
      if (conversationId) {
        socket.leave(`chat:${conversationId}`);
      }
    });

    // Typing indicator
    socket.on("chat:typing", ({ conversationId, userId, userName }) => {
      if (conversationId && userId) {
        socket.to(`chat:${conversationId}`).emit("chat:typing", {
          conversationId,
          userId,
          userName,
        });
      }
    });

    // Stop typing indicator
    socket.on("chat:stop-typing", ({ conversationId, userId }) => {
      if (conversationId && userId) {
        socket.to(`chat:${conversationId}`).emit("chat:stop-typing", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("disconnect", () => {
      // cleanup handled automatically by socket.io
    });
  });
};

/**
 * Get the shared Socket.io instance.
 * Returns null if socket has not been initialised yet.
 */
const getIO = () => _io;

/**
 * Emit a notification to a specific user's personal room.
 * @param {string} userId  - recipient's user ID
 * @param {object} payload - { title, message, type }  (type: 'info'|'success'|'warning'|'error')
 */
const notifyUser = (userId, payload) => {
  if (!_io || !userId) return;
  _io.to(`room:${userId}`).emit("notification", payload);
};

/**
 * Emit a new chat message to a conversation room.
 * @param {string} conversationId
 * @param {object} message - the full message object (with sender info)
 */
const emitChatMessage = (conversationId, message) => {
  if (!_io || !conversationId) return;
  _io.to(`chat:${conversationId}`).emit("chat:message", message);
};

module.exports = { initSocket, getIO, notifyUser, emitChatMessage };
