// AI Chat Context Test Script
// This file helps test the "chat.promptFiles": true feature

class AIChatTester {
    constructor() {
        this.projectFiles = [
            'Wordle/index.html',
            'Wordle/script.js', 
            'Wordle/style.css',
            'Wordle/auto-word-updater.js',
            'Pacman/index.html',
            'Pacman/script.js'
        ];
    }

    // Test function for Wordle game logic
    testWordleEvaluation(guess, target) {
        console.log(`Testing: ${guess} vs ${target}`);
        // This should trigger AI to include script.js context
        return this.mockEvaluateGuess(guess, target);
    }

    // Test function for mobile responsiveness
    testMobileLayout() {
        console.log('Testing mobile layout...');
        // This should trigger AI to include style.css context
        const isMobile = window.innerWidth <= 768;
        return {
            isMobile,
            screenWidth: window.innerWidth,
            keyboardFits: this.checkKeyboardFit()
        };
    }

    // Test function for game state
    testGameState() {
        console.log('Checking game state...');
        // This should trigger AI to include game management context
        if (window.vibeWordleGame) {
            return {
                targetWord: window.vibeWordleGame.targetWord,
                currentRow: window.vibeWordleGame.currentRow,
                gameState: window.vibeWordleGame.gameState,
                guesses: window.vibeWordleGame.guesses
            };
        }
        return null;
    }

    // Mock evaluation for testing
    mockEvaluateGuess(guess, target) {
        const result = [];
        const guessArray = guess.split('');
        const targetArray = target.split('');
        const targetCounts = {};

        // Count target letters
        targetArray.forEach(letter => {
            targetCounts[letter] = (targetCounts[letter] || 0) + 1;
        });

        // First pass: correct positions
        guessArray.forEach((letter, index) => {
            if (letter === targetArray[index]) {
                result[index] = 'correct';
                targetCounts[letter]--;
            }
        });

        // Second pass: present/absent
        guessArray.forEach((letter, index) => {
            if (result[index] === undefined) {
                if (targetCounts[letter] > 0) {
                    result[index] = 'present';
                    targetCounts[letter]--;
                } else {
                    result[index] = 'absent';
                }
            }
        });

        return result;
    }

    checkKeyboardFit() {
        // Mock keyboard fit check
        const keyboardRows = document.querySelectorAll('.key-row');
        if (keyboardRows.length === 0) return true;

        const firstRow = keyboardRows[0];
        const keys = firstRow.querySelectorAll('.key');
        if (keys.length === 0) return true;

        const totalKeyWidth = Array.from(keys).reduce((sum, key) => {
            return sum + key.offsetWidth + 4; // 4px gap
        }, 0);

        return totalKeyWidth <= window.innerWidth - 20; // 20px padding
    }

    // Generate test report
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            projectFiles: this.projectFiles,
            tests: {
                evaluation: this.testWordleEvaluation('CRANE', 'SPACE'),
                mobile: this.testMobileLayout(),
                gameState: this.testGameState()
            },
            chatSettings: {
                promptFiles: true,
                expectedBehavior: 'AI should include relevant files in responses'
            }
        };
    }
}

// Make available globally for testing
if (typeof window !== 'undefined') {
    window.AIChatTester = AIChatTester;
    window.chatTester = new AIChatTester();
    
    console.log('🤖 AI Chat Tester loaded. Try:');
    console.log('- chatTester.generateReport()');
    console.log('- chatTester.testWordleEvaluation("CRANE", "SPACE")');
    console.log('- chatTester.testMobileLayout()');
}

export default AIChatTester;
