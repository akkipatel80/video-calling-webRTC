const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://a364-2405-201-2024-a1f6-85f9-ef59-1a5e-38a0.ngrok-free.app",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5000, () => {
  console.log("server running on :", 5000);
});
