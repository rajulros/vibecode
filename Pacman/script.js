// Game state variables
let gameState = {
    score: 0,
    lives: 3,
    highScore: localStorage.getItem('pacmanHighScore') || 0,
    gameRunning: false,
    gameWon: false,
    totalDots: 0,
    dotsEaten: 0,
    powerMode: false,
    powerModeTimer: 0,
    powerModeDuration: 8000 // 8 seconds
};

// Game board dimensions
const BOARD_SIZE = 21;

// Player and ghost positions
let pacmanPos = { x: 10, y: 15 };
let ghosts = [
    { x: 10, y: 9, direction: { x: 1, y: 0 }, color: 'red', vulnerable: false, id: 'ghost-1' },
    { x: 9, y: 9, direction: { x: -1, y: 0 }, color: 'pink', vulnerable: false, id: 'ghost-2' },
    { x: 11, y: 9, direction: { x: 0, y: 1 }, color: 'cyan', vulnerable: false, id: 'ghost-3' },
    { x: 10, y: 10, direction: { x: 0, y: -1 }, color: 'orange', vulnerable: false, id: 'ghost-4' }
];
let pacmanDirection = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// Game elements
let gameBoard;
let pacmanElement;
let gameInterval;
let ghostInterval;
let powerModeInterval;

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
    updateAllGhostPositions();
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
        pacmanElement.className = gameState.powerMode ? 'pacman power-mode right' : 'pacman right';
        pacmanElement.id = 'pacman';
        targetCell.appendChild(pacmanElement);
    }
}

// Update all ghost positions
function updateAllGhostPositions() {
    // Remove all existing ghosts
    const existingGhosts = document.querySelectorAll('[id^="ghost-"]');
    existingGhosts.forEach(ghost => ghost.remove());
    
    // Add ghosts to their new positions
    ghosts.forEach(ghost => {
        const targetCell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (targetCell) {
            const ghostElement = document.createElement('div');
            ghostElement.className = ghost.vulnerable ? `ghost ${ghost.color} vulnerable` : `ghost ${ghost.color}`;
            ghostElement.id = ghost.id;
            targetCell.appendChild(ghostElement);
        }
    });
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
            pacmanElement.className = gameState.powerMode ? 'pacman power-mode right' : 'pacman right';
        } else if (pacmanDirection.x < 0) {
            pacmanElement.className = gameState.powerMode ? 'pacman power-mode left' : 'pacman left';
        } else if (pacmanDirection.y > 0) {
            pacmanElement.className = gameState.powerMode ? 'pacman power-mode down' : 'pacman down';
        } else if (pacmanDirection.y < 0) {
            pacmanElement.className = gameState.powerMode ? 'pacman power-mode up' : 'pacman up';
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
        
        // Activate enchanted mode (power mode)
        activatePowerMode();
    }
    
    updateDisplay();
    
    // Check win condition
    if (gameState.dotsEaten >= gameState.totalDots) {
        winGame();
    }
}

// Activate power mode
function activatePowerMode() {
    gameState.powerMode = true;
    gameState.powerModeTimer = gameState.powerModeDuration;
    
    // Make all ghosts vulnerable
    ghosts.forEach(ghost => {
        ghost.vulnerable = true;
    });
    
    updateAllGhostPositions();
    updatePacmanPosition(); // Update Pac-Man appearance
    
    // Start power mode countdown
    if (powerModeInterval) {
        clearInterval(powerModeInterval);
    }
    
    powerModeInterval = setInterval(() => {
        gameState.powerModeTimer -= 100;
        
        if (gameState.powerModeTimer <= 0) {
            deactivatePowerMode();
        }
    }, 100);
}

// Deactivate power mode
function deactivatePowerMode() {
    gameState.powerMode = false;
    gameState.powerModeTimer = 0;
    
    // Make all ghosts normal again
    ghosts.forEach(ghost => {
        ghost.vulnerable = false;
    });
    
    updateAllGhostPositions();
    updatePacmanPosition(); // Update Pac-Man appearance
    
    if (powerModeInterval) {
        clearInterval(powerModeInterval);
        powerModeInterval = null;
    }
}

// Move Ghost (simple AI)
function moveGhost() {
    ghosts.forEach((ghost, index) => {
        const possibleMoves = [
            { x: 1, y: 0 },   // right
            { x: -1, y: 0 },  // left
            { x: 0, y: 1 },   // down
            { x: 0, y: -1 }   // up
        ];
        
        // Filter out invalid moves and the opposite direction
        const validMoves = possibleMoves.filter(move => {
            const newX = ghost.x + move.x;
            const newY = ghost.y + move.y;
            const isOpposite = move.x === -ghost.direction.x && move.y === -ghost.direction.y;
            return isValidPosition(newX, newY) && !isOpposite;
        });
        
        if (validMoves.length === 0) {
            // If no valid moves, reverse direction
            ghost.direction.x = -ghost.direction.x;
            ghost.direction.y = -ghost.direction.y;
        } else if (validMoves.length === 1) {
            // Only one valid move
            ghost.direction = validMoves[0];
        } else {
            // Multiple valid moves - different behavior based on ghost and power mode
            const dx = pacmanPos.x - ghost.x;
            const dy = pacmanPos.y - ghost.y;
            
            let chaseChance = 0.7; // Default chase probability
            
            // Different AI behaviors for different ghosts
            switch(ghost.color) {
                case 'red': chaseChance = 0.8; break;    // Most aggressive
                case 'pink': chaseChance = 0.6; break;   // Moderate
                case 'cyan': chaseChance = 0.5; break;   // Less aggressive
                case 'orange': chaseChance = 0.4; break; // Least aggressive
            }
            
            // If vulnerable, run away from Pac-Man
            if (ghost.vulnerable) {
                chaseChance = 0.1; // 10% chance to chase, 90% to run away
            }
            
            if (Math.random() < chaseChance && !ghost.vulnerable) {
                // Chase Pac-Man
                const towardsPacman = validMoves.filter(move => {
                    return (dx > 0 && move.x > 0) || (dx < 0 && move.x < 0) ||
                           (dy > 0 && move.y > 0) || (dy < 0 && move.y < 0);
                });
                
                if (towardsPacman.length > 0) {
                    ghost.direction = towardsPacman[Math.floor(Math.random() * towardsPacman.length)];
                } else {
                    ghost.direction = validMoves[Math.floor(Math.random() * validMoves.length)];
                }
            } else if (ghost.vulnerable) {
                // Run away from Pac-Man
                const awayFromPacman = validMoves.filter(move => {
                    return (dx > 0 && move.x < 0) || (dx < 0 && move.x > 0) ||
                           (dy > 0 && move.y < 0) || (dy < 0 && move.y > 0);
                });
                
                if (awayFromPacman.length > 0) {
                    ghost.direction = awayFromPacman[Math.floor(Math.random() * awayFromPacman.length)];
                } else {
                    ghost.direction = validMoves[Math.floor(Math.random() * validMoves.length)];
                }
            } else {
                // Random movement
                ghost.direction = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
        }
        
        // Move the ghost
        const newX = ghost.x + ghost.direction.x;
        const newY = ghost.y + ghost.direction.y;
        
        if (isValidPosition(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }
    });
    
    updateAllGhostPositions();
    checkCollision();
}

// Check collision between Pac-Man and Ghost
function checkCollision() {
    ghosts.forEach((ghost, index) => {
        if (pacmanPos.x === ghost.x && pacmanPos.y === ghost.y) {
            if (ghost.vulnerable && gameState.powerMode) {
                // Eat the ghost!
                gameState.score += 200 * (index + 1); // Progressive scoring
                
                // Reset ghost to center position and make it normal
                ghost.x = 10;
                ghost.y = 9;
                ghost.vulnerable = false;
                ghost.direction = { x: Math.random() > 0.5 ? 1 : -1, y: 0 };
                
                updateAllGhostPositions();
            } else if (!ghost.vulnerable) {
                loseLife();
                return;
            }
        }
    });
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
            if (gameState.lives > 0) {
                startGameLoop();
            }
        }, 1000);
        stopGameLoop();
    }
}

// Reset Pac-Man and Ghost positions
function resetPositions() {
    pacmanPos = { x: 10, y: 15 };
    
    // Reset all ghosts to their starting positions
    ghosts[0] = { x: 10, y: 9, direction: { x: 1, y: 0 }, color: 'red', vulnerable: false, id: 'ghost-1' };
    ghosts[1] = { x: 9, y: 9, direction: { x: -1, y: 0 }, color: 'pink', vulnerable: false, id: 'ghost-2' };
    ghosts[2] = { x: 11, y: 9, direction: { x: 0, y: 1 }, color: 'cyan', vulnerable: false, id: 'ghost-3' };
    ghosts[3] = { x: 10, y: 10, direction: { x: 0, y: -1 }, color: 'orange', vulnerable: false, id: 'ghost-4' };
    
    pacmanDirection = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    
    // Reset power mode
    deactivatePowerMode();
    
    updatePacmanPosition();
    updateAllGhostPositions();
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
    showGameOver('ADVENTURE COMPLETE!', 'You collected all the emeralds! Well done, miner!');
}

// Game over
function gameOver() {
    gameState.gameRunning = false;
    stopGameLoop();
    
    updateHighScore();
    showGameOver('YOU DIED!', 'The hostile mobs overwhelmed you! Respawn to try again.');
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
    gameState.powerMode = false;
    gameState.powerModeTimer = 0;
    
    document.getElementById('start-btn').textContent = 'START ADVENTURE';
    document.getElementById('game-over').style.display = 'none';
    
    // Clear power mode interval
    if (powerModeInterval) {
        clearInterval(powerModeInterval);
        powerModeInterval = null;
    }
    
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
        life.textContent = '❤️';
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
                e.preventDefault();
                nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                e.preventDefault();
                nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                e.preventDefault();
                nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextDirection = { x: 1, y: 0 };
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
            handleDirectionInput(button.dataset.direction);
        });
        
        // Also handle click events for desktop testing
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleDirectionInput(button.dataset.direction);
        });
    });
    
    // Swipe gesture controls
    setupSwipeControls();
}

// Handle direction input from touch controls
function handleDirectionInput(direction) {
    if (!gameState.gameRunning) return;
    
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
                nextDirection = { x: 1, y: 0 }; // Right
            } else {
                nextDirection = { x: -1, y: 0 }; // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                nextDirection = { x: 0, y: 1 }; // Down
            } else {
                nextDirection = { x: 0, y: -1 }; // Up
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
