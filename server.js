const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const {v4: uuidv4} = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("createRoom", () => {
    const roomCode = uuidv4().slice(0, 6); // Generate a unique 6-character room code
    rooms[roomCode] = {
      players: {},
      isPrivate: true, // Mark the room as private
    };
    socket.join(roomCode);
    rooms[roomCode].players[socket.id] = createPlayer(socket.id);
    socket.emit("roomCreated", {roomCode, playerId: socket.id});
    io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
  });

  socket.on("joinRoom", (roomCode) => {
    if (rooms[roomCode]) {
      if (Object.keys(rooms[roomCode].players).length < 2) {
        socket.join(roomCode);
        rooms[roomCode].players[socket.id] = createPlayer(socket.id);
        socket.emit("roomJoined", {roomCode, playerId: socket.id});
        io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
      } else {
        socket.emit("error", "Room is full");
      }
    } else {
      socket.emit("error", "Room not found");
    }
  });

  socket.on("queue", () => {
    let roomCode = Object.keys(rooms).find(
      (code) =>
        Object.keys(rooms[code].players).length === 1 && !rooms[code].isPrivate
    );
    if (roomCode) {
      socket.join(roomCode);
      rooms[roomCode].players[socket.id] = createPlayer(socket.id);
      socket.emit("roomJoined", {roomCode, playerId: socket.id});
      io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
    } else {
      roomCode = uuidv4().slice(0, 6);
      rooms[roomCode] = {
        players: {},
        isPrivate: false, // Mark the room as public
      };
      socket.join(roomCode);
      rooms[roomCode].players[socket.id] = createPlayer(socket.id);
      socket.emit("roomCreated", {roomCode, playerId: socket.id});
      io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
    }
  });

  socket.on("move", ({roomCode, x}) => {
    if (rooms[roomCode] && rooms[roomCode].players[socket.id]) {
      rooms[roomCode].players[socket.id].x = x;
      io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
    }
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      if (rooms[roomCode].players[socket.id]) {
        delete rooms[roomCode].players[socket.id];
        io.to(roomCode).emit("updatePlayers", rooms[roomCode].players);
        if (Object.keys(rooms[roomCode].players).length === 0) {
          delete rooms[roomCode];
        }
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

function createPlayer(id) {
  return {
    id,
    x: 400, // Middle of a typical 800px wide canvas
    y: 0,
    width: 50,
    height: 50,
    color: "blue",
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
