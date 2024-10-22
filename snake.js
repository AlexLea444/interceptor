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
let gameSpeed = 2; // initial falling speed of objects
let spawnRate = 1000; // how often objects are spawned in milliseconds
let gameOver = false;

const scoreDisplay = document.getElementById('score');

// Handle player movement
let moveRight = true;
let moveLeft = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        moveLeft = true;
        moveRight = false;
    }
    if (e.key === 'ArrowRight') {
        moveLeft = false;
        moveRight = true;
    }
});

function spawnObject() {
    const size = 20;
    const x = Math.random() * (canvasWidth - size);
    objects.push({ x: x, y: 0, size: size });
}

function update() {
    if (gameOver) return;

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
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Spawn objects at regular intervals
setInterval(spawnObject, spawnRate);

// Start the game loop
gameLoop();

