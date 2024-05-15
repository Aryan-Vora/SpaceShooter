const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const bulletSpeed = 5;

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  color: "blue",
  speed: 0,
  maxSpeed: 4,
};

const opponent = {
  x: canvas.width / 2 - 25,
  y: 10,
  width: 50,
  height: 50,
  color: "blue",
};

const box = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  color: "green",
};

const bullets = [];
let keys = {};
let lastShotTime = 0;
const shotCooldown = 300; // Cooldown in milliseconds

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = opponent.color;
  ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
  ctx.fillStyle = box.color;
  ctx.fillRect(box.x, box.y, box.width, box.height);
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    if (bullet.y + bullet.height < 0) {
      bullets.splice(index, 1);
    }
  });
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
}

function shoot() {
  const currentTime = Date.now();
  if (currentTime - lastShotTime >= shotCooldown) {
    bullets.push({
      x: player.x + player.width / 2 - 5,
      y: player.y,
      width: 10,
      height: 10,
      color: "black",
      speed: bulletSpeed,
    });
    lastShotTime = currentTime;
  }
}

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

setInterval(() => {
  if (keys[" "]) {
    shoot();
  }
}, 100); // Check for shooting every 100ms

function gameLoop() {
  updatePlayer();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
