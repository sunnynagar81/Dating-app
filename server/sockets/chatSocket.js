const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Match = require("../models/Match");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
  });

  // Har connection par token check karo
  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Client match ke room mein join karta hai: socket.emit("join-match", matchId)
    socket.on("join-match", async (matchId) => {
      try {
        const match = await Match.findOne({
          _id: matchId,
          $or: [{ user1: socket.userId }, { user2: socket.userId }],
        });
        if (!match) {
          return socket.emit("error-message", "You are not part of this match");
        }
        socket.join(`match:${matchId}`);
      } catch (error) {
        socket.emit("error-message", error.message);
      }
    });
  });
};

// Controllers se is function ko call karke match ke dono users ko event bhejte hain
const emitToMatch = (matchId, event, data) => {
  if (io) io.to(`match:${matchId}`).emit(event, data);
};

module.exports = { initSocket, emitToMatch };