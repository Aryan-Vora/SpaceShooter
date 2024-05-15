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
};

const opponent = {
  x: canvas.width / 2 - 25,
  y: 10,
  width: 50,
  height: 50,
  color: "green",
};

const box = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  color: "red",
};

const bullets = [];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw opponent
  ctx.fillStyle = opponent.color;
  ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);

  // Draw box
  ctx.fillStyle = box.color;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  // Draw bullets
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Remove bullet if it goes off-screen
    if (bullet.y + bullet.height < 0) {
      bullets.splice(index, 1);
    }
  });

  requestAnimationFrame(draw);
}

function movePlayer(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      player.x -= 30; // Increased speed
      if (player.x < 0) player.x = 0;
      break;
    case "ArrowRig