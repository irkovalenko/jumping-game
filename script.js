const backgroundMusic = new Audio("./music.mp3");

const musicButton = document.getElementById("music-button");
let musicEnabled = true;

musicButton.addEventListener("click", () => {
  musicEnabled = !musicEnabled;

  if (musicEnabled) {
    backgroundMusic.play();
    musicButton.textContent = "🔊 Music: On";
  } else {
    backgroundMusic.pause();
    musicButton.textContent = "🔇 Music: Off";
  }
});

backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

const game = document.getElementById("game");
const playerElement = document.getElementById("player");

const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const finalTimeElement = document.getElementById("final-time");
const finalScoreElement = document.getElementById("final-score");

const gameOverElement = document.getElementById("game-over");
const restartButton = document.getElementById("restart-button");

const GRAVITY = 0.7;
const JUMP_FORCE = 13;

const PLAYER = 100;

const GROUND_HEIGHT = 40;

const OBSTACLE_SPEED = 6;

let player = 0;
let playerVelocity = 0;

let isJumping = false;

let obstacles = [];

let time = 0;
let startTime = null;

let score = 0;

let gameRunning = true;

let lastObstacleTime = 0;

let animationId;

function jump() {
  if (!isJumping) {
    if (musicEnabled) {
      backgroundMusic.play();
    }

    playerVelocity = JUMP_FORCE;
    isJumping = true;
  }
}

function updatePlayer() {
  playerVelocity -= GRAVITY;

  player += playerVelocity;

  if (player <= 0) {
    player = 0;

    playerVelocity = 0;

    isJumping = false;
  }

  playerElement.style.bottom = `${GROUND_HEIGHT + player}px`;
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

    if (detectCollision(obstacle)) {
      endGame();

      return;
    }

    if (!obstacle.passed && obstacle.x + obstacle.width < PLAYER) {
      obstacle.passed = true;

      score += 1;

      scoreElement.textContent = score;
    }
  }
}

function detectCollision(obstacle) {
  // AABB overlap test:
  const playerLeft = PLAYER;

  const playerRight = PLAYER + 60;

  const playerBottom = player + GROUND_HEIGHT;

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

function updateTimeSurvived(timestamp) {
  if (startTime === null) {
    startTime = timestamp;
  }

  time = Math.floor((timestamp - startTime) / 1000);
  timeElement.textContent = time;
}

function displayNewObstacle(timestamp) {
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

  displayNewObstacle(timestamp);

  updateTimeSurvived(timestamp);

  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;

  backgroundMusic.pause();

  finalTimeElement.textContent = time;
  finalScoreElement.textContent = score;

  gameOverElement.style.display = "flex";

  cancelAnimationFrame(animationId);
}

function restartGame() {
  obstacles.forEach((obstacle) => {
    obstacle.element.remove();
  });

  obstacles = [];

  player = 0;
  playerVelocity = 0;
  isJumping = false;

  time = 0;
  score = 0;

  timeElement.textContent = "0";
  scoreElement.textContent = "0";

  startTime = null;
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
