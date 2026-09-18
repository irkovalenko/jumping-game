const backgroundMusic = new Audio("./music.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

const game = document.getElementById("game");
const playerElement = document.getElementById("player");

const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");

const gameOverElement = document.getElementById("game-over");
const restartButton = document.getElementById("restart-button");

const GRAVITY = 0.7; // distance between frog in jump vs obstacle
const JUMP_FORCE = 13;

const PLAYER_X = 100; // player does not move, only jump over obstacles

const GROUND_HEIGHT = 40;

const OBSTACLE_SPEED = 6;

let playerY = 0; // player is 0 above the ground so basically standing on the ground
let playerVelocityY = 0; // initial vertical speed

let isJumping = false;

let obstacles = [];

let score = 0;

let gameRunning = true;

let lastObstacleTime = 0;

let animationId;

function jump() {
  if (!isJumping) {
    backgroundMusic.play();

    playerVelocityY = JUMP_FORCE; // jumping only when on the ground, no double jumps
    isJumping = true;
  }
}

function updatePlayer() {
  playerVelocityY -= GRAVITY; //positive velocity = moving up, negative = moving down

  playerY += playerVelocityY;

  if (playerY <= 0) { // player hits the ground
    playerY = 0;

    playerVelocityY = 0;

    isJumping = false;
  }

  playerElement.style.bottom = `${GROUND_HEIGHT + playerY}px`; //positioning player
}

function createObstacle() {
  const obstacle = document.createElement("div");

  obstacle.classList.add("obstacle");

  obstacle.style.left = `${game.clientWidth}px`;

  game.appendChild(obstacle);

  obstacles.push({
    element: obstacle,

    x: game.clientWidth,

    width: 35,

    height: 55,
  });
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

    obstacle.x -= OBSTACLE_SPEED;

    obstacle.element.style.left = `${obstacle.x}px`;

    if (obstacle.x + obstacle.width < 0) {
      obstacle.element.remove();

      obstacles.splice(i, 1);

      continue;
    }

    if (checkCollision(obstacle)) {
      endGame();

      return;
    }
  }
}

function checkCollision(obstacle) {
  const playerLeft = PLAYER_X;

  const playerRight = PLAYER_X + 60;

  const playerBottom = playerY + GROUND_HEIGHT;

  const playerTop = playerBottom + 60;

  const obstacleLeft = obstacle.x;

  const obstacleRight = obstacle.x + obstacle.width;

  const obstacleBottom = GROUND_HEIGHT;

  const obstacleTop = GROUND_HEIGHT + obstacle.height;

  return (
    playerLeft < obstacleRight &&
    playerRight > obstacleLeft &&
    playerBottom < obstacleTop &&
    playerTop > obstacleBottom
  );
}

function updateScore() {
  score += 1;

  scoreElement.textContent = Math.floor(score / 10);
}

function spawnObstacles(timestamp) {
  if (timestamp - lastObstacleTime < 1500) {
    return;
  }

  createObstacle();

  lastObstacleTime = timestamp;
}

function gameLoop(timestamp) {
  if (!gameRunning) {
    return;
  }

  updatePlayer();

  updateObstacles();

  spawnObstacles(timestamp);

  updateScore();

  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;

  backgroundMusic.pause();

  finalScoreElement.textContent = Math.floor(score / 10);

  gameOverElement.style.display = "flex";

  cancelAnimationFrame(animationId);
}

function restartGame() {
  obstacles.forEach((obstacle) => {
    obstacle.element.remove();
  });

  obstacles = [];

  playerY = 0;

  playerVelocityY = 0;

  isJumping = false;

  score = 0;

  scoreElement.textContent = "0";

  lastObstacleTime = 0;

  gameOverElement.style.display = "none";

  gameRunning = true;

  animationId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    jump();
  }
});

restartButton.addEventListener("click", restartGame);

animationId = requestAnimationFrame(gameLoop);
