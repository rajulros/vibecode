// Word Fetcher - Gets comprehensive 5-letter word lists
class WordFetcher {
    constructor() {
        this.sources = {
            sowpods: 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words',
            enable: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
            moby: 'https://raw.githubusercontent.com/en-wl/wordlist/master/alt12dicts/2of12inf.txt'
        };
    }

    // Fetch words from online sources
    async fetchWordsFromSource(source = 'sowpods') {
        try {
            console.log(`Fetching words from ${source}...`);
            const response = await fetch(this.sources[source]);
            const text = await response.text();
            
            // Parse the response based on source format
            let words = [];
            if (source === 'sowpods') {
                words = text.split('\n').map(word => word.trim().toUpperCase());
            } else {
                words = text.split('\n')
                    .map(word => word.trim().toUpperCase())
                    .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));
            }
            
            // Filter for 5-letter words only
            const fiveLetterWords = words.filter(word => 
                word.length === 5 && 
                /^[A-Z]+$/.test(word) &&
                !word.includes("'") // Remove contractions
            );
            
            console.log(`Found ${fiveLetterWords.length} five-letter words from ${source}`);
            return fiveLetterWords;
            
        } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            return [];
        }
    }

    // Validate word against dictionary API
    async validateWord(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            if (response.ok) {
                const data = await response.json();
                return data.length > 0;
            }
            return false;
        } catch (error) {
            console.error(`Error validating word ${word}:`, error);
            return false;
        }
    }

    // Get comprehensive validated word list
    async getComprehensiveWordList() {
        console.log('Building comprehensive 5-letter word list...');
        
        // Start with our curated list
        const curatedWords = new Set([
            // Common Wordle words
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
            'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
            'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
            'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMED', 'ARMOR', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET',
            'AVOID', 'AWAKE', 'AWARD', 'AWARE', 'BADGE', 'BADLY', 'BAKER', 'BALLS', 'BANDS', 'BASIC',
            'BATCH', 'BEACH', 'BEANS', 'BEARD', 'BEARS', 'BEAST', 'BEGAN', 'BEGIN', 'BEING', 'BELLY',
            'BELOW', 'BENCH', 'BIKES', 'BILLS', 'BIRDS', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK',
            'BLAST', 'BLEED', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BLOWN', 'BLUES', 'BLUNT',
            'BLUSH', 'BOARD', 'BOAST', 'BOATS', 'BONES', 'BONUS', 'BOOST', 'BOOTH', 'BOOTS', 'BOUND',
            'BOXES', 'BRAIN', 'BRAKE', 'BRAND', 'BRASS', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE',
            'BRIEF', 'BRING', 'BRINK', 'BROAD', 'BROKE', 'BROWN', 'BRUSH', 'BUILD', 'BUILT', 'BUNCH',
            'BURNS', 'BURST', 'BUYER', 'CABLE', 'CACHE', 'CAKES', 'CALLS', 'CAMEL', 'CANAL', 'CANDY',
            'CARDS', 'CARRY', 'CARVE', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART',
            'CHASE', 'CHEAP', 'CHEAT', 'CHECK', 'CHESS', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHIPS',
            'CHOSE', 'CHUNK', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK',
            'CLOSE', 'CLOTH', 'CLOUD', 'CLUBS', 'COACH', 'COAST', 'COATS', 'CODES', 'COINS', 'COLOR',
            'COMES', 'COMIC', 'CORAL', 'CORES', 'COSTS', 'COUCH', 'COUGH', 'COULD', 'COUNT', 'COURT',
            'COVER', 'CRACK', 'CRAFT', 'CRANE', 'CRASH', 'CRAZY', 'CREAM', 'CREEK', 'CRISP', 'CROPS',
            'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CRUSH', 'CURVE', 'CYCLE', 'DAILY', 'DAIRY', 'DANCE',
            'DATED', 'DATES', 'DEALT', 'DEATH', 'DEBIT', 'DEBUG', 'DEBUT', 'DELAY', 'DEPTH', 'DOING',
            'DOORS', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DRAWS', 'DREAM', 'DRIED',
            'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DRUMS', 'DRUNK', 'DUCKS', 'EAGLE', 'EARLY', 'EARTH',
            'EIGHT', 'ELBOW', 'ELDER', 'ELECT', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL',
            'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXAMS', 'EXIST', 'EXTRA', 'FACED', 'FACTS', 'FAILS',
            'FAIRY', 'FAITH', 'FALLS', 'FALSE', 'FANCY', 'FARMS', 'FATAL', 'FAULT', 'FAVOR', 'FEARS',
            'FEAST', 'FEEDS', 'FEELS', 'FEVER', 'FEWER', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT',
            'FILED', 'FILLS', 'FILMS', 'FINAL', 'FINDS', 'FIRED', 'FIRES', 'FIRMS', 'FIRST', 'FIXED',
            'FLAGS', 'FLAME', 'FLAPS', 'FLASH', 'FLEET', 'FLESH', 'FLIES', 'FLOAT', 'FLOOD', 'FLOOR',
            'FLOUR', 'FLOWS', 'FLUID', 'FLUSH', 'FOCAL', 'FOCUS', 'FOLKS', 'FONTS', 'FOODS', 'FORCE',
            'FORMS', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRIED',
            'FRONT', 'FROST', 'FRUIT', 'FULLY', 'FUNDS', 'FUNNY', 'GAINS', 'GAMES', 'GATES', 'GEARS',
            'GENES', 'GHOST', 'GIANT', 'GIFTS', 'GIRLS', 'GIVEN', 'GIVES', 'GLASS', 'GLOBE', 'GLOVE',
            'GOALS', 'GOATS', 'GOING', 'GOODS', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRAPE',
            'GRAPH', 'GRASS', 'GRAVE', 'GREAT', 'GREEN', 'GREET', 'GRIEF', 'GRILL', 'GRIND', 'GRIPS',
            'GROSS', 'GROUP', 'GROWN', 'GROWS', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILT',
            'HABIT', 'HANDS', 'HANGS', 'HAPPY', 'HARDY', 'HARSH', 'HASTE', 'HATED', 'HATES', 'HAVEN',
            'HEADS', 'HEALS', 'HEARD', 'HEARS', 'HEART', 'HEAVY', 'HEDGE', 'HEELS', 'HERBS', 'HIDES',
            'HILLS', 'HINTS', 'HIRED', 'HIRES', 'HOBBY', 'HOLDS', 'HOLES', 'HOLLY', 'HOMES', 'HONOR',
            'HOOKS', 'HOPES', 'HORSE', 'HOSTS', 'HOTEL', 'HOURS', 'HOUSE', 'HUMAN', 'HUMOR', 'HURRY',
            'HURTS', 'IDEAL', 'IDEAS', 'IMAGE', 'IMPLY', 'INBOX', 'INDEX', 'INNER', 'INPUT', 'INTRO',
            'ISSUE', 'ITEMS', 'JAPAN', 'JEANS', 'JEWEL', 'JOINS', 'JOKES', 'JUDGE', 'JUICE', 'JUMPS',
            'KEEPS', 'KICKS', 'KILLS', 'KINDS', 'KINGS', 'KNIFE', 'KNOCK', 'KNOTS', 'KNOWN', 'KNOWS',
            'LABEL', 'LABOR', 'LACKS', 'LAKES', 'LAMPS', 'LANDS', 'LANES', 'LARGE', 'LASER', 'LASTS',
            'LATER', 'LAUGH', 'LAYER', 'LEADS', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEDGE', 'LEGAL',
            'LEMON', 'LEVEL', 'LEVER', 'LIGHT', 'LIKED', 'LIKES', 'LIMIT', 'LINED', 'LINES', 'LINKS',
            'LIONS', 'LISTS', 'LIVED', 'LIVER', 'LIVES', 'LOADS', 'LOANS', 'LOCAL', 'LOCKS', 'LODGE',
            'LOGIC', 'LOGOS', 'LOOKS', 'LOOPS', 'LOOSE', 'LORDS', 'LOSES', 'LOVED', 'LOVER', 'LOVES',
            'LOWER', 'LOYAL', 'LUCKY', 'LUNCH', 'LYING', 'MACRO', 'MAGIC', 'MAJOR', 'MAKER', 'MAKES',
            'MALES', 'MALLS', 'MAPLE', 'MARCH', 'MARKS', 'MARRY', 'MASKS', 'MATCH', 'MATES', 'MAYBE',
            'MAYOR', 'MEALS', 'MEANS', 'MEANT', 'MEATS', 'MEDAL', 'MEDIA', 'MEETS', 'MELON', 'MENUS',
            'MERCY', 'MERGE', 'MERIT', 'MERRY', 'METAL', 'METER', 'MICRO', 'MIGHT', 'MILES', 'MINDS',
            'MINES', 'MINOR', 'MINUS', 'MIXED', 'MIXES', 'MODEL', 'MODES', 'MONEY', 'MONTH', 'MORAL',
            'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVED', 'MOVES', 'MOVIE', 'MUSIC', 'NEEDS', 'NERVE',
            'NEVER', 'NEWER', 'NEWLY', 'NIGHT', 'NINTH', 'NOBLE', 'NODES', 'NOISE', 'NORTH', 'NOSED',
            'NOTES', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'OLDER', 'OLIVE', 'OPENS',
            'OPERA', 'ORDER', 'ORGAN', 'OTHER', 'OUGHT', 'OUTER', 'OWNED', 'OWNER', 'OXIDE', 'PACED',
            'PACKS', 'PAGES', 'PAINS', 'PAINT', 'PAIRS', 'PALMS', 'PANEL', 'PANIC', 'PANTS', 'PAPER',
            'PARKS', 'PARTS', 'PARTY', 'PASTE', 'PATCH', 'PATHS', 'PAUSE', 'PEACE', 'PEAKS', 'PEARL',
            'PEERS', 'PENNY', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PICKS', 'PIECE', 'PILOT', 'PITCH',
            'PIZZA', 'PLACE', 'PLAIN', 'PLANE', 'PLANS', 'PLANT', 'PLATE', 'PLAYS', 'PLAZA', 'PLOTS',
            'POEMS', 'POINT', 'POLES', 'POLLS', 'POOLS', 'POPUP', 'PORTS', 'POSED', 'POSTS', 'POUND',
            'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROPS',
            'PROUD', 'PROVE', 'PROXY', 'PULLS', 'PULSE', 'PUMPS', 'PUNCH', 'PUPIL', 'PURSE', 'QUEEN',
            'QUERY', 'QUEST', 'QUICK', 'QUIET', 'QUITE', 'QUOTE', 'RACER', 'RACES', 'RADIO', 'RAISE',
            'RANGE', 'RAPID', 'RATES', 'RATIO', 'REACH', 'READS', 'READY', 'REALM', 'REBEL', 'REFER',
            'RELAX', 'RELAY', 'REMIX', 'REPLY', 'RESET', 'RIDER', 'RIDES', 'RIGHT', 'RINGS', 'RISES',
            'RISKS', 'RIVAL', 'RIVER', 'ROADS', 'ROAST', 'ROBOT', 'ROCKS', 'ROLES', 'ROLLS', 'ROOFS',
            'ROOMS', 'ROOTS', 'ROPES', 'ROSES', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RUGBY', 'RULES',
            'RURAL', 'SAFER', 'SAINT', 'SALAD', 'SALES', 'SANDY', 'SAUCE', 'SAVED', 'SAVES', 'SCALE',
            'SCARE', 'SCENE', 'SCOPE', 'SCORE', 'SCOUT', 'SCREW', 'SEALS', 'SEEDS', 'SEEMS', 'SELLS',
            'SENDS', 'SENSE', 'SERVE', 'SETUP', 'SEVEN', 'SHADE', 'SHAKE', 'SHALL', 'SHAME', 'SHAPE',
            'SHARE', 'SHARK', 'SHARP', 'SHEEP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIPS',
            'SHIRT', 'SHOCK', 'SHOES', 'SHOOT', 'SHOPS', 'SHORT', 'SHOTS', 'SHOWN', 'SHOWS', 'SIDES',
            'SIGHT', 'SIGNS', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SIZES', 'SKILL', 'SLEEP',
            'SLIDE', 'SLOPE', 'SMALL', 'SMART', 'SMILE', 'SMOKE', 'SNAKE', 'SNOW', 'SOCKS', 'SOLAR',
            'SOLID', 'SOLVE', 'SONGS', 'SORRY', 'SORTS', 'SOULS', 'SOUND', 'SOUTH', 'SPACE', 'SPARE',
            'SPARK', 'SPEAK', 'SPEED', 'SPELL', 'SPEND', 'SPENT', 'SPINE', 'SPITE', 'SPLIT', 'SPOKE',
            'SPORT', 'SPOTS', 'SPRAY', 'SQUAD', 'STAGE', 'STAIR', 'STAKE', 'STALE', 'STAMP', 'STAND',
            'STARE', 'STARS', 'START', 'STATE', 'STAYS', 'STEAL', 'STEAM', 'STEEL', 'STEEP', 'STEPS',
            'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK',
            'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SUPPLY', 'SWEET', 'SWIFT', 'SWING',
            'SWISS', 'TABLE', 'TAKES', 'TALES', 'TALKS', 'TANKS', 'TAPES', 'TASKS', 'TASTE', 'TAXES',
            'TEACH', 'TEAMS', 'TEARS', 'TEETH', 'TELLS', 'TENDS', 'TERMS', 'TESTS', 'TEXTS', 'THANK',
            'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE',
            'THREE', 'THREW', 'THROW', 'THUMB', 'TIGER', 'TIGHT', 'TILES', 'TIMER', 'TIMES', 'TIRED',
            'TITLE', 'TODAY', 'TOKEN', 'TOOLS', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOURS', 'TOWER',
            'TOWNS', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TREAT', 'TREES', 'TREND', 'TRIAL', 'TRIBE',
            'TRICK', 'TRIED', 'TRIES', 'TRIPS', 'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TUBES',
            'TURNS', 'TWICE', 'TWIST', 'TYPED', 'TYPES', 'ULTRA', 'UNCLE', 'UNDER', 'UNFIT', 'UNION',
            'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'URGED', 'USAGE', 'USERS', 'USING', 'USUAL',
            'VALUE', 'VIDEO', 'VIEWS', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'VOTES', 'WAGES',
            'WAIST', 'WASTE', 'WATCH', 'WATER', 'WAVES', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE',
            'WHOLE', 'WHOSE', 'WINDS', 'WINES', 'WINGS', 'WIPES', 'WIRED', 'WIRES', 'WITCH', 'WIVES',
            'WOMAN', 'WOMEN', 'WOODS', 'WORDS', 'WORKS', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH',
            'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YARDS', 'YEARS', 'YIELD', 'YOUNG', 'YOURS', 'YOUTH'
        ]);

        try {
            // Optionally fetch from external sources
            const externalWords = await this.fetchWordsFromSource('sowpods');
            externalWords.forEach(word => curatedWords.add(word));
        } catch (error) {
            console.log('External fetch failed, using curated list only');
        }

        const finalList = Array.from(curatedWords).sort();
        console.log(`Final comprehensive list: ${finalList.length} words`);
        
        return finalList;
    }

    // Save word list to local storage for offline use
    saveWordList(words) {
        localStorage.setItem('comprehensiveWordList', JSON.stringify(words));
        localStorage.setItem('wordListTimestamp', Date.now().toString());
    }

    // Load cached word list
    loadCachedWordList() {
        const cached = localStorage.getItem('comprehensiveWordList');
        const timestamp = localStorage.getItem('wordListTimestamp');
        
        // Cache valid for 7 days
        if (cached && timestamp && (Date.now() - parseInt(timestamp)) < 7 * 24 * 60 * 60 * 1000) {
            return JSON.parse(cached);
        }
        return null;
    }

    // Main method to get word list (with caching)
    async getWordList() {
        // Try cached first
        const cached = this.loadCachedWordList();
        if (cached) {
            console.log(`Loaded ${cached.length} words from cache`);
            return cached;
        }

        // Build new list
        const words = await this.getComprehensiveWordList();
        this.saveWordList(words);
        return words;
    }
}

// Usage example
const wordFetcher = new WordFetcher();

// Export for use in Wordle game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordFetcher;
}
