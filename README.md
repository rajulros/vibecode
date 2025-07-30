# VibeCode - Pac-Man Game 🟡👻

A classic Pac-Man game implementation using HTML, CSS, and JavaScript. Navigate through a maze, collect dots, and avoid the ghost in this nostalgic arcade experience!

## 🎮 Game Overview

This is a faithful recreation of the classic Pac-Man game featuring:
- **Yellow Pac-Man character** with chomping animations
- **Single red ghost** with intelligent AI pursuit
- **Blue maze environment** with classic arcade aesthetics
- **Dot collection gameplay** with scoring system
- **Lives system** with game over conditions
- **High score tracking** with local storage persistence

## 🚀 How to Play

1. **Open the game**: Launch `Pacman/index.html` in your web browser
2. **Start playing**: Click the "START GAME" button
3. **Move Pac-Man**: Use the arrow keys (↑ ↓ ← →) to navigate
4. **Collect dots**: Eat all yellow dots scattered throughout the maze
5. **Avoid the ghost**: Don't let the red ghost catch you!
6. **Win condition**: Collect all dots to complete the level
7. **Lives**: You have 3 lives - lose one each time the ghost catches you

## 🎯 Game Features

### Core Gameplay
- **Maze Navigation**: Move through corridors and avoid walls
- **Dot Collection**: Small dots (10 points) and big power pellets (50 points)
- **Ghost AI**: Intelligent ghost that pursues Pac-Man with 70% accuracy
- **Collision Detection**: Precise collision system for walls, dots, and ghost
- **Score System**: Points awarded for collecting dots and bonus for remaining lives

### Visual & Audio
- **Classic Aesthetics**: Blue maze walls, yellow Pac-Man, red ghost
- **Smooth Animations**: Pac-Man chomping, ghost floating, power pellet pulsing
- **Directional Sprites**: Pac-Man rotates based on movement direction
- **Responsive Design**: Adapts to different screen sizes

### Game Management
- **Start/Pause/Reset**: Full game state control
- **Lives Display**: Visual representation of remaining lives
- **High Score**: Persistent high score tracking using localStorage
- **Game Over Screen**: Victory or defeat messages with restart option

## 📁 Project Structure

```
Pacman/
├── index.html      # Main game HTML structure
├── style.css       # Game styling and animations
└── script.js       # Game logic and functionality
```

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5**: Game structure and DOM elements
- **CSS3**: Styling, animations, and responsive design
- **Vanilla JavaScript**: Game logic, AI, and event handling

### Key Components
- **Game Board**: 21x21 grid-based maze system
- **Character Movement**: Position-based movement with direction queuing
- **Ghost AI**: Pathfinding algorithm with random behavior mixing
- **State Management**: Comprehensive game state tracking
- **Local Storage**: High score persistence between sessions

### Game Loop
1. **Input Processing**: Capture and queue player movement
2. **Character Updates**: Move Pac-Man and ghost based on maze constraints
3. **Collision Detection**: Check for wall collisions, dot collection, and ghost encounters
4. **State Updates**: Update score, lives, and win/lose conditions
5. **Display Refresh**: Update visual elements and animations

## 🎲 Game Rules

### Scoring
- **Small Dot**: 10 points
- **Power Pellet**: 50 points
- **Life Bonus**: 100 points per remaining life (win condition)

### Lives System
- Start with **3 lives**
- Lose a life when ghost catches Pac-Man
- Game over when all lives are lost
- Positions reset after losing a life (except on game over)

### Win Conditions
- **Victory**: Collect all dots in the maze
- **Defeat**: Lose all lives to the ghost

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional installations required

### Running the Game
1. Clone or download this repository
2. Navigate to the `Pacman` folder
3. Open `index.html` in your web browser
4. Click "START GAME" and enjoy!

### Controls
- **↑ Arrow Key**: Move up
- **↓ Arrow Key**: Move down
- **← Arrow Key**: Move left
- **→ Arrow Key**: Move right
- **Start Button**: Begin/pause game
- **Reset Button**: Restart game

## 🎨 Customization

The game is designed to be easily customizable:

### Maze Layout
Edit the `maze` array in `script.js` to create new levels:
- `1` = Wall
- `0` = Path with dot
- `2` = Empty path
- `3` = Power pellet

### Styling
Modify `style.css` to change:
- Colors and themes
- Character sizes
- Animation speeds
- Board dimensions

### Game Mechanics
Adjust `script.js` parameters:
- Movement speeds
- Scoring values
- Ghost AI behavior
- Starting lives

## 🐛 Known Issues & Future Enhancements

### Potential Improvements
- Multiple ghost characters
- Power pellet temporary ghost vulnerability
- Multiple levels with increasing difficulty
- Sound effects and background music
- Mobile touch controls
- Leaderboard system

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements or bug fixes!

---

**Enjoy the game and happy coding! 🎮✨**