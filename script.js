let gameStarted = false;

// background variables
let bgX = 0;

// ========= SOUNDS =========
const jumpSound = new Audio("assets/jump.wav");
const gameOverSound = new Audio("assets/gameover.wav");

// ========= CANVAS =========
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========= IMAGES =========
const manImg = new Image();
manImg.src = "assets/man.png";

const dogImg = new Image();
dogImg.src = "assets/dog.png";

const obstacleImg = new Image();
obstacleImg.src = "assets/obstacle.png";

// ========= GAME VARIABLES =========
const groundHeight = 40;
let gameSpeed = 5;
let gameOver = false;
let score = 0;

// ========= PLAYER =========
const player = {
    x: 220,
    y: canvas.height - groundHeight - 50,
    width: 40,
    height: 50,
    velocityY: 0,
    gravity: 0.8,
    jumpPower: -12,
    onGround: true
};

// ========= DOG =========
const dog = {
    x: 0,
    y: canvas.height - groundHeight - 35,
    width: 50,
    height: 35,
    distance: 220
};

// ========= OBSTACLES =========
let obstacles = [];
let obstacleTimer = 0;

// ========= GAME LOOP =========
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    drawBackground();
    drawGround();

    updatePlayer();
    drawPlayer();

    updateDog();
    drawDog();

    updateObstacles();
    drawObstacles();

    drawScore();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        drawGameOver();
    }
}

// ========= DRAW =========
function drawStartScreen() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Run From The Dog 🐕", 240, 120);

    ctx.font = "18px Arial";
    ctx.fillText("Press SPACE to Start", 300, 170);
}

function drawGround() {
    ctx.fillStyle = "#444";
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawPlayer() {
    ctx.drawImage(manImg, player.x, player.y, player.width, player.height);
}

function drawDog() {
    ctx.drawImage(dogImg, dog.x, dog.y, dog.width, dog.height);
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
    });
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 650, 30);
}

// ========= UPDATE =========
function updatePlayer() {
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= canvas.height - groundHeight) {
        player.y = canvas.height - groundHeight - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
}

function updateDog() {
    const targetX = player.x - dog.distance;

    // smooth follow
    dog.x += (targetX - dog.x) * 0.05;

    if (checkCollision(player, dog) && !gameOver) {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        gameOver = true;
    }
}

function updateObstacles() {
    obstacleTimer++;

    if (obstacleTimer > 90) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - groundHeight - 40,
            width: 40,
            height: 40
        });
        obstacleTimer = 0;
    }

    obstacles.forEach(obs => obs.x -= gameSpeed);
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    obstacles.forEach(obs => {
        if (checkCollision(player, obs)) {
            dog.distance -= 20;
            obs.x = -100;
        }
    });

    score++;

    if (score % 300 === 0) {
        gameSpeed += 0.3;
    }
}

// ========= COLLISION =========
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// ========= GAME OVER =========
function drawGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 260, 140);

    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, 310, 180);
    ctx.fillText("Press SPACE to Restart", 270, 220);
}

// ========= CONTROLS =========
document.addEventListener("keydown", e => {
    if (e.code === "Space") {

        if (!gameStarted) {
            gameStarted = true;
            return;
        }

        if (!gameOver && player.onGround) {
            player.velocityY = player.jumpPower;
            player.onGround = false;
            jumpSound.currentTime = 0;
            jumpSound.play();
        } else if (gameOver) {
            restartGame();
        }
    }
});

// ========= BACKGROUND =========
function drawBackground() {
    ctx.fillStyle = "#e6f2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height - groundHeight);

    ctx.fillStyle = "#ccc";
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect((i + bgX) % canvas.width, canvas.height - groundHeight - 5, 20, 2);
    }

    bgX -= gameSpeed;
}

// ========= RESTART =========
function restartGame() {
    obstacles = [];
    score = 0;
    dog.distance = 220; // FIXED
    gameSpeed = 5;
    gameOver = false;
    gameStarted = false;
    bgX = 0;            // FIXED
    gameLoop();
}

// ========= START =========
gameLoop();
