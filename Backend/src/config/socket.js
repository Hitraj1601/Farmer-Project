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

module.exports = { initSocket, getIO, notifyUser };
