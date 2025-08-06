# AI Chat File Inclusion Test

This file tests the `"chat.promptFiles": true` setting in VS Code.

## Current Wordle Project Structure

The workspace contains:
- **Wordle Game**: Complete HTML5 Wordle implementation
- **Pacman Game**: Classic arcade game recreation
- **Mobile Responsive**: Touch-friendly interfaces
- **Auto-updating Dictionary**: Dynamic word lists

## Key Files for AI Context

### Core Game Files:
1. `Wordle/index.html` - Main game interface
2. `Wordle/script.js` - Game logic and evaluation
3. `Wordle/style.css` - Responsive styling
4. `Wordle/auto-word-updater.js` - Dynamic word fetching

### Debug & Test Files:
1. `Wordle/debug_test.html` - Evaluation logic testing
2. `Wordle/evaluation_test.html` - Color logic verification
3. `Wordle/dictionary-dashboard.html` - Word management UI

## Test Questions for AI Chat

Try asking these questions to test file inclusion:

1. "How does the Wordle color evaluation work?"
   - Should include: script.js (evaluateGuess function)

2. "What mobile optimizations exist?"
   - Should include: style.css (media queries)

3. "How is the game board created?"
   - Should include: script.js (createBoard function)

4. "What debugging tools are available?"
   - Should include: debug_test.html, evaluation_test.html

## Expected Behavior

With `"chat.promptFiles": true`, the AI should automatically:
- ✅ Include relevant source files in responses
- ✅ Reference specific code sections
- ✅ Provide context-aware answers
- ✅ Suggest modifications based on existing code

## Testing Commands

```javascript
// In browser console:
getCurrentTarget()     // Get current word
testWordle()          // Run evaluation tests  
checkCurrentGame()    // View game state
```

Last updated: August 6, 2025
