// Game state variables
let gameState = {
    score: 0,
    lives: 3,
    highScore: localStorage.getItem('pacmanHighScore') || 0,
    gameRunning: false,
    gameWon: false,
    totalDots: 0,
    dotsEaten: 0
};

// Game board dimensions
const BOARD_SIZE = 21;

// Player and ghost positions
let pacmanPos = { x: 10, y: 15 };
let ghostPos = { x: 10, y: 9 };
let pacmanDirection = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let ghostDirection = { x: 1, y: 0 };

// Game elements
let gameBoard;
let pacmanElement;
let ghostElement;
let gameInterval;
let ghostInterval;

// Maze layout (1 = wall, 0 = path with dot, 2 = path without dot, 3 = big dot)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,3,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1,1],
    [2,2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,1],
    [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Initialize the game
function initGame() {
    gameBoard = document.getElementById('game-board');
    createBoard();
    createPacman();
    createGhost();
    updateDisplay();
    setupEventListeners();
}

// Create the game board
function createBoard() {
    gameBoard.innerHTML = '';
    gameState.totalDots = 0;
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            
            if (maze[y][x] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
                
                if (maze[y][x] === 0) {
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    cell.appendChild(dot);
                    gameState.totalDots++;
                } else if (maze[y][x] === 3) {
                    const bigDot = document.createElement('div');
                    bigDot.className = 'big-dot';
                    cell.appendChild(bigDot);
                    gameState.totalDots++;
                }
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// Create Pac-Man
function createPacman() {
    updatePacmanPosition();
}

// Create Ghost
function createGhost() {
    updateGhostPosition();
}

// Update Pac-Man position
function updatePacmanPosition() {
    // Remove pacman from current cell
    const currentPacman = document.querySelector('.pacman');
    if (currentPacman && currentPacman.parentNode) {
        currentPacman.remove();
    }
    
    // Add pacman to new cell
    const targetCell = document.getElementById(`cell-${pacmanPos.x}-${pacmanPos.y}`);
    if (targetCell) {
        pacmanElement = document.createElement('div');
        pacmanElement.className = 'pacman right';
        pacmanElement.id = 'pacman';
        targetCell.appendChild(pacmanElement);
    }
}

// Update Ghost position
function updateGhostPosition() {
    // Remove ghost from current cell
    const currentGhost = document.querySelector('.ghost');
    if (currentGhost && currentGhost.parentNode) {
        currentGhost.remove();
    }
    
    // Add ghost to new cell
    const targetCell = document.getElementById(`cell-${ghostPos.x}-${ghostPos.y}`);
    if (targetCell) {
        ghostElement = document.createElement('div');
        ghostElement.className = 'ghost';
        ghostElement.id = 'ghost';
        targetCell.appendChild(ghostElement);
    }
}

// Check if position is valid (not a wall)
function isValidPosition(x, y) {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
        return false;
    }
    return maze[y][x] !== 1;
}

// Move Pac-Man
function movePacman() {
    // Try to change direction if a new direction was requested
    if (nextDirection.x !== 0 || nextDirection.y !== 0) {
        const newX = pacmanPos.x + nextDirection.x;
        const newY = pacmanPos.y + nextDirection.y;
        
        if (isValidPosition(newX, newY)) {
            pacmanDirection = { ...nextDirection };
            nextDirection = { x: 0, y: 0 };
        }
    }
    
    // Move in current direction
    const newX = pacmanPos.x + pacmanDirection.x;
    const newY = pacmanPos.y + pacmanDirection.y;
    
    if (isValidPosition(newX, newY)) {
        pacmanPos.x = newX;
        pacmanPos.y = newY;
        
        // Update Pac-Man's visual direction
        if (pacmanDirection.x > 0) {
            pacmanElement.className = 'pacman right';
        } else if (pacmanDirection.x < 0) {
            pacmanElement.className = 'pacman left';
        } else if (pacmanDirection.y > 0) {
            pacmanElement.className = 'pacman down';
        } else if (pacmanDirection.y < 0) {
            pacmanElement.className = 'pacman up';
        }
        
        updatePacmanPosition();
        checkDotCollection();
        checkCollision();
    } else {
        // Stop moving if hit a wall
        pacmanDirection = { x: 0, y: 0 };
    }
}

// Check if Pac-Man collected a dot
function checkDotCollection() {
    const cell = document.getElementById(`cell-${pacmanPos.x}-${pacmanPos.y}`);
    const dot = cell.querySelector('.dot');
    const bigDot = cell.querySelector('.big-dot');
    
    if (dot) {
        dot.remove();
        gameState.score += 10;
        gameState.dotsEaten++;
    } else if (bigDot) {
        bigDot.remove();
        gameState.score += 50;
        gameState.dotsEaten++;
    }
    
    updateDisplay();
    
    // Check win condition
    if (gameState.dotsEaten >= gameState.totalDots) {
        winGame();
    }
}

// Move Ghost (simple AI)
function moveGhost() {
    const possibleMoves = [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: 1 },   // down
        { x: 0, y: -1 }   // up
    ];
    
    // Filter out invalid moves and the opposite direction (to prevent immediate reversal)
    const validMoves = possibleMoves.filter(move => {
        const newX = ghostPos.x + move.x;
        const newY = ghostPos.y + move.y;
        const isOpposite = move.x === -ghostDirection.x && move.y === -ghostDirection.y;
        return isValidPosition(newX, newY) && !isOpposite;
    });
    
    if (validMoves.length === 0) {
        // If no valid moves, reverse direction
        ghostDirection.x = -ghostDirection.x;
        ghostDirection.y = -ghostDirection.y;
    } else if (validMoves.length === 1) {
        // Only one valid move
        ghostDirection = validMoves[0];
    } else {
        // Multiple valid moves - choose one towards Pac-Man or random
        const dx = pacmanPos.x - ghostPos.x;
        const dy = pacmanPos.y - ghostPos.y;
        
        // 70% chance to move towards Pac-Man, 30% chance random
        if (Math.random() < 0.7) {
            const towardsPacman = validMoves.filter(move => {
                return (dx > 0 && move.x > 0) || (dx < 0 && move.x < 0) ||
                       (dy > 0 && move.y > 0) || (dy < 0 && move.y < 0);
            });
            
            if (towardsPacman.length > 0) {
                ghostDirection = towardsPacman[Math.floor(Math.random() * towardsPacman.length)];
            } else {
                ghostDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
        } else {
            ghostDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    }
    
    // Move the ghost
    const newX = ghostPos.x + ghostDirection.x;
    const newY = ghostPos.y + ghostDirection.y;
    
    if (isValidPosition(newX, newY)) {
        ghostPos.x = newX;
        ghostPos.y = newY;
        updateGhostPosition();
        checkCollision();
    }
}

// Check collision between Pac-Man and Ghost
function checkCollision() {
    if (pacmanPos.x === ghostPos.x && pacmanPos.y === ghostPos.y) {
        loseLife();
    }
}

// Lose a life
function loseLife() {
    gameState.lives--;
    updateDisplay();
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        resetPositions();
        // Brief pause before continuing
        setTimeout(() => {
            if (gameState.gameRunning) {
                startGameLoop();
            }
        }, 1000);
        stopGameLoop();
    }
}

// Reset Pac-Man and Ghost positions
function resetPositions() {
    pacmanPos = { x: 10, y: 15 };
    ghostPos = { x: 10, y: 9 };
    pacmanDirection = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    ghostDirection = { x: 1, y: 0 };
    
    updatePacmanPosition();
    updateGhostPosition();
}

// Start game
function startGame() {
    if (!gameState.gameRunning) {
        gameState.gameRunning = true;
        document.getElementById('start-btn').textContent = 'PAUSE';
        startGameLoop();
    } else {
        pauseGame();
    }
}

// Pause game
function pauseGame() {
    gameState.gameRunning = false;
    document.getElementById('start-btn').textContent = 'RESUME';
    stopGameLoop();
}

// Start game loop
function startGameLoop() {
    gameInterval = setInterval(movePacman, 200);
    ghostInterval = setInterval(moveGhost, 300);
}

// Stop game loop
function stopGameLoop() {
    clearInterval(gameInterval);
    clearInterval(ghostInterval);
}

// Win game
function winGame() {
    gameState.gameWon = true;
    gameState.gameRunning = false;
    stopGameLoop();
    
    // Bonus points for remaining lives
    gameState.score += gameState.lives * 100;
    
    updateHighScore();
    showGameOver('LEVEL COMPLETE!', 'Congratulations! You won!');
}

// Game over
function gameOver() {
    gameState.gameRunning = false;
    stopGameLoop();
    
    updateHighScore();
    showGameOver('GAME OVER', 'Better luck next time!');
}

// Update high score
function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('pacmanHighScore', gameState.highScore);
    }
    updateDisplay();
}

// Show game over screen
function showGameOver(title, message) {
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-message').textContent = message;
    document.getElementById('game-over').style.display = 'flex';
}

// Reset game
function resetGame() {
    stopGameLoop();
    
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameRunning = false;
    gameState.gameWon = false;
    gameState.dotsEaten = 0;
    
    document.getElementById('start-btn').textContent = 'START GAME';
    document.getElementById('game-over').style.display = 'none';
    
    resetPositions();
    createBoard();
    updateDisplay();
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('high-score').textContent = gameState.highScore;
    
    const livesDisplay = document.getElementById('lives-display');
    livesDisplay.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        const life = document.createElement('span');
        life.className = 'life';
        life.textContent = '🟡';
        livesDisplay.appendChild(life);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameState.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown':
                nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft':
                nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight':
                nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
        }
    });
    
    // Mobile touch controls
    setupTouchControls();
    
    // Button controls
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        resetGame();
    });
}

// Setup mobile touch controls
function setupTouchControls() {
    // D-pad button controls
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameState.gameRunning) return;
            
            const direction = button.getAttribute('data-direction');
            switch(direction) {
                case 'up':
                    nextDirection = { x: 0, y: -1 };
                    break;
                case 'down':
                    nextDirection = { x: 0, y: 1 };
                    break;
                case 'left':
                    nextDirection = { x: -1, y: 0 };
                    break;
                case 'right':
                    nextDirection = { x: 1, y: 0 };
                    break;
            }
        });
        
        // Also handle click events for desktop testing
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameState.gameRunning) return;
            
            const direction = button.getAttribute('data-direction');
            switch(direction) {
                case 'up':
                    nextDirection = { x: 0, y: -1 };
                    break;
                case 'down':
                    nextDirection = { x: 0, y: 1 };
                    break;
                case 'left':
                    nextDirection = { x: -1, y: 0 };
                    break;
                case 'right':
                    nextDirection = { x: 1, y: 0 };
                    break;
            }
        });
    });
    
    // Swipe gesture controls
    setupSwipeControls();
}

// Setup swipe gesture controls
function setupSwipeControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const gameBoard = document.getElementById('game-board');
    
    gameBoard.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    gameBoard.addEventListener('touchend', (e) => {
        if (!gameState.gameRunning) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 30; // Minimum distance for a swipe
        
        // Check if swipe is long enough
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }
        
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                // Swipe right
                nextDirection = { x: 1, y: 0 };
            } else {
                // Swipe left
                nextDirection = { x: -1, y: 0 };
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                // Swipe down
                nextDirection = { x: 0, y: 1 };
            } else {
                // Swipe up
                nextDirection = { x: 0, y: -1 };
            }
        }
    }
    
    // Prevent scrolling on touch
    gameBoard.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
