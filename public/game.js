const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  color: "blue",
  speed: 0,
  maxSpeed: 4,
};

const players = {};
let keys = {};
let roomCode = null;
let playerId = null;

socket.on("roomCreated", (data) => {
  roomCode = data.roomCode;
  playerId = data.playerId;
  document.getElementById("status").innerText = `Room created: ${roomCode}`;
  hideControls();
  initPlayerPosition();
});

socket.on("roomJoined", (data) => {
  roomCode = data.roomCode;
  playerId = data.playerId;
  document.getElementById("status").innerText = `Joined room: ${roomCode}`;
  hideControls();
  initPlayerPosition();
});

socket.on("updatePlayers", (data) => {
  Object.assign(players, data);
});

socket.on("playerLeft", (playerId) => {
  delete players[playerId];
});

socket.on("error", (message) => {
  document.getElementById("status").innerText = message;
});

document.getElementById("createRoom").addEventListener("click", () => {
  socket.emit("createRoom");
});

document.getElementById("joinRoom").addEventListener("click", () => {
  const code = document.getElementById("roomCode").value;
  if (code) {
    socket.emit("joinRoom", code);
  }
});

document.getElementById("queue").addEventListener("click", () => {
  socket.emit("queue");
});

function hideControls() {
  document.getElementById("controls").style.display = "none";
}

function initPlayerPosition() {
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 10; // Place player near the bottom
  players[playerId] = player; // Ensure the player object is in the players list
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    const isCurrentPlayer = id === playerId;

    let drawX = p.x;
    let drawY = isCurrentPlayer ? canvas.height - p.height : 0;

    ctx.fillStyle = p.color;
    ctx.fillRect(drawX, drawY, p.width, p.height);
  }
}

function updatePlayer() {
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.speed = -player.maxSpeed;
  } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.speed = player.maxSpeed;
  } else {
    player.speed = 0;
  }

  player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;

  if (roomCode) {
    socket.emit("move", {roomCode, x: player.x});
  }
}

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
