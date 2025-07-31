// Auto Word List Updater - Fetches and updates dictionary daily
class AutoWordUpdater {
    constructor() {
        this.sources = {
            // Primary source - Wordle word lists from GitHub
            wordle: 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words',
            // Backup source - English words
            english: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
            // Scrabble words (comprehensive)
            scrabble: 'https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt'
        };
        
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.storageKeys = {
            words: 'vibewordle_comprehensive_words',
            lastUpdate: 'vibewordle_last_update',
            updateStatus: 'vibewordle_update_status'
        };
        
        this.fallbackWords = this.getDefaultWordList();
    }

    // Check if update is needed (daily check)
    needsUpdate() {
        const lastUpdate = localStorage.getItem(this.storageKeys.lastUpdate);
        if (!lastUpdate) return true;
        
        const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
        return timeSinceUpdate >= this.updateInterval;
    }

    // Fetch words from a specific source
    async fetchFromSource(sourceKey) {
        try {
            console.log(`🔄 Fetching words from ${sourceKey}...`);
            const response = await fetch(this.sources[sourceKey]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            let words = [];
            
            if (sourceKey === 'wordle') {
                // Wordle list is already clean 5-letter words
                words = text.split('\n')
                    .map(word => word.trim().toUpperCase())
                    .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));
            } else {
                // Other sources need filtering
                words = text.split('\n')
                    .map(word => word.trim().toUpperCase())
                    .filter(word => 
                        word.length === 5 && 
                        /^[A-Z]+$/.test(word) &&
                        !word.includes("'") && // No contractions
                        !word.includes('-')    // No hyphenated words
                    );
            }
            
            console.log(`✅ Fetched ${words.length} words from ${sourceKey}`);
            return words;
            
        } catch (error) {
            console.error(`❌ Failed to fetch from ${sourceKey}:`, error);
            return [];
        }
    }

    // Fetch and combine words from all sources
    async fetchAllSources() {
        const allWords = new Set();
        
        // Add fallback words first
        this.fallbackWords.forEach(word => allWords.add(word));
        
        // Try each source
        for (const [sourceKey, url] of Object.entries(this.sources)) {
            try {
                const words = await this.fetchFromSource(sourceKey);
                words.forEach(word => allWords.add(word));
                
                // If we get enough words from primary source, we can stop
                if (sourceKey === 'wordle' && words.length > 1000) {
                    console.log('✅ Got sufficient words from primary source');
                    break;
                }
            } catch (error) {
                console.warn(`⚠️ Source ${sourceKey} failed, continuing with others...`);
            }
        }
        
        return Array.from(allWords).sort();
    }

    // Validate words using dictionary API (sample validation)
    async validateWords(words) {
        console.log('🔍 Validating word sample...');
        
        // Validate a sample of words to ensure quality
        const sampleSize = Math.min(20, words.length);
        const sample = words.slice(0, sampleSize);
        let validCount = 0;
        
        for (const word of sample) {
            try {
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
                if (response.ok) {
                    validCount++;
                }
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                // API might be down, continue
            }
        }
        
        const validationRate = validCount / sampleSize;
        console.log(`📊 Validation rate: ${(validationRate * 100).toFixed(1)}% (${validCount}/${sampleSize})`);
        
        // If validation rate is too low, something might be wrong
        return validationRate > 0.7; // At least 70% should be valid
    }

    // Update word list
    async updateWordList() {
        try {
            console.log('🚀 Starting daily word list update...');
            
            // Set update status
            localStorage.setItem(this.storageKeys.updateStatus, JSON.stringify({
                status: 'updating',
                timestamp: Date.now(),
                message: 'Fetching words from online sources...'
            }));
            
            // Fetch new words
            const newWords = await this.fetchAllSources();
            
            if (newWords.length < 500) {
                throw new Error(`Insufficient words fetched: ${newWords.length}`);
            }
            
            // Validate sample
            const isValid = await this.validateWords(newWords);
            if (!isValid) {
                console.warn('⚠️ Validation failed, but using words anyway (API might be down)');
            }
            
            // Save new word list
            localStorage.setItem(this.storageKeys.words, JSON.stringify(newWords));
            localStorage.setItem(this.storageKeys.lastUpdate, Date.now().toString());
            
            // Update status
            localStorage.setItem(this.storageKeys.updateStatus, JSON.stringify({
                status: 'success',
                timestamp: Date.now(),
                message: `Successfully updated with ${newWords.length} words`,
                wordCount: newWords.length
            }));
            
            console.log(`✅ Word list updated successfully! ${newWords.length} words available.`);
            return newWords;
            
        } catch (error) {
            console.error('❌ Word list update failed:', error);
            
            // Update status with error
            localStorage.setItem(this.storageKeys.updateStatus, JSON.stringify({
                status: 'error',
                timestamp: Date.now(),
                message: `Update failed: ${error.message}`,
                error: error.message
            }));
            
            // Return cached words or fallback
            return this.getCachedWords() || this.fallbackWords;
        }
    }

    // Get cached words
    getCachedWords() {
        try {
            const cached = localStorage.getItem(this.storageKeys.words);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('❌ Failed to load cached words:', error);
            return null;
        }
    }

    // Get update status
    getUpdateStatus() {
        try {
            const status = localStorage.getItem(this.storageKeys.updateStatus);
            return status ? JSON.parse(status) : null;
        } catch (error) {
            return null;
        }
    }

    // Main method to get current word list (with auto-update)
    async getWordList() {
        // Check if we need to update
        if (this.needsUpdate()) {
            console.log('📅 Daily update needed, fetching fresh words...');
            return await this.updateWordList();
        } else {
            console.log('📚 Using cached word list...');
            const cached = this.getCachedWords();
            return cached || this.fallbackWords;
        }
    }

    // Force update (for manual refresh)
    async forceUpdate() {
        console.log('🔄 Force updating word list...');
        localStorage.removeItem(this.storageKeys.lastUpdate);
        return await this.updateWordList();
    }

    // Background update check (silent)
    async backgroundUpdate() {
        if (this.needsUpdate()) {
            try {
                await this.updateWordList();
            } catch (error) {
                // Silent fail in background
                console.log('Background update failed, will retry later');
            }
        }
    }

    // Start automatic updates (call this on game initialization)
    startAutoUpdates() {
        // Check for updates every hour
        setInterval(() => {
            this.backgroundUpdate();
        }, 60 * 60 * 1000); // 1 hour

        // Initial check
        setTimeout(() => {
            this.backgroundUpdate();
        }, 5000); // 5 seconds after startup
    }

    // Get fallback word list (embedded in code)
    getDefaultWordList() {
        return [
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
            'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
            'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
            'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMED', 'ARMOR', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET',
            'AVOID', 'AWAKE', 'AWARD', 'AWARE', 'BADGE', 'BADLY', 'BAKER', 'BALLS', 'BANDS', 'BASIC',
            'BATCH', 'BEACH', 'BEANS', 'BEARD', 'BEARS', 'BEAST', 'BEGAN', 'BEGIN', 'BEING', 'BELLY',
            'BELOW', 'BENCH', 'BIKES', 'BILLS', 'BIRDS', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK',
            'BLAST', 'BLEED', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BLOWN', 'BLUES', 'BLUNT',
            'BOARD', 'BOAST', 'BOATS', 'BONES', 'BONUS', 'BOOST', 'BOOTH', 'BOOTS', 'BOUND', 'BOXES',
            'BRAIN', 'BRAKE', 'BRAND', 'BRASS', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE', 'BRIEF',
            'BRING', 'BRINK', 'BROAD', 'BROKE', 'BROWN', 'BRUSH', 'BUILD', 'BUILT', 'BUNCH', 'BURNS',
            'BURST', 'BUYER', 'CABLE', 'CACHE', 'CAKES', 'CALLS', 'CAMEL', 'CANAL', 'CANDY', 'CARDS',
            'CARRY', 'CARVE', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART', 'CHASE',
            'CHEAP', 'CHEAT', 'CHECK', 'CHESS', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHIPS', 'CHOSE',
            'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOTH',
            'CLOUD', 'CLUBS', 'COACH', 'COAST', 'COATS', 'CODES', 'COINS', 'COLOR', 'COMES', 'COMIC',
            'CORAL', 'CORES', 'COSTS', 'COUCH', 'COUGH', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRACK',
            'CRAFT', 'CRANE', 'CRASH', 'CRAZY', 'CREAM', 'CREEK', 'CRISP', 'CROPS', 'CROSS', 'CROWD',
            'CROWN', 'CRUDE', 'CRUSH', 'CURVE', 'CYCLE', 'DAILY', 'DAIRY', 'DANCE', 'DATED', 'DATES',
            'DEALT', 'DEATH', 'DEBIT', 'DEBUG', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOORS', 'DOUBT',
            'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DRAWS', 'DREAM', 'DRIED', 'DRILL', 'DRINK',
            'DRIVE', 'DROVE', 'DRUMS', 'DRUNK', 'DUCKS', 'EAGLE', 'EARLY', 'EARTH', 'EIGHT', 'ELBOW',
            'ELDER', 'ELECT', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT',
            'EVERY', 'EXACT', 'EXAMS', 'EXIST', 'EXTRA', 'FACED', 'FACTS', 'FAILS', 'FAIRY', 'FAITH',
            'FALLS', 'FALSE', 'FANCY', 'FARMS', 'FATAL', 'FAULT', 'FAVOR', 'FEARS', 'FEAST', 'FEEDS',
            'FEELS', 'FEVER', 'FEWER', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FILED', 'FILLS',
            'FILMS', 'FINAL', 'FINDS', 'FIRED', 'FIRES', 'FIRMS', 'FIRST', 'FIXED', 'FLAGS', 'FLAME',
            'FLAPS', 'FLASH', 'FLEET', 'FLESH', 'FLIES', 'FLOAT', 'FLOOD', 'FLOOR', 'FLOUR', 'FLOWS',
            'FLUID', 'FLUSH', 'FOCAL', 'FOCUS', 'FOLKS', 'FONTS', 'FOODS', 'FORCE', 'FORMS', 'FORTH',
            'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRIED', 'FRONT', 'FROST',
            'FRUIT', 'FULLY', 'FUNDS', 'FUNNY', 'GAINS', 'GAMES', 'GATES', 'GEARS', 'GENES', 'GHOST',
            'GIANT', 'GIFTS', 'GIRLS', 'GIVEN', 'GIVES', 'GLASS', 'GLOBE', 'GLOVE', 'GOALS', 'GOATS',
            'GOING', 'GOODS', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRAPE', 'GRAPH', 'GRASS',
            'GRAVE', 'GREAT', 'GREEN', 'GREET', 'GRIEF', 'GRILL', 'GRIND', 'GRIPS', 'GROSS', 'GROUP',
            'GROWN', 'GROWS', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILT', 'HABIT', 'HANDS',
            'HANGS', 'HAPPY', 'HARDY', 'HARSH', 'HASTE', 'HATED', 'HATES', 'HAVEN', 'HEADS', 'HEALS',
            'HEARD', 'HEARS', 'HEART', 'HEAVY', 'HEDGE', 'HEELS', 'HERBS', 'HIDES', 'HILLS', 'HINTS',
            'HIRED', 'HIRES', 'HOBBY', 'HOLDS', 'HOLES', 'HOLLY', 'HOMES', 'HONOR', 'HOOKS', 'HOPES',
            'HORSE', 'HOSTS', 'HOTEL', 'HOURS', 'HOUSE', 'HUMAN', 'HUMOR', 'HURRY', 'HURTS', 'IDEAL',
            'IDEAS', 'IMAGE', 'IMPLY', 'INBOX', 'INDEX', 'INNER', 'INPUT', 'INTRO', 'ISSUE', 'ITEMS',
            'JAPAN', 'JEANS', 'JEWEL', 'JOINS', 'JOKES', 'JUDGE', 'JUICE', 'JUMPS', 'KEEPS', 'KICKS',
            'KILLS', 'KINDS', 'KINGS', 'KNIFE', 'KNOCK', 'KNOTS', 'KNOWN', 'KNOWS', 'LABEL', 'LABOR',
            'LACKS', 'LAKES', 'LAMPS', 'LANDS', 'LANES', 'LARGE', 'LASER', 'LASTS', 'LATER', 'LAUGH',
            'LAYER', 'LEADS', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEDGE', 'LEGAL', 'LEMON', 'LEVEL',
            'LEVER', 'LIGHT', 'LIKED', 'LIKES', 'LIMIT', 'LINED', 'LINES', 'LINKS', 'LIONS', 'LISTS',
            'LIVED', 'LIVER', 'LIVES', 'LOADS', 'LOANS', 'LOCAL', 'LOCKS', 'LODGE', 'LOGIC', 'LOGOS',
            'LOOKS', 'LOOPS', 'LOOSE', 'LORDS', 'LOSES', 'LOVED', 'LOVER', 'LOVES', 'LOWER', 'LOYAL',
            'LUCKY', 'LUNCH', 'LYING', 'MACRO', 'MAGIC', 'MAJOR', 'MAKER', 'MAKES', 'MALES', 'MALLS',
            'MAPLE', 'MARCH', 'MARKS', 'MARRY', 'MASKS', 'MATCH', 'MATES', 'MAYBE', 'MAYOR', 'MEALS',
            'MEANS', 'MEANT', 'MEATS', 'MEDAL', 'MEDIA', 'MEETS', 'MELON', 'MENUS', 'MERCY', 'MERGE',
            'MERIT', 'MERRY', 'METAL', 'METER', 'MICRO', 'MIGHT', 'MILES', 'MINDS', 'MINES', 'MINOR',
            'MINUS', 'MIXED', 'MIXES', 'MODEL', 'MODES', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
            'MOUSE', 'MOUTH', 'MOVED', 'MOVES', 'MOVIE', 'MUSIC', 'NEEDS', 'NERVE', 'NEVER', 'NEWER',
            'NEWLY', 'NIGHT', 'NINTH', 'NOBLE', 'NODES', 'NOISE', 'NORTH', 'NOSED', 'NOTES', 'NOVEL',
            'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'OLDER', 'OLIVE', 'OPENS', 'OPERA', 'ORDER',
            'ORGAN', 'OTHER', 'OUGHT', 'OUTER', 'OWNED', 'OWNER', 'OXIDE', 'PACED', 'PACKS', 'PAGES',
            'PAINS', 'PAINT', 'PAIRS', 'PALMS', 'PANEL', 'PANIC', 'PANTS', 'PAPER', 'PARKS', 'PARTS',
            'PARTY', 'PASTE', 'PATCH', 'PATHS', 'PAUSE', 'PEACE', 'PEAKS', 'PEARL', 'PEERS', 'PENNY',
            'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PICKS', 'PIECE', 'PILOT', 'PITCH', 'PIZZA', 'PLACE',
            'PLAIN', 'PLANE', 'PLANS', 'PLANT', 'PLATE', 'PLAYS', 'PLAZA', 'PLOTS', 'POEMS', 'POINT',
            'POLES', 'POLLS', 'POOLS', 'POPUP', 'PORTS', 'POSED', 'POSTS', 'POUND', 'POWER', 'PRESS',
            'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROPS', 'PROUD', 'PROVE',
            'PROXY', 'PULLS', 'PULSE', 'PUMPS', 'PUNCH', 'PUPIL', 'PURSE', 'QUEEN', 'QUERY', 'QUEST',
            'QUICK', 'QUIET', 'QUITE', 'QUOTE', 'RACER', 'RACES', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
            'RATES', 'RATIO', 'REACH', 'READS', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'RELAY',
            'REMIX', 'REPLY', 'RESET', 'RIDER', 'RIDES', 'RIGHT', 'RINGS', 'RISES', 'RISKS', 'RIVAL',
            'RIVER', 'ROADS', 'ROAST', 'ROBOT', 'ROCKS', 'ROLES', 'ROLLS', 'ROOFS', 'ROOMS', 'ROOTS',
            'ROPES', 'ROSES', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RUGBY', 'RULES', 'RURAL', 'SAFER',
            'SAINT', 'SALAD', 'SALES', 'SANDY', 'SAUCE', 'SAVED', 'SAVES', 'SCALE', 'SCARE', 'SCENE',
            'SCOPE', 'SCORE', 'SCOUT', 'SCREW', 'SEALS', 'SEEDS', 'SEEMS', 'SELLS', 'SENDS', 'SENSE',
            'SERVE', 'SETUP', 'SEVEN', 'SHADE', 'SHAKE', 'SHALL', 'SHAME', 'SHAPE', 'SHARE', 'SHARK',
            'SHARP', 'SHEEP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIPS', 'SHIRT', 'SHOCK',
            'SHOES', 'SHOOT', 'SHOPS', 'SHORT', 'SHOTS', 'SHOWN', 'SHOWS', 'SIDES', 'SIGHT', 'SIGNS',
            'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SIZES', 'SKILL', 'SLEEP', 'SLIDE', 'SLOPE',
            'SMALL', 'SMART', 'SMILE', 'SMOKE', 'SNAKE', 'SOCKS', 'SOLAR', 'SOLID', 'SOLVE', 'SONGS',
            'SORRY', 'SORTS', 'SOULS', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPARK', 'SPEAK', 'SPEED',
            'SPELL', 'SPEND', 'SPENT', 'SPINE', 'SPITE', 'SPLIT', 'SPOKE', 'SPORT', 'SPOTS', 'SPRAY',
            'SQUAD', 'STAGE', 'STAIR', 'STAKE', 'STALE', 'STAMP', 'STAND', 'STARE', 'STARS', 'START',
            'STATE', 'STAYS', 'STEAL', 'STEAM', 'STEEL', 'STEEP', 'STEPS', 'STICK', 'STILL', 'STOCK',
            'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE',
            'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'SWIFT', 'SWING', 'SWISS', 'TABLE', 'TAKES', 'TALES',
            'TALKS', 'TANKS', 'TAPES', 'TASKS', 'TASTE', 'TAXES', 'TEACH', 'TEAMS', 'TEARS', 'TEETH',
            'TELLS', 'TENDS', 'TERMS', 'TESTS', 'TEXTS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE',
            'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'THUMB',
            'TIGER', 'TIGHT', 'TILES', 'TIMER', 'TIMES', 'TIRED', 'TITLE', 'TODAY', 'TOKEN', 'TOOLS',
            'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOURS', 'TOWER', 'TOWNS', 'TRACK', 'TRADE', 'TRAIL',
            'TRAIN', 'TREAT', 'TREES', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED', 'TRIES', 'TRIPS',
            'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TUBES', 'TURNS', 'TWICE', 'TWIST', 'TYPED',
            'TYPES', 'ULTRA', 'UNCLE', 'UNDER', 'UNFIT', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET',
            'URBAN', 'URGED', 'USAGE', 'USERS', 'USING', 'USUAL', 'VALUE', 'VIDEO', 'VIEWS', 'VIRUS',
            'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'VOTES', 'WAGES', 'WAIST', 'WASTE', 'WATCH', 'WATER',
            'WAVES', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WINDS', 'WINES',
            'WINGS', 'WIPES', 'WIRED', 'WIRES', 'WITCH', 'WIVES', 'WOMAN', 'WOMEN', 'WOODS', 'WORDS',
            'WORKS', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE',
            'YARDS', 'YEARS', 'YIELD', 'YOUNG', 'YOURS', 'YOUTH'
        ];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoWordUpdater;
}
