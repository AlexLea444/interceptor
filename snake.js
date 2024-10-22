const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const gridHeight = 40;  // height of the player grid at the bottom
const playerWidth = 100; // width of the player "snake" block
const playerHeight = 10; // height of the player "snake" block
const playerVelocity = 5; // constant velocity of the player movement

let playerX = canvasWidth / 2 - playerWidth / 2; // player starts at center
let playerY = canvasHeight - gridHeight - playerHeight; // player grid position

let objects = []; // falling objects
let score = 0;
let gameSpeed = 1; // slower initial falling speed
let spawnRate = 1500; // slower initial spawn rate in milliseconds
let gameOver = false;
let gamePaused = false;

const scoreDisplay = document.getElementById('score');

let moveRight = true;
let moveLeft = false;
let nextObject = { x: Math.random() * (canvasWidth - 20), y: -20 }; // Next falling object indicator

// 30-second timer
let gameDuration = 30000; // 30 seconds
let timerDisplay = document.createElement('div');
timerDisplay.style.fontSize = '18px';
timerDisplay.style.color = 'white';
document.body.appendChild(timerDisplay);
let startTime = Date.now();
let highScore = 0;
let remainingTime = gameDuration; // to keep track of the paused time

let objectInterval;
let gameTimer;

// Pause game with space bar
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        togglePause();
    }
    if (e.key === 'ArrowLeft') {
        moveLeft = true;
        moveRight = false;
    }
    if (e.key === 'ArrowRight') {
        moveLeft = false;
        moveRight = true;
    }
});

// Toggle Pause
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearInterval(objectInterval); // Stop object generation
        clearInterval(gameTimer); // Pause the timer
    } else {
        startTime = Date.now() - (gameDuration - remainingTime); // Resume timer from where it left off
        objectInterval = setInterval(spawnObject, spawnRate); // Restart object generation
        gameTimer = setInterval(updateTimer, 1000);
    }
}

// Timer logic
function updateTimer() {
    const currentTime = Date.now();
    remainingTime = Math.max(0, gameDuration - (currentTime - startTime));
    timerDisplay.textContent = `Time: ${Math.ceil(remainingTime / 1000)}s`;

    if (remainingTime === 0) {
        endGame();
    }
}

function endGame() {
    gameOver = true;
    
    clearInterval(gameTimer);
    clearInterval(objectInterval);
    
    // Display game over message
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';

    ctx.fillText("Game Over!", canvasWidth / 2, canvasHeight / 2 - 30);
    ctx.fillText("Your Score: " + score, canvasWidth / 2, canvasHeight / 2);
    
    // Prompt the player to refresh the window
    ctx.fillText("Press F5 or refresh the page to play again", canvasWidth / 2, canvasHeight / 2 + 40);
}

function resetGame() {
    score = 0;
    gameSpeed = 1;
    spawnRate = 1500;
    scoreDisplay.textContent = score;
    objects = [];
    remainingTime = gameDuration;
    nextObject = { x: Math.random() * (canvasWidth - 20), y: -20 };
    playerX = canvasWidth / 2 - playerWidth / 2;

    clearInterval(objectInterval);
    objectInterval = setInterval(spawnObject, spawnRate);

    setTimeout(() => {
        startTime = Date.now();
        objectInterval = setInterval(spawnObject, spawnRate);
        gameTimer = setInterval(updateTimer, 1000);
        gameOver = false;
        gameLoop();
    }, 1000); // Give 1 second delay before restarting
}

function spawnObject() {
    const size = 20;
    const x = nextObject.x;
    objects.push({ x: x, y: 0, size: size });
    nextObject = { x: Math.random() * (canvasWidth - size), y: -20 }; // Update next falling object
}

function update() {
    if (gameOver || gamePaused) return;

    // Move player
    if (moveLeft) playerX -= playerVelocity;
    if (moveRight) playerX += playerVelocity;

    // Boundaries for player movement
    if (playerX < 0) playerX = 0;
    if (playerX + playerWidth > canvasWidth) playerX = canvasWidth - playerWidth;

    // Move objects down
    for (let i = 0; i < objects.length; i++) {
        objects[i].y += gameSpeed;

        // Check if object is intercepted
        if (
            objects[i].y + objects[i].size >= playerY &&
            objects[i].x + objects[i].size >= playerX &&
            objects[i].x <= playerX + playerWidth
        ) {
            score++;
            scoreDisplay.textContent = score;
            objects.splice(i, 1); // remove object on interception
            i--;
            continue;
        }

        // Remove object if it crosses the bottom of the grid
        if (objects[i].y > canvasHeight) {
            objects.splice(i, 1); // remove object from list
            i--;
        }
    }

    // Speed up game as score increases
    if (score % 10 === 0 && gameSpeed < 10) {
        gameSpeed += 0.1;
    }

    // Increase spawn rate over time
    if (score % 5 === 0 && spawnRate > 300) {
        spawnRate -= 50;
        clearInterval(objectInterval); // Update the spawn interval
        objectInterval = setInterval(spawnObject, spawnRate);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw player
    ctx.fillStyle = 'lime';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

    // Draw falling objects
    ctx.fillStyle = 'red';
    for (let i = 0; i < objects.length; i++) {
        ctx.fillRect(objects[i].x, objects[i].y, objects[i].size, objects[i].size);
    }

    // Draw next object indicator
    ctx.fillStyle = 'blue';
    ctx.fillRect(nextObject.x, 0, 20, 20); // Draw a small blue block above the grid
}

function gameLoop() {
    if (!gamePaused && !gameOver) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Start the game loop and timers
objectInterval = setInterval(spawnObject, spawnRate);
gameTimer = setInterval(updateTimer, 1000);
gameLoop();

