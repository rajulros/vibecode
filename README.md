# VibeCode - Minecraft Maze Runner ⛏️🎮

A Minecraft-themed maze adventure game built with HTML, CSS, and JavaScript! Guide Steve through underground caves, collect emeralds, and avoid hostile mobs in this blocky, pixelated adventure inspired by the beloved sandbox game.

## 🎮 Game Overview

Experience the classic maze-running gameplay with a full Minecraft makeover featuring:
- **Steve character** with authentic Minecraft blocky design and walking animations
- **4 different hostile mobs** with unique AI behaviors and Minecraft-inspired appearances
- **Emerald collection** with sparkling gem effects
- **Golden Apple power-ups** that grant temporary enchanted abilities
- **Minecraft UI aesthetics** with wooden textures and pixelated fonts
- **Cave-like environment** with stone brick walls and grass pathways

## 🚀 How to Play

1. **Start your adventure**: Launch `Pacman/index.html` in your web browser
2. **Begin the quest**: Click the "START ADVENTURE" button
3. **Control Steve**: Use arrow keys (desktop) or touch controls (mobile) to navigate
4. **Collect emeralds**: Gather all the sparkling green gems throughout the cave
5. **Grab golden apples**: Pick up power-ups to enter enchanted mode
6. **Fight hostile mobs**: During enchanted mode, defeat mobs for bonus points
7. **Survival goal**: Avoid mobs when not enchanted - they'll cost you hearts!
8. **Victory condition**: Collect all emeralds to complete your mining adventure

## ⭐ Game Features

### 🏗️ Minecraft Theme
- **Authentic pixel art style** with blocky, 8-bit character designs
- **Minecraft color palette** featuring earth tones, greens, and browns
- **Press Start 2P font** for retro gaming authenticity
- **Wooden UI elements** mimicking Minecraft's interface design
- **Cave exploration atmosphere** with stone walls and underground ambiance

### 🧑‍💻 Characters & Mobs
- **Steve (Player)**: Blue shirt, brown hair, signature Minecraft appearance
- **Red Mob**: Aggressive zombie-like enemy (80% chase rate)
- **Pink Mob**: Moderate pig-like creature (60% chase rate)  
- **Cyan Mob**: Sneaky creeper-inspired mob (50% chase rate)
- **Orange Mob**: Blazing fire-like entity (40% chase rate)

### 💎 Items & Collectibles
- **Emeralds**: Small green gems (10 points each) with sparkle animations
- **Golden Apples**: Rare power-ups (50 points) that activate enchanted mode
- **Hearts**: Life indicators showing remaining health

### ⚡ Enchanted Mode (Power System)
- **8-second duration** of enhanced abilities
- **Purple enchantment aura** around Steve with particle effects
- **Vulnerable mobs** turn blue and flee from the player
- **Progressive scoring**: 200, 400, 600, 800 points for consecutive mob defeats
- **Strategic gameplay**: Save golden apples for when surrounded by mobs

### 🎯 Smart Mob AI
- **Individual personalities** with different aggression levels
- **Contextual behavior** - chase in normal mode, flee during enchanted mode
- **Anti-reversal logic** prevents mobs from getting stuck
- **Dynamic difficulty** with varied pursuit patterns

## 📁 Project Structure

```
Pacman/
├── index.html      # Main game structure with Minecraft theming
├── style.css       # Minecraft-inspired styling and animations
└── script.js       # Enhanced game logic with 4 mobs and power system
```

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5**: Semantic structure with Minecraft terminology
- **CSS3**: Blocky animations, gradients, and responsive design
- **Vanilla JavaScript**: Multi-mob AI, power system, and state management
- **Google Fonts**: Press Start 2P for authentic retro gaming feel

### Key Systems
- **Multi-Mob Management**: Simultaneous tracking of 4 different enemies
- **Power Mode System**: Temporary invincibility with visual effects
- **Enhanced AI**: Individual mob personalities and behaviors
- **Mobile Touch Support**: Virtual D-pad and swipe gesture controls
- **Responsive Design**: Adapts seamlessly to desktop and mobile devices

### Game Architecture
1. **Grid-Based Movement**: 21x21 maze with collision detection
2. **State Management**: Comprehensive game state tracking
3. **Animation System**: CSS animations for characters and effects
4. **Event Handling**: Keyboard, touch, and swipe input support
5. **Local Storage**: Persistent high score tracking

## 🎲 Game Mechanics

### Scoring System
- **Small Emeralds**: 10 points each
- **Golden Apples**: 50 points each
- **Mob Defeats**: 200, 400, 600, 800 points (progressive multiplier)
- **Completion Bonus**: 100 points per remaining heart

### Health & Lives
- Start with **3 hearts** 
- Lose a heart when touched by hostile mobs (when not enchanted)
- Game over when all hearts are lost
- Positions reset after losing a heart (except on final defeat)

### Victory & Defeat
- **Adventure Complete**: Collect all emeralds in the cave
- **You Died**: Lose all hearts to hostile mob attacks

## 📱 Mobile Support

### Touch Controls
- **Virtual D-Pad**: Responsive directional buttons with haptic feedback
- **Swipe Gestures**: Intuitive directional movement across the game board
- **Adaptive Layout**: Optimized UI for mobile screens and tablets

### Cross-Platform Features
- **Desktop**: Full keyboard support with arrow key controls
- **Mobile**: Touch-optimized interface with gesture controls
- **Responsive**: Seamless experience across all device sizes

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installations or dependencies required
- Internet connection for Google Fonts (optional)

### Running the Adventure
1. Clone or download this repository
2. Navigate to the `Pacman` folder
3. Double-click `index.html` or open it in your browser
4. Click "START ADVENTURE" and begin your mining quest!

### Controls
- **⬆️ Up Arrow / Swipe Up**: Move Steve upward
- **⬇️ Down Arrow / Swipe Down**: Move Steve downward  
- **⬅️ Left Arrow / Swipe Left**: Move Steve leftward
- **➡️ Right Arrow / Swipe Right**: Move Steve rightward
- **Start Button**: Begin adventure or pause game
- **Respawn Button**: Reset the adventure

## 🎨 Customization Options

### Maze Modification
Edit the `maze` array in `script.js`:
- `1` = Stone brick walls
- `0` = Grass path with emerald
- `2` = Empty grass path  
- `3` = Golden apple location

### Visual Theming
Modify `style.css` to customize:
- Character appearances and animations
- Cave environment colors and textures
- UI element styling and effects
- Mobile control aesthetics

### Gameplay Tweaking
Adjust `script.js` parameters:
- Mob movement speeds and AI aggression
- Enchanted mode duration and effects
- Scoring values and bonuses
- Starting hearts and difficulty

## � Future Enhancement Ideas

### Potential Additions
- **Multiple cave levels** with increasing difficulty
- **More Minecraft mobs** (Endermen, Skeletons, Spiders)
- **Crafting system** with collectible materials
- **Sound effects** and Minecraft-inspired background music
- **Achievements system** with mining milestones
- **Multiplayer support** for cooperative cave exploration
- **Day/night cycle** affecting mob behavior
- **Inventory system** with tools and items

### Technical Improvements
- **WebGL rendering** for enhanced visual effects
- **Procedural maze generation** for endless exploration
- **Save game progression** across multiple sessions
- **Leaderboard integration** with online high scores

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements, bug fixes, or new Minecraft-themed features!

---

**Happy mining and cave exploration! ⛏️✨**

*May your adventures be prosperous and your hearts remain full!*