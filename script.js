// ========================================
// DOM Elements
// ========================================

const backgroundMusic = new Audio("./music.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

const game = document.getElementById("game");
const playerElement = document.getElementById("player");

const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");

const gameOverElement = document.getElementById("game-over");
const restartButton = document.getElementById("restart-button");


// ========================================
// Game Constants
// ========================================

const GRAVITY = 0.7;
const JUMP_FORCE = 13;

const PLAYER_X = 100;

const GROUND_HEIGHT = 40;

const OBSTACLE_SPEED = 6;


// ========================================
// Game State
// ========================================

let playerY = 0;
let playerVelocityY = 0;

let isJumping = false;

let obstacles = [];

let score = 0;

let gameRunning = true;

let lastObstacleTime = 0;

let animationId;


// ========================================
// Player
// ========================================

function jump() {
  if (!isJumping) {
    backgroundMusic.play();

    playerVelocityY = JUMP_FORCE;
    isJumping = true;
  }
}


// ========================================
// Update Player
// ========================================

function updatePlayer() {

  // Apply gravity
  playerVelocityY -= GRAVITY;

  // Move player vertically
  playerY += playerVelocityY;


  // Ground collision
  if (playerY <= 0) {

    playerY = 0;

    playerVelocityY = 0;

    isJumping = false;
  }


  // Update visual position
  playerElement.style.bottom =
    `${GROUND_HEIGHT + playerY}px`;
}


// ========================================
// Create Obstacle
// ========================================

function createObstacle() {

  const obstacle = document.createElement("div");

  obstacle.classList.add("obstacle");

  obstacle.style.left =
    `${game.clientWidth}px`;

  game.appendChild(obstacle);


  obstacles.push({
    element: obstacle,

    x: game.clientWidth,

    width: 35,

    height: 55
  });
}


// ========================================
// Update Obstacles
// ========================================

function updateObstacles() {

  for (let i = obstacles.length - 1; i >= 0; i--) {

    const obstacle = obstacles[i];


    // Move obstacle left
    obstacle.x -= OBSTACLE_SPEED;


    obstacle.element.style.left =
      `${obstacle.x}px`;


    // Remove obstacle when it leaves screen
    if (obstacle.x + obstacle.width < 0) {

      obstacle.element.remove();

      obstacles.splice(i, 1);

      continue;
    }


    // Check collision
    if (checkCollision(obstacle)) {

      endGame();

      return;
    }
  }
}


// ========================================
// Collision Detection
// ========================================

function checkCollision(obstacle) {

  const playerLeft = PLAYER_X;

  const playerRight =
    PLAYER_X + 60;

  const playerBottom =
    playerY + GROUND_HEIGHT;

  const playerTop =
    playerBottom + 60;


  const obstacleLeft =
    obstacle.x;

  const obstacleRight =
    obstacle.x + obstacle.width;

  const obstacleBottom =
    GROUND_HEIGHT;

  const obstacleTop =
    GROUND_HEIGHT + obstacle.height;


  return (
    playerLeft < obstacleRight &&
    playerRight > obstacleLeft &&
    playerBottom < obstacleTop &&
    playerTop > obstacleBottom
  );
}


// ========================================
// Score
// ========================================

function updateScore() {

  score += 1;

  scoreElement.textContent =
    Math.floor(score / 10);
}


// ========================================
// Spawn Obstacles
// ========================================

function spawnObstacles(timestamp) {

  // Wait before spawning another obstacle
  if (timestamp - lastObstacleTime < 1500) {
    return;
  }


  createObstacle();

  lastObstacleTime = timestamp;
}


// ========================================
// Game Loop
// ========================================

function gameLoop(timestamp) {

  if (!gameRunning) {
    return;
  }


  updatePlayer();

  updateObstacles();

  spawnObstacles(timestamp);

  updateScore();


  animationId =
    requestAnimationFrame(gameLoop);
}


// ========================================
// End Game
// ========================================

function endGame() {
  gameRunning = false;

  backgroundMusic.pause();

  finalScoreElement.textContent =
    Math.floor(score / 10);

  gameOverElement.style.display = "flex";

  cancelAnimationFrame(animationId);
}


// ========================================
// Restart Game
// ========================================

function restartGame() {

  // Remove old obstacles
  obstacles.forEach((obstacle) => {
    obstacle.element.remove();
  });


  obstacles = [];


  // Reset player
  playerY = 0;

  playerVelocityY = 0;

  isJumping = false;


  // Reset score
  score = 0;

  scoreElement.textContent = "0";


  // Reset timers
  lastObstacleTime = 0;


  // Hide game over screen
  gameOverElement.style.display =
    "none";


  // Start game
  gameRunning = true;


  animationId =
    requestAnimationFrame(gameLoop);
}


// ========================================
// Keyboard Controls
// ========================================

document.addEventListener("keydown", (event) => {

  if (
    event.code === "Space" ||
    event.code === "ArrowUp"
  ) {

    event.preventDefault();

    jump();
  }
});


// ========================================
// Restart Button
// ========================================

restartButton.addEventListener(
  "click",
  restartGame
);


// ========================================
// Start Game
// ========================================

animationId =
  requestAnimationFrame(gameLoop);
