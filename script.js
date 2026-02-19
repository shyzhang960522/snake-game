// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverDiv = document.getElementById('gameOver');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const newGameBtn = document.getElementById('newGameBtn');

// 游戏参数
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let isGameRunning = false;

// 初始化
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    snake = [
        {x: 10 * gridSize, y: 10 * gridSize},
        {x: 9 * gridSize, y: 10 * gridSize},
        {x: 8 * gridSize, y: 10 * gridSize}
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    isPaused = false;
    isGameRunning = true;
    gameOverDiv.classList.add('hidden');
    pauseBtn.textContent = '暂停';
    pauseBtn.disabled = false;
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
    };
    
    // 确保食物不生成在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
            // 蛇头边框
            ctx.strokeStyle = '#81C784';
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
            // 眼睛
            ctx.fillStyle = '#fff';
            ctx.fillRect(segment.x + 4, segment.y + 4, 4, 4);
            ctx.fillRect(segment.x + 12, segment.y + 4, 4, 4);
        } else {
            // 蛇身
            const alpha = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
            ctx.fillRect(segment.x + 1, segment.y + 1, gridSize - 3, gridSize - 3);
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2,
        food.y + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    // 食物高光
    ctx.fillStyle = '#ff7961';
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2 - 3,
        food.y + gridSize / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 更新游戏状态
function update() {
    if (isPaused || !isGameRunning) return;
    
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 撞墙检测
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }
    
    // 撞自己检测
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // 吃食物检测
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        generateFood();
    } else {
        snake.pop();
    }
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverDiv.classList.remove('hidden');
    pauseBtn.disabled = true;
}

// 游戏主循环
function gameStep() {
    update();
    draw();
}

// 开始游戏
function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    initGame();
    draw();
    gameLoop = setInterval(gameStep, 100);
    startBtn.disabled = true;
}

// 暂停/继续游戏
function togglePause() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 重新开始
function restartGame() {
    if (gameLoop) clearInterval(gameLoop);
    startGame();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) {
        if (e.key === ' ' && isGameRunning) {
            e.preventDefault();
            togglePause();
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -gridSize;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = gridSize;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -gridSize;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = gridSize;
                dy = 0;
            }
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
});

// 按钮事件绑定
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
newGameBtn.addEventListener('click', () => {
    gameOverDiv.classList.add('hidden');
    startGame();
});

// 初始绘制
draw();
