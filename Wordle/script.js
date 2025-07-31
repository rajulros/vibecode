// VibeWordle - Enhanced Wordle Game Logic

class VibeWordle {
    constructor() {
        // Game State
        this.targetWord = '';
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.guesses = [];
        this.evaluations = [];
        
        // Game Settings
        this.difficulty = 'normal'; // easy: 4, normal: 5, hard: 6, expert: 7
        this.wordLength = 5;
        this.maxAttempts = 6;
        this.timeLimit = 300; // 5 minutes in seconds
        this.currentTime = this.timeLimit;
        this.timerInterval = null;
        
        // Game Statistics
        this.stats = this.loadStats();
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        
        // Power-ups
        this.powerups = {
            hint: 3,
            reveal: 2,
            shuffle: 2,
            time: 1
        };
        
        // Game Elements
        this.gameBoard = document.getElementById('game-board');
        this.keyboard = document.getElementById('keyboard');
        this.currentHint = '';
        this.revealedPositions = new Set();
        
        // Word Lists (organized by difficulty)
        this.wordLists = {
            easy: [
                'CATS', 'DOGS', 'BIRD', 'FISH', 'LOVE', 'GAME', 'PLAY', 'TREE', 'BOOK', 'MOON',
                'STAR', 'FIRE', 'WIND', 'ROCK', 'GOLD', 'BLUE', 'PINK', 'FAST', 'SLOW', 'JUMP',
                'SING', 'DANCE', 'HAPPY', 'SMILE', 'LAUGH', 'SWEET', 'KIND', 'WARM', 'COOL', 'RAIN'
            ],
            normal: [
                'SPACE', 'DREAM', 'OCEAN', 'MAGIC', 'LIGHT', 'PEACE', 'BRAVE', 'SHINE', 'STORM', 'QUEST',
                'POWER', 'GRACE', 'TRUTH', 'HONOR', 'FAITH', 'SPARK', 'BLAZE', 'FROST', 'CRANE', 'DANCE',
                'PIANO', 'GUITAR', 'MELODY', 'RHYTHM', 'HARMONY', 'CASTLE', 'BRIDGE', 'GARDEN', 'FOREST', 'MOUNTAIN',
                'PUZZLE', 'RIDDLE', 'SECRET', 'WONDER', 'MARVEL', 'COSMIC', 'CRYSTAL', 'PRISM', 'AURORA', 'GALAXY',
                'STELLAR', 'NEBULA', 'PORTAL', 'MYSTIC', 'CIPHER', 'MATRIX', 'VECTOR', 'PLASMA', 'PHOTON', 'QUANTUM'
            ],
            hard: [
                'COMPLEX', 'JOURNEY', 'HARMONY', 'BALANCE', 'DESTINY', 'FREEDOM', 'JUSTICE', 'WISDOM', 'COURAGE', 'MYSTERY',
                'ECLIPSE', 'THUNDER', 'RAINBOW', 'CRYSTAL', 'ENCHANT', 'FANTASY', 'MIRACLE', 'TRIUMPH', 'DIAMOND', 'PHOENIX',
                'FORTRESS', 'ADVENTURE', 'DISCOVERY', 'INNOVATION', 'CREATION', 'ARTISTIC', 'BRILLIANT', 'MAGNIFICENT', 'SPECTACULAR', 'EXTRAORDINARY'
            ],
            expert: [
                'SYMPHONY', 'MYSTICAL', 'ETHEREAL', 'SERENITY', 'HARMONY', 'JOURNEY', 'TRIUMPH', 'DESTINY', 'PHOENIX', 'CRYSTAL',
                'ENCHANTED', 'ADVENTURE', 'DISCOVERY', 'FANTASTIC', 'BRILLIANT', 'MAJESTIC', 'SPLENDID', 'GORGEOUS', 'AMAZING', 'PERFECT',
                'WONDERFUL', 'BEAUTIFUL', 'STUNNING', 'FABULOUS', 'AWESOME', 'INCREDIBLE', 'MAGNIFICENT', 'SPECTACULAR', 'OUTSTANDING', 'EXCEPTIONAL'
            ]
        };
        
        // Word hints (contextual clues)
        this.wordHints = {
            'SPACE': 'The final frontier explored by astronauts',
            'DREAM': 'What happens in your mind while you sleep',
            'OCEAN': 'Vast body of saltwater covering most of Earth',
            'MAGIC': 'Supernatural power that defies explanation',
            'LIGHT': 'Electromagnetic radiation visible to the eye',
            'PEACE': 'State of harmony and absence of conflict',
            'BRAVE': 'Showing courage in the face of danger',
            'SHINE': 'To emit or reflect bright light',
            'STORM': 'Violent weather with wind and precipitation',
            'QUEST': 'A long search for something important',
            'POWER': 'Strength or energy to do work',
            'GRACE': 'Elegant movement or divine favor',
            'TRUTH': 'What is real and not false',
            'HONOR': 'High respect and integrity',
            'FAITH': 'Trust and belief without proof',
            'SPARK': 'Small fiery particle or sudden inspiration',
            'BLAZE': 'Bright flame or intense fire',
            'FROST': 'Ice crystals forming in cold weather',
            'CATS': 'Furry pets that purr and meow',
            'DOGS': 'Loyal pets often called mans best friend',
            'BIRD': 'Flying creature with feathers and wings',
            'FISH': 'Aquatic animal that swims and breathes underwater',
            'LOVE': 'Deep affection and care for someone',
            'GAME': 'Activity played for fun or competition',
            'PLAY': 'To engage in activities for enjoyment',
            'TREE': 'Tall plant with woody trunk and branches',
            'BOOK': 'Written work with pages bound together',
            'MOON': 'Earths natural satellite in the night sky',
            'STAR': 'Celestial body that shines in space',
            'FIRE': 'Hot, bright combustion that burns things',
            'COMPLEX': 'Consisting of many interconnected parts',
            'JOURNEY': 'Act of traveling from one place to another',
            'HARMONY': 'Pleasant agreement and balance',
            'BALANCE': 'Equal distribution of weight or elements',
            'DESTINY': 'Predetermined course of events; fate',
            'FREEDOM': 'State of being free from oppression',
            'JUSTICE': 'Fair treatment according to law',
            'WISDOM': 'Deep understanding and good judgment',
            'COURAGE': 'Bravery in facing fear or difficulty',
            'MYSTERY': 'Something difficult to understand or explain',
            'SYMPHONY': 'Large musical composition for orchestra',
            'MYSTICAL': 'Having spiritual or supernatural significance',
            'ETHEREAL': 'Extremely delicate and otherworldly',
            'SERENITY': 'State of being calm and peaceful'
        };
        
        // Initialize auto word updater
        this.autoUpdater = new AutoWordUpdater();
        
        // Start with static dictionary, then update asynchronously
        this.dictionary = this.createStaticDictionary();
        
        // Initialize the game
        this.init();
        
        // Initialize dictionary with auto-updater asynchronously
        this.initializeDictionary();
    }
    
    async initializeDictionary() {
        try {
            console.log('🔄 Initializing dictionary with auto-updater...');
            
            // Get fresh word list (will check for daily updates automatically)
            const words = await this.autoUpdater.getWordList();
            
            // Create dictionary structure
            this.dictionary = {
                all: new Set(words),
                5: words.filter(word => word.length === 5),
                4: words.filter(word => word.length === 4),
                6: words.filter(word => word.length === 6),
                7: words.filter(word => word.length === 7)
            };
            
            console.log(`✅ Dictionary initialized with ${words.length} words`);
            
            // Show update status to user
            this.showUpdateStatus();
            
        } catch (error) {
            console.error('❌ Failed to initialize dictionary:', error);
            
            // Fallback to static dictionary
            this.dictionary = this.createStaticDictionary();
            console.log('📚 Using fallback static dictionary');
        }
        
        // Start background auto-updates
        this.autoUpdater.startAutoUpdates();
    }
    
    showUpdateStatus() {
        const status = this.autoUpdater.getUpdateStatus();
        if (status && status.status === 'success') {
            const timeSince = Date.now() - status.timestamp;
            const hours = Math.floor(timeSince / (1000 * 60 * 60));
            
            if (hours < 1) {
                this.showMessage(`📚 Dictionary updated with ${status.wordCount} words!`, 3000);
            }
        }
    }
    
    createStaticDictionary() {
        // Comprehensive English word dictionary organized by length
        const dictionary = {
            4: [
                // Common 4-letter words
                'ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK', 'BALL',
                'BAND', 'BANK', 'BASE', 'BATH', 'BEAR', 'BEAT', 'BEEN', 'BEER', 'BELL', 'BEST',
                'BIKE', 'BILL', 'BIRD', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOMB', 'BONE', 'BOOK',
                'BORN', 'BOTH', 'BOWL', 'BULK', 'BURN', 'BUSH', 'BUSY', 'CAFE', 'CAKE', 'CALL',
                'CALM', 'CAME', 'CAMP', 'CARD', 'CARE', 'CARS', 'CASE', 'CASH', 'CAST', 'CATS',
                'CAVE', 'CELL', 'CHAT', 'CHIP', 'CITY', 'CLUB', 'COAL', 'COAT', 'CODE', 'COIN',
                'COLD', 'COME', 'COOK', 'COOL', 'COPY', 'CORN', 'COST', 'COZY', 'CREW', 'CROP',
                'CUTE', 'DARK', 'DATA', 'DATE', 'DAWN', 'DAYS', 'DEAD', 'DEAL', 'DEAR', 'DEBT',
                'DEEP', 'DESK', 'DIET', 'DIRT', 'DISH', 'DOGS', 'DONE', 'DOOR', 'DOWN', 'DRAW',
                'DREW', 'DROP', 'DRUG', 'DUAL', 'DUCK', 'DULL', 'DUST', 'DUTY', 'EACH', 'EARN',
                'EAST', 'EASY', 'EDGE', 'EDIT', 'ELSE', 'EVEN', 'EVER', 'EVIL', 'EXIT', 'FACE',
                'FACT', 'FAIL', 'FAIR', 'FALL', 'FAME', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEED',
                'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE',
                'FIRM', 'FISH', 'FIST', 'FIVE', 'FLAG', 'FLAT', 'FLEW', 'FLOW', 'FOLK', 'FOOD',
                'FOOT', 'FORM', 'FORT', 'FOUR', 'FREE', 'FROM', 'FUEL', 'FULL', 'FUND', 'GAIN',
                'GAME', 'GATE', 'GAVE', 'GEAR', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GOAL', 'GOAT',
                'GOES', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAB', 'GRAY', 'GREW', 'GRIP', 'GROW',
                'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HARM', 'HATE', 'HAVE', 'HEAD',
                'HEAR', 'HEAT', 'HELD', 'HELP', 'HERE', 'HERO', 'HIDE', 'HIGH', 'HILL', 'HIRE',
                'HITS', 'HOLD', 'HOLE', 'HOME', 'HOPE', 'HOST', 'HOUR', 'HUGE', 'HUNT', 'HURT',
                'IDEA', 'INCH', 'INTO', 'IRON', 'ITEM', 'JOIN', 'JOKE', 'JUMP', 'JUNE', 'JUST',
                'KEEP', 'KEPT', 'KEYS', 'KICK', 'KIDS', 'KIND', 'KING', 'KNEW', 'KNOW', 'LACK',
                'LADY', 'LAID', 'LAKE', 'LAMP', 'LAND', 'LANE', 'LAST', 'LATE', 'LAWN', 'LAZY',
                'LEAD', 'LEAF', 'LEAN', 'LEFT', 'LEGS', 'LEND', 'LENS', 'LESS', 'LIED', 'LIFE',
                'LIFT', 'LIKE', 'LINE', 'LINK', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LONG',
                'LOOK', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOTS', 'LOUD', 'LOVE', 'LUCK', 'MADE',
                'MAIL', 'MAIN', 'MAKE', 'MALE', 'MALL', 'MANY', 'MARK', 'MASS', 'MATH', 'MEAL',
                'MEAN', 'MEAT', 'MEET', 'MENU', 'MESS', 'MICE', 'MILE', 'MILK', 'MIND', 'MINE',
                'MISS', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH', 'NAIL', 'NAME',
                'NAVY', 'NEAR', 'NECK', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NINE', 'NODE', 'NONE',
                'NOON', 'NOTE', 'ODDS', 'ONCE', 'ONLY', 'OPEN', 'ORAL', 'OVER', 'PACE', 'PACK',
                'PAGE', 'PAID', 'PAIN', 'PAIR', 'PALM', 'PARK', 'PART', 'PASS', 'PAST', 'PATH',
                'PEAK', 'PICK', 'PINK', 'PLAN', 'PLAY', 'PLOT', 'PLUS', 'POEM', 'POET', 'POLL',
                'POOL', 'POOR', 'PORT', 'POST', 'PULL', 'PURE', 'PUSH', 'QUIT', 'RACE', 'RAIN',
                'RANK', 'RARE', 'RATE', 'READ', 'REAL', 'RELY', 'RENT', 'REST', 'RICH', 'RIDE',
                'RING', 'RISE', 'RISK', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT',
                'ROPE', 'ROSE', 'RULE', 'SAFE', 'SAID', 'SAIL', 'SALE', 'SALT', 'SAME', 'SAND',
                'SAVE', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELL', 'SEND', 'SENT', 'SHIP',
                'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SILK', 'SING', 'SINK',
                'SIZE', 'SKIN', 'SLIP', 'SLOW', 'SNAP', 'SNOW', 'SOAP', 'SOFT', 'SOIL', 'SOLD',
                'SOME', 'SONG', 'SOON', 'SORT', 'SOUL', 'SOUP', 'SPAN', 'SPIN', 'SPOT', 'STAR',
                'STAY', 'STEP', 'STOP', 'SUCH', 'SUIT', 'SURE', 'SWIM', 'TAKE', 'TALK', 'TALL',
                'TANK', 'TAPE', 'TASK', 'TEAM', 'TELL', 'TEND', 'TERM', 'TEST', 'TEXT', 'THAN',
                'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THUS', 'TIDE', 'TIES', 'TIME',
                'TINY', 'TOLD', 'TONE', 'TOOK', 'TOOL', 'TOPS', 'TORN', 'TOUR', 'TOWN', 'TREE',
                'TRIM', 'TRIP', 'TRUE', 'TUNE', 'TURN', 'TYPE', 'UNIT', 'UPON', 'USED', 'USER',
                'VARY', 'VAST', 'VIEW', 'VISA', 'VOTE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL',
                'WANT', 'WARM', 'WARN', 'WASH', 'WAVE', 'WAYS', 'WEAK', 'WEAR', 'WEEK', 'WELL',
                'WENT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WILD', 'WILL', 'WIND', 'WINE', 'WING',
                'WIRE', 'WISE', 'WISH', 'WITH', 'WOOD', 'WOOL', 'WORD', 'WORE', 'WORK', 'WORN',
                'YARD', 'YEAR', 'YOUR', 'ZERO', 'ZONE'
            ],
            5: [
                // All target words from your current word lists plus common 5-letter words
                'SPACE', 'DREAM', 'OCEAN', 'MAGIC', 'LIGHT', 'PEACE', 'BRAVE', 'SHINE', 'STORM', 'QUEST',
                'POWER', 'GRACE', 'TRUTH', 'HONOR', 'FAITH', 'SPARK', 'BLAZE', 'FROST', 'CRANE', 'DANCE',
                'PIANO', 'GUITAR', 'MELODY', 'RHYTHM', 'HARMONY', 'CASTLE', 'BRIDGE', 'GARDEN', 'FOREST', 'MOUNTAIN',
                'PUZZLE', 'RIDDLE', 'SECRET', 'WONDER', 'MARVEL', 'COSMIC', 'CRYSTAL', 'PRISM', 'AURORA', 'GALAXY',
                'STELLAR', 'NEBULA', 'PORTAL', 'MYSTIC', 'CIPHER', 'MATRIX', 'VECTOR', 'PLASMA', 'PHOTON', 'QUANTUM',
                // Additional common 5-letter words
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
                'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
                'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
                'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMED', 'ARMOR', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET',
                'AVOID', 'AWAKE', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BALLS', 'BANDS', 'BASIC', 'BATCH',
                'BEACH', 'BEANS', 'BEARD', 'BEARS', 'BEAST', 'BEGAN', 'BEGIN', 'BEING', 'BELLY', 'BELOW',
                'BENCH', 'BIKES', 'BILLS', 'BIRDS', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST',
                'BLEED', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOOM', 'BLOWN', 'BLUES', 'BLUNT', 'BLUSH',
                'BOARD', 'BOAST', 'BOATS', 'BOBBY', 'BONES', 'BONUS', 'BOOST', 'BOOTH', 'BOOTS', 'BOUND',
                'BOXES', 'BRAIN', 'BRAKE', 'BRAND', 'BRASS', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE',
                'BRIEF', 'BRING', 'BRINK', 'BROAD', 'BROKE', 'BROWN', 'BRUSH', 'BUILD', 'BUILT', 'BUNCH',
                'BURNS', 'BURST', 'BUSES', 'BUYER', 'CABLE', 'CACHE', 'CAKES', 'CALLS', 'CAMEL', 'CANAL',
                'CANDY', 'CARDS', 'CARRY', 'CARVE', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM',
                'CHART', 'CHASE', 'CHEAP', 'CHEAT', 'CHECK', 'CHESS', 'CHEST', 'CHIEF', 'CHILD', 'CHINA',
                'CHIPS', 'CHOSE', 'CHUNK', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB',
                'CLOCK', 'CLOSE', 'CLOTH', 'CLOUD', 'CLUBS', 'COACH', 'COAST', 'COATS', 'CODES', 'COINS',
                'COLOR', 'COMES', 'COMIC', 'CORAL', 'CORES', 'COSTS', 'COUCH', 'COUGH', 'COULD', 'COUNT',
                'COURT', 'COVER', 'CRACK', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CREEK', 'CRISP', 'CROPS',
                'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CRUSH', 'CURVE', 'CYCLE', 'DAILY', 'DAIRY', 'DAMES',
                'DARED', 'DATED', 'DATES', 'DEALT', 'DEATH', 'DEBIT', 'DEBUG', 'DEBUT', 'DELAY', 'DEPTH',
                'DOING', 'DOORS', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DRAWS', 'DRIED',
                'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DRUMS', 'DRUNK', 'DUCKS', 'EAGLE', 'EARLY', 'EARTH', 'EIGHT',
                'ELBOW', 'ELDER', 'ELECT', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR',
                'EVENT', 'EVERY', 'EXACT', 'EXAMS', 'EXIST', 'EXTRA', 'FACED', 'FACTS', 'FAILS', 'FAIRY',
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
                'GROWN', 'GROWS', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'GUILD', 'GUILT', 'GUYS', 'HABITS',
                'HANDS', 'HANGS', 'HAPPY', 'HARDY', 'HARSH', 'HASTE', 'HATED', 'HATES', 'HAVEN', 'HEADS',
                'HEALS', 'HEARD', 'HEARS', 'HEART', 'HEAVY', 'HEDGE', 'HEELS', 'HERBS', 'HIDES', 'HILLS',
                'HINTS', 'HIRED', 'HIRES', 'HOBBY', 'HOLDS', 'HOLES', 'HOLLY', 'HOMES', 'HOOKS', 'HOPES',
                'HORSE', 'HOSTS', 'HOTEL', 'HOURS', 'HOUSE', 'HUMAN', 'HUMOR', 'HURRY', 'HURTS', 'IDEAL',
                'IDEAS', 'IMAGE', 'IMPLY', 'INBOX', 'INDEX', 'INNER', 'INPUT', 'INTRO', 'ISSUE', 'ITEMS',
                'JAPAN', 'JEANS', 'JEWEL', 'JOINS', 'JOKES', 'JUDGE', 'JUICE', 'JUMPS', 'KEEPS', 'KICKS',
                'KILLS', 'KINDS', 'KINGS', 'KNIFE', 'KNOCK', 'KNOTS', 'KNOWN', 'KNOWS', 'LABEL', 'LABOR',
                'LACKS', 'LAKES', 'LAMPS', 'LANDS', 'LANES', 'LARGE', 'LASER', 'LASTS', 'LATER', 'LAUGH',
                'LAWN', 'LAYER', 'LEADS', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEDGE', 'LEGAL', 'LEMON',
                'LEVEL', 'LEVER', 'LIED', 'LIES', 'LIKED', 'LIKES', 'LIMIT', 'LINED', 'LINES', 'LINKS',
                'LIONS', 'LISTS', 'LIVED', 'LIVER', 'LIVES', 'LOADS', 'LOANS', 'LOCAL', 'LOCKS', 'LODGE',
                'LOGIC', 'LOGOS', 'LOOKS', 'LOOPS', 'LOOSE', 'LORDS', 'LOSES', 'LOVED', 'LOVER', 'LOVES',
                'LOWER', 'LOYAL', 'LUCKY', 'LUNCH', 'LYING', 'MACRO', 'MAGIC', 'MAJOR', 'MAKER', 'MAKES',
                'MALES', 'MALLS', 'MAPLE', 'MARCH', 'MARKS', 'MARRY', 'MASKS', 'MATCH', 'MATES', 'MAYBE',
                'MAYOR', 'MEALS', 'MEANS', 'MEANT', 'MEATS', 'MEDAL', 'MEDIA', 'MEETS', 'MELON', 'MENUS',
                'MERCY', 'MERGE', 'MERIT', 'MERRY', 'METAL', 'METER', 'MICRO', 'MIGHT', 'MILES', 'MINDS',
                'MINES', 'MINOR', 'MINUS', 'MIXED', 'MIXES', 'MODEL', 'MODES', 'MONEY', 'MONITOR', 'MONTH',
                'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVED', 'MOVES', 'MOVIE', 'MUSIC', 'NEEDS',
                'NERVE', 'NEVER', 'NEWER', 'NEWLY', 'NIGHT', 'NINTH', 'NOBLE', 'NODES', 'NOISE', 'NORTH',
                'NOSED', 'NOTES', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'OLDER', 'OLIVE',
                'OPENS', 'OPERA', 'ORDER', 'ORGAN', 'OTHER', 'OUGHT', 'OUTER', 'OWNED', 'OWNER', 'OXIDE',
                'PACED', 'PACKS', 'PAGES', 'PAINS', 'PAINT', 'PAIRS', 'PALMS', 'PANEL', 'PANIC', 'PANTS',
                'PAPER', 'PARKS', 'PARTS', 'PARTY', 'PASTE', 'PATCH', 'PATHS', 'PAUSE', 'PEACE', 'PEAKS',
                'PEARL', 'PEERS', 'PENNY', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PICKS', 'PIECE', 'PILOT',
                'PITCH', 'PIZZA', 'PLACE', 'PLAIN', 'PLANE', 'PLANS', 'PLANT', 'PLATE', 'PLAYS', 'PLAZA',
                'PLOT', 'PLOTS', 'POEMS', 'POINT', 'POLES', 'POLLS', 'POOLS', 'POPUP', 'PORTS', 'POSED',
                'POSTS', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE',
                'PROOF', 'PROPS', 'PROUD', 'PROVE', 'PROXY', 'PULLS', 'PULSE', 'PUMPS', 'PUNCH', 'PUPIL',
                'PURSE', 'QUEEN', 'QUERY', 'QUEST', 'QUICK', 'QUIET', 'QUITE', 'QUOTE', 'RACER', 'RACES', 'RADIO',
                'RAISE', 'RANGE', 'RANKS', 'RAPID', 'RATES', 'RATIO', 'REACH', 'READS', 'READY', 'REALM',
                'REBEL', 'REFER', 'RELAX', 'RELAY', 'REMIX', 'REPLY', 'RESET', 'RIDER', 'RIDES', 'RIGHT',
                'RINGS', 'RISES', 'RISKS', 'RIVAL', 'RIVER', 'ROADS', 'ROAST', 'ROBOT', 'ROCKS', 'ROLES',
                'ROLLS', 'ROMAN', 'ROOMS', 'ROOTS', 'ROPES', 'ROSES', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL',
                'RUGBY', 'RULES', 'RURAL', 'SAFER', 'SALES', 'SALON', 'SAVES', 'SCALE', 'SCARE', 'SCENE',
                'SCOPE', 'SCORE', 'SCOTS', 'SCOUT', 'SCRAP', 'SCRUB', 'SEATS', 'SEEDS', 'SEEKS', 'SEEMS',
                'SELLS', 'SENDS', 'SENSE', 'SERVE', 'SEVEN', 'SHADE', 'SHAKE', 'SHALL', 'SHAME', 'SHAPE',
                'SHARE', 'SHARP', 'SHAVE', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIPS', 'SHIRT',
                'SHOCK', 'SHOES', 'SHOOT', 'SHOPS', 'SHORT', 'SHOTS', 'SHOUT', 'SHOWN', 'SHOWS', 'SHRUG',
                'SIDED', 'SIDES', 'SIGHT', 'SIGNS', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SIZES',
                'SKILL', 'SKINS', 'SKIPS', 'SKULL', 'SLACK', 'SLAVE', 'SLEEP', 'SLICE', 'SLIDE', 'SLIM',
                'SLIPS', 'SLOPE', 'SLOTS', 'SLOW', 'SMALL', 'SMART', 'SMILE', 'SMOKE', 'SNACK', 'SNAKE',
                'SNAPS', 'SNEAK', 'SNIFF', 'SNOWY', 'SOAPS', 'SOBER', 'SOCKS', 'SOFAS', 'SOLAR', 'SOLID',
                'SOLVE', 'SONGS', 'SORRY', 'SORTS', 'SOULS', 'SOUND', 'SOUPS', 'SOUTH', 'SPACE', 'SPARE',
                'SPARK', 'SPEAK', 'SPEED', 'SPELL', 'SPEND', 'SPENT', 'SPICE', 'SPINE', 'SPLIT', 'SPOKE',
                'SPOON', 'SPORT', 'SPOTS', 'SPRAY', 'SQUAD', 'STACK', 'STAFF', 'STAGE', 'STAIN', 'STAKE',
                'STALL', 'STAMP', 'STAND', 'STARE', 'STARS', 'START', 'STATE', 'STAYS', 'STEAD', 'STEAK',
                'STEAL', 'STEAM', 'STEEL', 'STEEP', 'STEPS', 'STERN', 'STICK', 'STILL', 'STING', 'STINK',
                'STOCK', 'STONE', 'STOOD', 'STOOL', 'STOPS', 'STORE', 'STORM', 'STORY', 'STRAP', 'STRIP',
                'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUITS', 'SUNNY', 'SUPER', 'SUPPLY',
                'SWEET', 'SWEPT', 'SWIFT', 'SWING', 'SWISS', 'SWORD', 'TABLE', 'TAKES', 'TALES', 'TALKS',
                'TANKS', 'TAPES', 'TARRY', 'TASTE', 'TAXES', 'TEACH', 'TEAMS', 'TEARS', 'TEENS', 'TEETH',
                'TELLS', 'TEMPO', 'TENDS', 'TERMS', 'TESTS', 'TEXTS', 'THANK', 'THEFT', 'THEIR', 'THEME',
                'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW',
                'THUMB', 'TIGER', 'TIGHT', 'TILES', 'TIMER', 'TIMES', 'TIRED', 'TITLE', 'TODAY', 'TOKEN',
                'TOOLS', 'TOOTH', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOURS', 'TOWER', 'TOWNS', 'TRACK',
                'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRASH', 'TREAT', 'TREES', 'TREND', 'TRIAL', 'TRIBE',
                'TRICK', 'TRIED', 'TRIES', 'TRIPS', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TUBES', 'TUNES',
                'TURNS', 'TWICE', 'TWINS', 'TWIST', 'TYPED', 'TYPES', 'UNCLE', 'UNDER', 'UNDUE', 'UNION',
                'UNITS', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'URGED', 'USAGE', 'USERS', 'USES',
                'USUAL', 'VALID', 'VALUE', 'VALVE', 'VIDEO', 'VIEWS', 'VINYL', 'VIRAL', 'VIRUS', 'VISIT',
                'VITAL', 'VOCAL', 'VOICE', 'VOTED', 'VOTES', 'WAGES', 'WAIST', 'WAITS', 'WAKE', 'WALKS',
                'WALLS', 'WANTS', 'WARDS', 'WARMS', 'WARNS', 'WASTE', 'WATCH', 'WATER', 'WAVES', 'WEARY',
                'WEEKS', 'WEIGH', 'WEIRD', 'WELLS', 'WHEAT', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE',
                'WHOLE', 'WHOSE', 'WIDEN', 'WIDER', 'WIDOW', 'WIDTH', 'WINDS', 'WINES', 'WINGS', 'WIPES',
                'WIRED', 'WIRES', 'WITCH', 'WIVES', 'WOMAN', 'WOMEN', 'WOODS', 'WORDS', 'WORKS', 'WORLD',
                'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YARDS', 'YEARS',
                'YOUNG', 'YOURS', 'YOUTH', 'ZEROS', 'ZONES'
            ],
            6: [
                // Common 6-letter words and target words from hard difficulty
                'COMPLEX', 'JOURNEY', 'HARMONY', 'BALANCE', 'DESTINY', 'FREEDOM', 'JUSTICE', 'WISDOM', 'COURAGE', 'MYSTERY',
                'ECLIPSE', 'THUNDER', 'RAINBOW', 'CRYSTAL', 'ENCHANT', 'FANTASY', 'MIRACLE', 'TRIUMPH', 'DIAMOND', 'PHOENIX',
                'ACCEPT', 'ACCESS', 'ACCORD', 'ACROSS', 'ACTION', 'ACTIVE', 'ACTUAL', 'ADVICE', 'ADVISE', 'AFFAIR',
                'AFFECT', 'AFRAID', 'AFRICA', 'AGENCY', 'AGENDA', 'AGREED', 'ALLOWS', 'ALMOST', 'ALWAYS', 'AMOUNT',
                'ANIMAL', 'ANNUAL', 'ANSWER', 'ANYONE', 'ANYWAY', 'APPEAL', 'APPEAR', 'ARABIA', 'ARGUED', 'AROUND',
                'ARRIVE', 'ARTIST', 'ASKING', 'ASSIST', 'ASSUME', 'ASTHMA', 'ATOMIC', 'ATTACH', 'ATTACK', 'ATTEND',
                'AUGUST', 'AUTHOR', 'AUTUMN', 'AVENUE', 'BACKED', 'BADGES', 'BARELY', 'BATTLE', 'BEAUTY', 'BECAME',
                'BECOME', 'BEFORE', 'BEHALF', 'BEHAVE', 'BELIEF', 'BELONG', 'BERLIN', 'BESIDE', 'BETTER', 'BEYOND',
                'BIGGER', 'BINARY', 'BISHOP', 'BLOCKS', 'BLOODY', 'BOARDS', 'BODIES', 'BORDER', 'BOTTLE', 'BOTTOM',
                'BOUGHT', 'BRANCH', 'BREATH', 'BRIDGE', 'BRIGHT', 'BRINGS', 'BRITAIN', 'BROKEN', 'BROWSE', 'BUCKET',
                'BUDGET', 'BUFFER', 'BUILDS', 'BUTTON', 'BUYERS', 'BUYING', 'CALLED', 'CAMERA', 'CAMPUS', 'CANCEL',
                'CANCER', 'CANDLE', 'CANNOT', 'CANVAS', 'CARBON', 'CAREER', 'CASTLE', 'CASUAL', 'CAUSES', 'CENTRE',
                'CEREAL', 'CHAINS', 'CHAIRS', 'CHANCE', 'CHANGE', 'CHARGE', 'CHARTS', 'CHEESE', 'CHERRY', 'CHOICE',
                'CHOOSE', 'CHOSEN', 'CHURCH', 'CIRCLE', 'CITIES', 'CLAIMS', 'CLAUSE', 'CLIENT', 'CLOSED', 'CLOSER',
                'CLOSES', 'CLOUDS', 'COFFEE', 'COLUMN', 'COMBAT', 'COMING', 'COMMIT', 'COMMON', 'COMPLY', 'CONFIG',
                'COPIES', 'COPPER', 'CORNER', 'COSMIC', 'COTTON', 'COUNTY', 'COUPLE', 'COURSE', 'COVERS', 'CREATE',
                'CREDIT', 'CRISIS', 'CUSTOM', 'DAMAGE', 'DANGER', 'DARING', 'DATING', 'DEADLY', 'DEALER', 'DEBATE',
                'DEBRIS', 'DECADE', 'DECENT', 'DECIDE', 'DEFEND', 'DEGREE', 'DEMAND', 'DENIAL', 'DEPEND', 'DEPUTY',
                'DESERT', 'DESIGN', 'DESIRE', 'DETAIL', 'DEVICE', 'DEVILS', 'DIALOG', 'DIDN', 'DIESEL', 'DIFFER',
                'DINING', 'DIRECT', 'DISHES', 'DIVIDE', 'DOCTOR', 'DOMAIN', 'DOUBLE', 'DRAGON', 'DRAWER', 'DRIVEN',
                'DRIVER', 'DRIVES', 'DURING', 'EASILY', 'EATING', 'EDITOR', 'EFFECT', 'EFFORT', 'EITHER', 'ELEVEN',
                'EMPIRE', 'ENABLE', 'ENDING', 'ENERGY', 'ENGINE', 'ENOUGH', 'ENTIRE', 'EQUALS', 'ESCAPE', 'ETHNIC',
                'EUROPE', 'EVENTS', 'EXCEPT', 'EXCUSE', 'EXPAND', 'EXPECT', 'EXPERT', 'EXPORT', 'EXTENT', 'FABRIC',
                'FACIAL', 'FACING', 'FAILED', 'FAIRLY', 'FALLEN', 'FAMILY', 'FAMOUS', 'FATHER', 'FELLOW', 'FEMALE',
                'FIELDS', 'FIGURE', 'FILING', 'FILLED', 'FILTER', 'FINGER', 'FINISH', 'FISCAL', 'FITTED', 'FLIGHT',
                'FLOWER', 'FLYING', 'FOLDER', 'FOLLOW', 'FORCED', 'FORCES', 'FORGET', 'FORMAT', 'FORMER', 'FOUGHT',
                'FOURTH', 'FRANCE', 'FRIEND', 'FROZEN', 'FRUITS', 'FUNDED', 'FUTURE', 'GALAXY', 'GARAGE', 'GARDEN',
                'GATHER', 'GENDER', 'GENIUS', 'GENTLE', 'GERMAN', 'GLOBAL', 'GOLDEN', 'GOVERN', 'GRADES', 'GREECE',
                'GROUND', 'GROUPS', 'GROWTH', 'GUIDED', 'GUILTY', 'HABITS', 'HANDED', 'HANDLE', 'HAPPEN', 'HARBOR',
                'HARDLY', 'HAWAII', 'HEADED', 'HEALTH', 'HEATED', 'HEAVEN', 'HEIGHT', 'HELPED', 'HIDDEN', 'HIGHER',
                'HIGHLY', 'HOLDER', 'HONEST', 'HOPING', 'HORROR', 'HORSES', 'HOTELS', 'HUMANS', 'HUNGER', 'HUNTER',
                'IGNORE', 'IMAGES', 'IMPACT', 'INCOME', 'INDEED', 'INDIAN', 'INFORM', 'INJURY', 'INSIDE', 'INSIST',
                'INTAKE', 'INTENT', 'INVEST', 'INVITE', 'ISLAND', 'ITSELF', 'JERSEY', 'JOINED', 'JORDAN', 'JUNGLE',
                'JUNIOR', 'KILLED', 'KILLER', 'KINDLY', 'KINGDOM', 'KITTY', 'LABELS', 'LADIES', 'LANDED', 'LAPTOP',
                'LARGER', 'LATEST', 'LATTER', 'LAUNCH', 'LAWYER', 'LEADER', 'LEAGUE', 'LEARNS', 'LEAVES', 'LEGACY',
                'LEGEND', 'LENGTH', 'LESSON', 'LETTER', 'LIGHTS', 'LIKELY', 'LIMITS', 'LISTEN', 'LITTLE', 'LIVING',
                'LOCKED', 'LONDON', 'LOOKED', 'LOSING', 'LOVELY', 'LOVERS', 'LOWEST', 'LYRICS', 'MAINLY', 'MAKING',
                'MANAGE', 'MANNER', 'MARBLE', 'MARGIN', 'MARINE', 'MARKED', 'MARKET', 'MASSES', 'MASTER', 'MATTER',
                'MATURE', 'MEDIUM', 'MEMBER', 'MEMORY', 'MENTAL', 'MERELY', 'METHOD', 'METRES', 'MEXICO', 'MIDDLE',
                'MINING', 'MINUTE', 'MIRROR', 'MISSING', 'MOBILE', 'MODERN', 'MODEST', 'MODULE', 'MOMENT', 'MONKEY',
                'MONTHS', 'MOSTLY', 'MOTHER', 'MOTION', 'MOVING', 'MURDER', 'MUSCLE', 'MUSEUM', 'MUSICAL', 'MYSELF',
                'NATION', 'NATIVE', 'NATURE', 'NEARBY', 'NEARLY', 'NEEDED', 'NEPHEW', 'NERVES', 'NESTED', 'NEVADA',
                'NEWEST', 'NICELY', 'NIGHTS', 'NOBODY', 'NODDED', 'NORMAL', 'NOTICE', 'NOTION', 'NOVELS', 'NUMBER',
                'NURSES', 'OBJECT', 'OBTAIN', 'OFFICE', 'OLDEST', 'ONLINE', 'OPENED', 'OPTION', 'ORANGE', 'ORDERS',
                'OREGON', 'ORIGIN', 'OTHERS', 'OUTPUT', 'OUTRUN', 'OWNER', 'OXFORD', 'PACKED', 'PACKET', 'PALACE',
                'PANELS', 'PAPERS', 'PARENT', 'PARTLY', 'PATENT', 'PATROL', 'PAYING', 'PENCIL', 'PEOPLE', 'PERIOD',
                'PERMIT', 'PERSON', 'PHONE', 'PHOTOS', 'PHRASE', 'PICKED', 'PIECES', 'PISTOL', 'PLACED', 'PLACES',
                'PLANET', 'PLANTS', 'PLAYED', 'PLAYER', 'PLEASE', 'PLENTY', 'POETRY', 'POINTS', 'POLICY', 'POLITE',
                'POLLEN', 'POLLS', 'PORTER', 'POSTED', 'POTATO', 'POUND', 'POWDER', 'PRAISE', 'PRAYER', 'PREFER',
                'PRETTY', 'PRICES', 'PRIEST', 'PRINCE', 'PRISON', 'PROFIT', 'PROMPT', 'PROPER', 'PROVES', 'PUBLIC',
                'PULLED', 'PURPLE', 'PURSUE', 'PUSHED', 'PUZZLE', 'QUAINT', 'QUEENS', 'RABBIT', 'RACIAL', 'RACING',
                'RADIUS', 'RAISED', 'RANDOM', 'RARELY', 'RATHER', 'RATING', 'REASON', 'REBELS', 'RECALL', 'RECENT',
                'RECORD', 'REDUCE', 'REFORM', 'REFUSE', 'REGARD', 'REGIME', 'REGION', 'REJECT', 'RELATE', 'RELIED',
                'RELIEF', 'REMAIN', 'REMARK', 'REMOTE', 'REMOVE', 'RENTAL', 'REPAIR', 'REPEAT', 'REPLACE', 'REPLY',
                'REPORT', 'RESCUE', 'RESIST', 'RESORT', 'RESULT', 'RESUME', 'RETAIL', 'RETURN', 'REVEAL', 'REVIEW',
                'REWARD', 'RIDING', 'RISING', 'RITUAL', 'ROBOTS', 'ROCKET', 'ROLLED', 'ROMANS', 'RUBBER', 'RULING',
                'RUSHED', 'RUSSIA', 'SACRED', 'SAFETY', 'SAMPLE', 'SAVING', 'SAYING', 'SCHEME', 'SCHOOL', 'SCIENCE',
                'SCORED', 'SCORES', 'SCREEN', 'SCRIPT', 'SEARCH', 'SEASON', 'SECOND', 'SECRET', 'SECTOR', 'SECURE',
                'SEEING', 'SEEMED', 'SELECT', 'SENATE', 'SENIOR', 'SERIES', 'SERVED', 'SERVER', 'SERVES', 'SETTLE',
                'SEVEN', 'SEVERE', 'SEXUAL', 'SHADOW', 'SHAPED', 'SHAPES', 'SHARED', 'SHARES', 'SHIELD', 'SHIFTS',
                'SHIRTS', 'SHOULD', 'SHOWED', 'SHOWER', 'SICILY', 'SIGNAL', 'SIGNED', 'SILVER', 'SIMPLE', 'SIMPLY',
                'SINGER', 'SINGLE', 'SISTER', 'SKILLS', 'SMOOTH', 'SNAKE', 'SOCCER', 'SOCIAL', 'SOCKET', 'SODIUM',
                'SOLELY', 'SOLVED', 'SONGS', 'SOUGHT', 'SOUNDS', 'SOURCE', 'SOVIET', 'SPEAKS', 'SPIRIT', 'SPORTS',
                'SPREAD', 'SPRING', 'SQUARE', 'STABLE', 'STAIRS', 'STANDS', 'STARTS', 'STATED', 'STATES', 'STATIC',
                'STAYED', 'STEADY', 'STOLEN', 'STONES', 'STORED', 'STORES', 'STORMS', 'STRAIN', 'STRAND', 'STREAM',
                'STREET', 'STRESS', 'STRICT', 'STRING', 'STRONG', 'STRUCK', 'STUDIO', 'STUPID', 'STYLES', 'SUBMIT',
                'SUBWAY', 'SUDDEN', 'SUFFER', 'SUMMER', 'SUMMIT', 'SUNDAY', 'SUNSET', 'SUPPLY', 'SURELY', 'SURVEY',
                'SWITCH', 'SYMBOL', 'SYSTEM', 'TABLES', 'TAKING', 'TALENT', 'TALKED', 'TARGET', 'TAUGHT', 'TEMPLE',
                'TENNIS', 'TERROR', 'TESTED', 'THANKS', 'THEORY', 'THIRTY', 'THOUGH', 'THREAD', 'THREAT', 'THREW',
                'THRONE', 'THROWN', 'TICKET', 'TIGERS', 'TIMING', 'TISSUE', 'TITLES', 'TOILET', 'TOMATO', 'TOPICS',
                'TOWARD', 'TRACKS', 'TRAGIC', 'TRAINS', 'TREATS', 'TREATY', 'TRENDS', 'TRIALS', 'TRIBAL', 'TRICKS',
                'TRIPS', 'TROOPS', 'TRUCKS', 'TRYING', 'TUNNEL', 'TWELVE', 'TWENTY', 'TYPING', 'UNABLE', 'UNIQUE',
                'UNITED', 'UNLESS', 'UNLIKE', 'UPDATE', 'UPLOAD', 'URGENT', 'USEFUL', 'VALLEY', 'VALUES', 'VARIED',
                'VARIES', 'VECTOR', 'VENUES', 'VERSUS', 'VICTIM', 'VIDEOS', 'VIEWER', 'VIRTUE', 'VISION', 'VISUAL',
                'VOLUME', 'WAITED', 'WALKED', 'WALKER', 'WANTED', 'WARMER', 'WEALTH', 'WEAPON', 'WEEKLY', 'WEIGHT',
                'WHEELS', 'WHOLLY', 'WIDELY', 'WINNER', 'WINTER', 'WISDOM', 'WISHED', 'WISHES', 'WITHIN', 'WIZARD',
                'WOODEN', 'WORKER', 'WORKED', 'WORTHY', 'WRITER', 'WRITES', 'YELLOW', 'YELLED', 'YIELDS', 'YOURS'
            ],
            7: [
                // Common 7-letter words and target words from expert difficulty
                'SYMPHONY', 'MYSTICAL', 'ETHEREAL', 'SERENITY', 'HARMONY', 'JOURNEY', 'TRIUMPH', 'DESTINY', 'PHOENIX', 'CRYSTAL',
                'ENCHANTED', 'ADVENTURE', 'DISCOVERY', 'FANTASTIC', 'BRILLIANT', 'MAJESTIC', 'SPLENDID', 'GORGEOUS', 'AMAZING', 'PERFECT',
                'WONDERFUL', 'BEAUTIFUL', 'STUNNING', 'FABULOUS', 'AWESOME', 'INCREDIBLE', 'MAGNIFICENT', 'SPECTACULAR', 'OUTSTANDING', 'EXCEPTIONAL',
                'ABILITY', 'ABSENCE', 'ACADEMY', 'ACCOUNT', 'ACCUSED', 'ACHIEVE', 'ACQUIRE', 'ADDRESS', 'ADVANCE', 'ADVISER',
                'AGAINST', 'ALCOHOL', 'ALLEGED', 'ALREADY', 'AMAZING', 'ANCIENT', 'ANOTHER', 'ANXIETY', 'ANXIOUS', 'ANYBODY',
                'APPLIED', 'ARRANGE', 'ARRIVAL', 'ARTICLE', 'ASSAULT', 'ASSURED', 'ATTEMPT', 'ATTRACT', 'AUCTION', 'AVERAGE',
                'BACKING', 'BALANCE', 'BANKING', 'BATTERY', 'BEARING', 'BEATING', 'BECAUSE', 'BEDROOM', 'BENEFIT', 'BETWEEN',
                'BIOLOGY', 'BOOKING', 'BROTHER', 'BROUGHT', 'BURNING', 'CABINET', 'CALLING', 'CAPABLE', 'CAPITAL', 'CAPTAIN',
                'CAPTURE', 'CARDIAC', 'CAREFUL', 'CARRIER', 'CATALOG', 'CEILING', 'CENTRAL', 'CENTURY', 'CERTAIN', 'CHAMBER',
                'CHANGED', 'CHANNEL', 'CHAPTER', 'CHARITY', 'CHARGES', 'CHEAPER', 'CHECKED', 'CHICKEN', 'CHRONIC', 'CIRCUIT',
                'CLASSIC', 'CLIMATE', 'CLOTHES', 'CLOSURE', 'COACHES', 'COATING', 'COCKTAIL', 'COLLECT', 'COLLEGE', 'COMBINE',
                'COMFORT', 'COMMAND', 'COMMENT', 'COMPACT', 'COMPANY', 'COMPARE', 'COMPETE', 'COMPILE', 'COMPLEX', 'CONCEPT',
                'CONCERN', 'CONCERT', 'CONDUCT', 'CONFIRM', 'CONNECT', 'CONSENT', 'CONSIST', 'CONSULT', 'CONTACT', 'CONTAIN',
                'CONTENT', 'CONTEST', 'CONTEXT', 'CONTROL', 'CONVERT', 'COOKIES', 'COOKING', 'CORRECT', 'CORRUPT', 'COSTUME',
                'COTTAGE', 'COUNCIL', 'COUNTER', 'COUNTRY', 'COURAGE', 'COURSES', 'COVERED', 'CRASHES', 'CREATED', 'CREATOR',
                'CRICKET', 'CROSSED', 'CRYSTAL', 'CULTURE', 'CURRENT', 'CUTTING', 'DAMAGES', 'DANCING', 'DEALING', 'DECIDED',
                'DEFENCE', 'DEFICIT', 'DELIVER', 'DENSITY', 'DEPENDS', 'DEPOSIT', 'DESKTOP', 'DESPITE', 'DESTROY', 'DETAILS',
                'DEVELOP', 'DEVOTED', 'DIAMOND', 'DIGITAL', 'DISEASE', 'DIVIDED', 'DOLLARS', 'DOMAINS', 'DRAWING', 'DRESSED',
                'DRIVING', 'DYNAMIC', 'EASTERN', 'ECOLOGY', 'ECONOMY', 'EDITION', 'ELEGANT', 'ELEMENT', 'EMPEROR', 'ENABLES',
                'ENCODER', 'ENDLESS', 'ENFORCE', 'ENHANCE', 'ENGLAND', 'ENGLISH', 'ENHANCE', 'EQUALLY', 'ESCAPED', 'ESSENCE',
                'EVENING', 'EXACTLY', 'EXAMINE', 'EXAMPLE', 'EXCITED', 'EXCLUDE', 'EXECUTE', 'EXHIBIT', 'EXISTED', 'EXPLAIN',
                'EXPLORE', 'EXPRESS', 'EXTREME', 'FACTORY', 'FACULTY', 'FAILING', 'FAILURE', 'FASHION', 'FASTEST', 'FEATURE',
                'FEDERAL', 'FEELING', 'FICTION', 'FIFTEEN', 'FINANCE', 'FINDING', 'FIREWALL', 'FITNESS', 'FLIGHTS', 'FLOWERS',
                'FOCUSED', 'FOREIGN', 'FOREVER', 'FORMULA', 'FORTUNE', 'FORWARD', 'FREEDOM', 'FRIENDS', 'FURTHER', 'GALLERY',
                'GARAGE', 'GARDENS', 'GENERAL', 'GENUINE', 'GETTING', 'GOURMET', 'GROWING', 'HABITAT', 'HANDLES', 'HAPPENS',
                'HARVEST', 'HEADING', 'HEALTHY', 'HEARING', 'HEATING', 'HELPFUL', 'HERSELF', 'HIGHEST', 'HIGHWAY', 'HIMSELF',
                'HISTORY', 'HOLIDAY', 'HORIZON', 'HOUSING', 'HOWEVER', 'HUNDRED', 'HUNTING', 'HUSBAND', 'ICEBERG', 'IMAGINE',
                'IMPROVE', 'INCLUDE', 'INDEXED', 'INDIANS', 'INITIAL', 'INQUIRY', 'INSIGHT', 'INSPIRE', 'INSTALL', 'INSTANT',
                'INSTEAD', 'INTEGER', 'INTENSE', 'INVOLVE', 'ISLANDS', 'JACKETS', 'JANUARY', 'JEWELRY', 'JOURNEY', 'JUSTICE',
                'JUSTIFY', 'KEEPING', 'KITCHEN', 'KNIGHTS', 'LARGEST', 'LASTING', 'LAUNDRY', 'LAWYERS', 'LEADERS', 'LEADING',
                'LEARNED', 'LEATHER', 'LEAVING', 'LECTURE', 'LEGENDS', 'LEISURE', 'LETTERS', 'LIBERAL', 'LIBERTY', 'LIBRARY',
                'LIMITED', 'LISTING', 'LOGICAL', 'LOOKING', 'MACHINE', 'MAGICAL', 'MANAGED', 'MANAGER', 'MANDATE', 'MARKETS',
                'MARRIED', 'MASSIVE', 'MASTERS', 'MATCHES', 'MATTERS', 'MAXIMUM', 'MEANING', 'MEASURE', 'MEDICAL', 'MEETING',
                'MEMBERS', 'MENTION', 'MESSAGE', 'METHODS', 'MILLION', 'MINERAL', 'MINIMAL', 'MINIMUM', 'MISSING', 'MISSION',
                'MISTAKE', 'MIXTURE', 'MONITOR', 'MORNING', 'MOTHERS', 'MOUNTED', 'MUSICAL', 'MYSTERY', 'NATURAL', 'NEAREST',
                'NETWORK', 'NEUTRAL', 'NIGERIA', 'NOMINAL', 'NORFOLK', 'NOTHING', 'NOWHERE', 'NUCLEAR', 'NUMBERS', 'NURSERY',
                'NURSING', 'OBJECTS', 'OBVIOUS', 'OCTOBER', 'OFFENSE', 'OFFICER', 'ONGOING', 'OPENING', 'OPERATE', 'OPINION',
                'OPTICAL', 'OPTIMAL', 'OPTIONS', 'ORDERED', 'ORGANIC', 'ORIGINS', 'OUTCOME', 'OUTDOOR', 'OUTLOOK', 'OUTSIDE',
                'OVERALL', 'OVERLAP', 'PACIFIC', 'PACKAGE', 'PACKETS', 'PAINTED', 'PARKING', 'PARTIAL', 'PARTIES', 'PARTNER',
                'PASSAGE', 'PASSING', 'PASSION', 'PASSIVE', 'PATTERN', 'PAYABLE', 'PAYMENT', 'PAYROLL', 'PERFECT', 'PERFORM',
                'PERHAPS', 'PERIODS', 'PERMITS', 'PERSONS', 'PHANTOM', 'PHOENIX', 'PICTURE', 'PIONEER', 'PLANNED', 'PLASTIC',
                'PLAYERS', 'PLAYING', 'PLEASED', 'POINTER', 'POPULAR', 'PORTION', 'POVERTY', 'PRECISE', 'PREDICT', 'PREMIER',
                'PREMIUM', 'PREPARE', 'PRESENT', 'PRESSED', 'PREVENT', 'PRIMARY', 'PRINTER', 'PRIVACY', 'PRIVATE', 'PROBLEM',
                'PROCEED', 'PROCESS', 'PRODUCE', 'PRODUCT', 'PROFILE', 'PROGRAM', 'PROJECT', 'PROMISE', 'PROTECT', 'PROTEST',
                'PROVIDE', 'PUBLISH', 'PURPOSE', 'PUSHING', 'QUALIFY', 'QUALITY', 'QUARTER', 'QUERIES', 'QUICKLY', 'RAILWAY',
                'RANGERS', 'RAPIDLY', 'READILY', 'READING', 'REALITY', 'REALIZE', 'RECEIPT', 'RECEIVE', 'RECIPES', 'RECOVER',
                'REDUCED', 'REFLECT', 'REFORMS', 'REGARDS', 'REGULAR', 'RELATED', 'RELEASE', 'REMAINS', 'REMEMBER', 'REMOVAL',
                'REMOVED', 'REPLACE', 'REPLIED', 'REPORTS', 'REQUEST', 'REQUIRE', 'RESERVE', 'RESOLVE', 'RESPECT', 'RESPOND',
                'RESTART', 'RESTORE', 'RESULTS', 'RETIRED', 'RETURNS', 'REVEALS', 'REVENUE', 'REVERSE', 'REVIEWS', 'REWARDS',
                'РОССИЯ', 'ROUTINE', 'ROYALTY', 'RUSSIAN', 'SAMPLES', 'SATISFY', 'SAVINGS', 'SCANNER', 'SCIENCE', 'SCRIPTS',
                'SEASONS', 'SECONDS', 'SECTION', 'SEEKING', 'SELLING', 'SEMINAR', 'SENIORS', 'SERIOUS', 'SERVICE', 'SESSION',
                'SETTING', 'SEVENTH', 'SEVERAL', 'SHANNON', 'SHARING', 'SHELTER', 'SHERIFF', 'SILICON', 'SIMILAR', 'SITTING',
                'SIXTEEN', 'SKILLED', 'SMOKING', 'SOCIETY', 'SOMEHOW', 'SOMEONE', 'SPEAKER', 'SPECIAL', 'SPIRITS', 'STATION',
                'STORAGE', 'STRANGE', 'STRETCH', 'STRINGS', 'STUDIES', 'SUBJECT', 'SUCCEED', 'SUCCESS', 'SUGGEST', 'SUMMARY',
                'SUPPORT', 'SUPREME', 'SURFACE', 'SURGERY', 'SURPLUS', 'SURVIVE', 'SUSPECT', 'SYSTEMS', 'TABLETS', 'TALKING',
                'TARGETS', 'TEACHER', 'TELLING', 'TEXTILE', 'THEATER', 'THERAPY', 'THEREBY', 'THOUGHT', 'THROUGH', 'TICKETS',
                'TONIGHT', 'TOTALLY', 'TOWARDS', 'TRADING', 'TRAFFIC', 'TRAINED', 'TRANSIT', 'TREATED', 'TROUBLE', 'TRUSTED',
                'TUESDAY', 'TURNING', 'TYPICAL', 'UBUNTU', 'UNCLEAR', 'UNDERGO', 'UNIFORM', 'UNKNOWN', 'UNUSUAL', 'UPDATES',
                'UPGRADE', 'URANIUM', 'UTILITY', 'VACATION', 'VARIETY', 'VARIOUS', 'VEHICLE', 'VERSION', 'VETERAN', 'VICTIMS',
                'VILLAGE', 'VINTAGE', 'VIOLENT', 'VIRTUAL', 'VISIBLE', 'VISITOR', 'WAITING', 'WALKING', 'WARNING', 'WARRANTY',
                'WEATHER', 'WEBSITE', 'WELCOME', 'WELFARE', 'WESTERN', 'WHETHER', 'WILLING', 'WINDOWS', 'WINNING', 'WINTERS',
                'WIRELESS', 'WITNESS', 'WORKING', 'WRITING', 'WRITTEN', 'ZEALAND'
            ]
        };
        
        // Combine all words into a single searchable dictionary
        const allWords = new Set([
            ...dictionary[4],
            ...dictionary[5], 
            ...dictionary[6],
            ...dictionary[7]
        ]);
        
        return {
            byLength: dictionary,
            all: allWords
        };
    }
    
    init() {
        // Ensure DOM elements exist
        this.gameBoard = document.getElementById('game-board');
        this.keyboard = document.getElementById('keyboard');
        
        if (!this.gameBoard || !this.keyboard) {
            console.error('Required DOM elements not found');
            return;
        }
        
        this.createBoard();
        this.createKeyboard();
        this.setupEventListeners();
        this.newGame();
        this.updateDisplay();
        this.loadSettings();
        
        // Show tutorial for first-time players
        if (!localStorage.getItem('vibewordle-played')) {
            setTimeout(() => {
                this.showModal('help-modal');
            }, 500);
            localStorage.setItem('vibewordle-played', 'true');
        }
        
        console.log('VibeWordle initialized successfully');
        
        // Test tile access after initialization
        setTimeout(() => {
            this.testTileAccess();
        }, 1000);
    }
    
    testTileAccess() {
        console.log('Testing tile access...');
        const testTiles = document.querySelectorAll('.tile');
        console.log('Total tiles found:', testTiles.length);
        
        if (testTiles.length > 0) {
            const firstTile = testTiles[0];
            console.log('First tile:', firstTile, 'Row:', firstTile.dataset.row, 'Col:', firstTile.dataset.col);
            
            // Test setting content
            firstTile.textContent = 'T';
            firstTile.classList.add('filled');
            console.log('Test: Set first tile to "T"');
            
            setTimeout(() => {
                firstTile.textContent = '';
                firstTile.classList.remove('filled');
                console.log('Test: Cleared first tile');
            }, 2000);
        } else {
            console.error('No tiles found during test!');
        }
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Keyboard input - ensure this is attached to document
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.key);
            this.handleKeyPress(e);
        });
        
        // Virtual keyboard
        if (this.keyboard) {
            this.keyboard.addEventListener('click', (e) => {
                if (e.target.classList.contains('key')) {
                    console.log('Virtual key clicked:', e.target.dataset.key);
                    this.handleKeyClick(e.target.dataset.key);
                }
            });
        }
        
        // Power-up buttons - use setTimeout to ensure DOM is ready
        setTimeout(() => {
            document.querySelectorAll('.powerup-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const powerup = e.currentTarget.dataset.powerup;
                    this.usePowerup(powerup);
                });
            });
        }, 100);
        
        // Modal buttons
        this.setupModalEventListeners();
        
        // Settings - use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const difficultySelect = document.getElementById('difficulty-select');
            const timeLimitToggle = document.getElementById('time-limit-toggle');
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            
            if (difficultySelect) {
                difficultySelect.addEventListener('change', (e) => {
                    this.changeDifficulty(e.target.value);
                });
            }
            
            if (timeLimitToggle) {
                timeLimitToggle.addEventListener('change', (e) => {
                    this.toggleTimer(e.target.checked);
                });
            }
            
            if (darkModeToggle) {
                darkModeToggle.addEventListener('change', (e) => {
                    this.toggleDarkMode(e.target.checked);
                });
            }
        }, 100);
        
        console.log('Event listeners setup complete');
    }
    
    setupModalEventListeners() {
        // Close modal buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });
        
        // Header buttons
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.updateStats();
            this.showModal('stats-modal');
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showModal('settings-modal');
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showModal('help-modal');
        });
        
        // Game over modal buttons
        document.getElementById('next-round-btn').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.newGame();
        });
        
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareResult();
        });
        
        // Settings modal buttons
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            this.hideModal('settings-modal');
        });
        
        document.getElementById('reset-stats-btn').addEventListener('click', () => {
            this.resetStats();
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }
    
    createBoard() {
        console.log('Creating board with', this.maxAttempts, 'rows and', this.wordLength, 'columns');
        
        if (!this.gameBoard) {
            console.error('Game board element not found!');
            return;
        }
        
        this.gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.rowIndex = i; // Additional identifier
            
            for (let j = 0; j < this.wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = i;
                tile.dataset.col = j;
                tile.id = `tile-${i}-${j}`; // Unique ID for debugging
                row.appendChild(tile);
            }
            this.gameBoard.appendChild(row);
        }
        
        // Verify board creation
        const createdTiles = document.querySelectorAll('.tile');
        console.log('Board created successfully. Total tiles:', createdTiles.length);
        console.log('First few tiles:', Array.from(createdTiles).slice(0, 5).map(t => t.id));
    }
    
    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
        ];
        
        this.keyboard.innerHTML = '';
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = 'key';
                keyButton.dataset.key = key;
                keyButton.textContent = key;
                
                if (key === 'ENTER' || key === 'DELETE') {
                    keyButton.classList.add('wide');
                }
                
                keyboardRow.appendChild(keyButton);
            });
            this.keyboard.appendChild(keyboardRow);
        });
    }
    
    newGame() {
        // Reset game state
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameState = 'playing';
        this.guesses = [];
        this.evaluations = [];
        this.revealedPositions.clear();
        
        // Choose new word based on difficulty
        const wordList = this.wordLists[this.difficulty];
        this.targetWord = wordList[Math.floor(Math.random() * wordList.length)];
        this.currentHint = this.wordHints[this.targetWord] || 'No hint available for this word.';
        
        // Reset board
        this.createBoard();
        this.resetKeyboard();
        
        // Start timer if enabled
        if (document.getElementById('time-limit-toggle').checked) {
            this.startTimer();
        }
        
        // Update display
        this.updateDisplay();
        this.updateHint('Start typing your guess...');
        
        console.log('New game started. Target word:', this.targetWord); // Debug only
    }
    
    handleKeyPress(e) {
        console.log('handleKeyPress called:', e.key, 'gameState:', this.gameState);
        
        if (this.gameState !== 'playing') {
            console.log('Game not in playing state, ignoring key press');
            return;
        }
        
        // Prevent default behavior for game keys
        if (e.key === 'Enter' || e.key === 'Backspace' || e.key.match(/^[a-zA-Z]$/)) {
            e.preventDefault();
        }
        
        const key = e.key.toUpperCase();
        console.log('Processing key:', key);
        
        if (key === 'ENTER') {
            console.log('Enter key pressed - submitting guess');
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            console.log('Backspace key pressed - deleting letter');
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            console.log('Letter key pressed:', key);
            this.addLetter(key);
        } else {
            console.log('Unhandled key:', key);
        }
    }
    
    handleKeyClick(key) {
        if (this.gameState !== 'playing') return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'DELETE') {
            this.deleteLetter();
        } else {
            this.addLetter(key);
        }
    }
    
    addLetter(letter) {
        console.log('Adding letter:', letter, 'Current guess:', this.currentGuess, 'Word length:', this.wordLength);
        
        if (this.currentGuess.length < this.wordLength) {
            this.currentGuess += letter;
            console.log('Updated guess:', this.currentGuess);
            this.updateCurrentRow();
            
            // Force update display as fallback
            this.forceUpdateDisplay();
        } else {
            console.log('Cannot add letter - guess is full');
        }
    }
    
    forceUpdateDisplay() {
        // Direct approach to update tiles
        for (let i = 0; i < this.wordLength; i++) {
            const tileId = `tile-${this.currentRow}-${i}`;
            const tile = document.getElementById(tileId);
            
            if (tile) {
                if (i < this.currentGuess.length) {
                    tile.textContent = this.currentGuess[i];
                    tile.classList.add('filled');
                } else {
                    tile.textContent = '';
                    tile.classList.remove('filled');
                }
            }
        }
    }
    
    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentRow();
            this.forceUpdateDisplay();
        }
    }
    
    updateCurrentRow() {
        console.log('Updating current row:', this.currentRow, 'with guess:', this.currentGuess);
        
        // Try multiple selectors to find the tiles
        let tiles = document.querySelectorAll(`[data-row="${this.currentRow}"] .tile`);
        
        if (tiles.length === 0) {
            // Fallback: try different selector
            tiles = document.querySelectorAll(`.row:nth-child(${this.currentRow + 1}) .tile`);
        }
        
        if (tiles.length === 0) {
            // Another fallback: get all tiles and filter by row
            const allTiles = document.querySelectorAll('.tile');
            tiles = Array.from(allTiles).filter(tile => 
                tile.dataset.row == this.currentRow
            );
        }
        
        console.log('Found tiles:', tiles.length, 'Expected:', this.wordLength);
        
        if (tiles.length === 0) {
            console.error('No tiles found for row', this.currentRow);
            return;
        }
        
        tiles.forEach((tile, index) => {
            if (index < this.currentGuess.length) {
                tile.textContent = this.currentGuess[index];
                tile.classList.add('filled');
                console.log(`Set tile ${index} to:`, this.currentGuess[index]);
            } else {
                tile.textContent = '';
                tile.classList.remove('filled');
                console.log(`Cleared tile ${index}`);
            }
        });
    }
    
    async submitGuess() {
        if (this.currentGuess.length !== this.wordLength) {
            this.showMessage('Not enough letters!');
            this.shakeRow(this.currentRow);
            return;
        }
        
        if (!this.isValidWord(this.currentGuess)) {
            this.showMessage('Word not in dictionary!');
            this.shakeRow(this.currentRow);
            return;
        }
        
        // Debug: log the current state
        console.log('=== SUBMITTING GUESS ===');
        console.log('Guess:', this.currentGuess);
        console.log('Target:', this.targetWord);
        console.log('Row:', this.currentRow);
        
        // Evaluate the guess
        const evaluation = this.evaluateGuess(this.currentGuess);
        console.log('Evaluation result:', evaluation);
        
        this.guesses.push(this.currentGuess);
        this.evaluations.push(evaluation);
        
        // Animate tiles
        await this.animateTiles(this.currentRow, evaluation);
        
        // Update keyboard
        this.updateKeyboard(this.currentGuess, evaluation);
        
        // Check win condition
        if (this.currentGuess === this.targetWord) {
            this.gameState = 'won';
            this.handleGameEnd(true);
        } else if (this.currentRow === this.maxAttempts - 1) {
            this.gameState = 'lost';
            this.handleGameEnd(false);
        } else {
            this.currentRow++;
            this.currentGuess = '';
            this.updateHint();
        }
    }
    
    // Debug function to test evaluation logic
    testEvaluation() {
        console.log('=== TESTING EVALUATION LOGIC ===');
        
        // Test case from user's image
        this.targetWord = 'MISTY';
        console.log('Target word set to:', this.targetWord);
        
        // Test "STICK" against "MISTY"
        console.log('\n--- Testing STICK vs MISTY ---');
        const stickResult = this.evaluateGuess('STICK');
        console.log('STICK vs MISTY result:', stickResult);
        console.log('Expected: S=absent, T=present, I=present, C=absent, K=absent');
        
        // Test "MISTY" against "MISTY"
        console.log('\n--- Testing MISTY vs MISTY ---');
        const mistyResult = this.evaluateGuess('MISTY');
        console.log('MISTY vs MISTY result:', mistyResult);
        console.log('Expected: all correct');
        
        // Test some other scenarios
        console.log('\n--- Testing CRANE vs MISTY ---');
        const craneResult = this.evaluateGuess('CRANE');
        console.log('CRANE vs MISTY result:', craneResult);
        
        console.log('\n--- Testing GHOUL vs MISTY ---');
        const ghoulResult = this.evaluateGuess('GHOUL');
        console.log('GHOUL vs MISTY result:', ghoulResult);
        
        // Additional test with word containing C
        console.log('\n--- Testing with a word that contains C ---');
        this.targetWord = 'MAGIC';
        console.log('Target word set to:', this.targetWord);
        const stickMagicResult = this.evaluateGuess('STICK');
        console.log('STICK vs MAGIC result:', stickMagicResult);
        
        console.log('=== TEST COMPLETE ===');
        
        // Reset to original word for continued gameplay
        this.newGame();
    }
    
    evaluateGuess(guess) {
        console.log('Evaluating guess:', guess, 'against target:', this.targetWord);
        
        const result = [];
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const targetLetterCount = {};
        
        // Count letters in target word
        targetArray.forEach(letter => {
            targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
        });
        
        console.log('Target letter counts:', targetLetterCount);
        
        // First pass: mark correct letters (green)
        guessArray.forEach((letter, index) => {
            if (letter === targetArray[index]) {
                result[index] = 'correct';
                targetLetterCount[letter]--;
                console.log(`Position ${index}: ${letter} is CORRECT (green)`);
            }
        });
        
        // Second pass: mark present (yellow) and absent (gray) letters
        guessArray.forEach((letter, index) => {
            if (result[index] === undefined) {
                if (targetLetterCount[letter] > 0) {
                    result[index] = 'present';
                    targetLetterCount[letter]--;
                    console.log(`Position ${index}: ${letter} is PRESENT (yellow)`);
                } else {
                    result[index] = 'absent';
                    console.log(`Position ${index}: ${letter} is ABSENT (gray)`);
                }
            }
        });
        
        console.log('Final evaluation result:', result);
        console.log('Target word was:', this.targetWord);
        return result;
    }
    
    async animateTiles(row, evaluation) {
        console.log('Animating tiles for row:', row, 'with evaluation:', evaluation);
        
        // Try multiple ways to find the tiles
        let tiles = document.querySelectorAll(`[data-row="${row}"] .tile`);
        
        if (tiles.length === 0) {
            // Fallback: use tile IDs
            tiles = [];
            for (let i = 0; i < this.wordLength; i++) {
                const tile = document.getElementById(`tile-${row}-${i}`);
                if (tile) tiles.push(tile);
            }
        }
        
        if (tiles.length === 0) {
            console.error('No tiles found for animation in row:', row);
            return;
        }
        
        console.log('Found', tiles.length, 'tiles for animation');
        
        // Animate each tile with the correct evaluation
        for (let i = 0; i < tiles.length && i < evaluation.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    const tile = tiles[i];
                    const evalClass = evaluation[i];
                    
                    console.log(`Animating tile ${i} with class:`, evalClass);
                    
                    // Remove any existing evaluation classes
                    tile.classList.remove('correct', 'present', 'absent', 'revealed');
                    
                    // Add the new evaluation class
                    tile.classList.add(evalClass);
                    
                    // Ensure the tile still shows the letter
                    if (!tile.textContent && this.currentGuess[i]) {
                        tile.textContent = this.currentGuess[i];
                    }
                    
                    resolve();
                }, i * 150); // Slightly longer delay for better visual effect
            });
        }
        
        // Wait a bit more before continuing
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    updateKeyboard(guess, evaluation) {
        console.log('Updating keyboard for guess:', guess, 'with evaluation:', evaluation);
        
        const keys = document.querySelectorAll('.key');
        console.log('Found', keys.length, 'keyboard keys');
        
        guess.split('').forEach((letter, index) => {
            const key = Array.from(keys).find(k => k.dataset.key === letter);
            
            if (key) {
                const currentClass = evaluation[index];
                console.log(`Updating key ${letter} with class:`, currentClass);
                
                // Remove existing evaluation classes
                key.classList.remove('correct', 'present', 'absent');
                
                // Only update if the new state is more informative
                if (!key.classList.contains('correct')) {
                    if (currentClass === 'correct') {
                        key.classList.add('correct');
                        console.log(`Key ${letter} marked as CORRECT`);
                    } else if (currentClass === 'present' && !key.classList.contains('present')) {
                        key.classList.add('present');
                        console.log(`Key ${letter} marked as PRESENT`);
                    } else if (currentClass === 'absent' && !key.classList.contains('present')) {
                        key.classList.add('absent');
                        console.log(`Key ${letter} marked as ABSENT`);
                    }
                }
            } else {
                console.warn('Key not found for letter:', letter);
            }
        });
        
        console.log('Keyboard update complete');
    }
    
    resetKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = 'key';
            if (key.dataset.key === 'ENTER' || key.dataset.key === 'DELETE') {
                key.classList.add('wide');
            }
        });
    }
    
    handleGameEnd(won) {
        this.stopTimer();
        
        if (won) {
            this.calculateScore();
            this.streak++;
            this.level++;
            this.updateStats(true);
            this.showMessage('Congratulations! 🎉');
        } else {
            this.streak = 0;
            this.updateStats(false);
            this.showMessage(`The word was: ${this.targetWord}`);
        }
        
        setTimeout(() => {
            this.showGameOverModal(won);
        }, 1500);
    }
    
    calculateScore() {
        const baseScore = 100;
        const attemptBonus = (this.maxAttempts - this.currentRow) * 20;
        const timeBonus = Math.floor(this.currentTime / 10);
        const difficultyMultiplier = {
            'easy': 1,
            'normal': 1.5,
            'hard': 2,
            'expert': 3
        };
        
        const roundScore = Math.floor(
            (baseScore + attemptBonus + timeBonus) * difficultyMultiplier[this.difficulty]
        );
        
        this.score += roundScore;
        return roundScore;
    }
    
    isValidWord(word) {
        console.log('Checking if word is valid:', word);
        
        // First check if the word is the correct length
        if (word.length !== this.wordLength) {
            console.log('Word rejected: incorrect length');
            return false;
        }
        
        // Check against the comprehensive dictionary
        const isValid = this.dictionary.all.has(word.toUpperCase());
        
        if (isValid) {
            console.log('Word accepted:', word);
        } else {
            console.log('Word rejected: not in dictionary');
        }
        
        return isValid;
    }
    
    // Power-up functions
    usePowerup(type) {
        if (this.powerups[type] <= 0 || this.gameState !== 'playing') return;
        
        this.powerups[type]--;
        this.updatePowerupDisplay();
        
        switch (type) {
            case 'hint':
                this.showHintPowerup();
                break;
            case 'reveal':
                this.revealLetterPowerup();
                break;
            case 'shuffle':
                this.shufflePowerup();
                break;
            case 'time':
                this.addTimePowerup();
                break;
        }
    }
    
    showHintPowerup() {
        this.updateHint(this.currentHint);
        this.showMessage('💡 Hint revealed!');
    }
    
    revealLetterPowerup() {
        const availablePositions = [];
        for (let i = 0; i < this.wordLength; i++) {
            if (!this.revealedPositions.has(i)) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length > 0) {
            const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
            const letter = this.targetWord[randomPos];
            
            // Add revealed letter to current guess at the correct position
            let newGuess = this.currentGuess.split('');
            while (newGuess.length < this.wordLength) {
                newGuess.push('');
            }
            newGuess[randomPos] = letter;
            this.currentGuess = newGuess.join('').slice(0, this.wordLength);
            
            this.revealedPositions.add(randomPos);
            this.updateCurrentRow();
            
            // Highlight the revealed tile
            const tile = document.querySelector(`[data-row="${this.currentRow}"][data-col="${randomPos}"]`);
            if (tile) {
                tile.classList.add('revealed');
            }
            
            this.showMessage(`🔍 Letter "${letter}" revealed at position ${randomPos + 1}!`);
        }
    }
    
    shufflePowerup() {
        // Show letters used so far in random order
        const usedLetters = new Set();
        this.guesses.forEach(guess => {
            guess.split('').forEach(letter => usedLetters.add(letter));
        });
        
        if (usedLetters.size > 0) {
            const shuffled = Array.from(usedLetters).sort(() => Math.random() - 0.5);
            this.showMessage(`🔄 Letters tried: ${shuffled.join(', ')}`);
        } else {
            this.showMessage('🔄 No letters tried yet!');
        }
    }
    
    addTimePowerup() {
        if (this.timerInterval) {
            this.currentTime += 60; // Add 1 minute
            this.showMessage('⏰ +60 seconds added!');
        }
    }
    
    // Timer functions
    startTimer() {
        this.currentTime = this.timeLimit;
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            
            if (this.currentTime <= 0) {
                this.gameState = 'lost';
                this.handleGameEnd(false);
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // UI Update functions
    updateDisplay() {
        document.getElementById('current-level').textContent = this.level;
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('current-streak').textContent = this.streak;
        document.getElementById('difficulty-level').textContent = 
            this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
        
        this.updatePowerupDisplay();
    }
    
    updatePowerupDisplay() {
        Object.keys(this.powerups).forEach(type => {
            const countElement = document.getElementById(`${type}-count`);
            const btnElement = document.getElementById(`${type}-powerup`);
            
            if (countElement) {
                countElement.textContent = this.powerups[type];
            }
            
            if (btnElement) {
                btnElement.disabled = this.powerups[type] <= 0;
            }
        });
    }
    
    updateHint(text = null) {
        const hintElement = document.getElementById('hint-text');
        if (text) {
            hintElement.textContent = text;
        } else {
            // Provide contextual hints based on attempts
            if (this.currentRow === 0) {
                hintElement.textContent = 'Start typing your guess...';
            } else if (this.currentRow === 1) {
                hintElement.textContent = 'Try different letters...';
            } else if (this.currentRow >= 2) {
                hintElement.textContent = `Think about the ${this.wordLength}-letter word...`;
            }
        }
    }
    
    showMessage(text) {
        // Create or update message display
        let messageElement = document.getElementById('game-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'game-message';
            messageElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(messageElement);
        }
        
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 2000);
    }
    
    shakeRow(row) {
        const tiles = document.querySelectorAll(`[data-row="${row}"] .tile`);
        tiles.forEach(tile => {
            tile.classList.add('shake');
            setTimeout(() => tile.classList.remove('shake'), 500);
        });
    }
    
    // Modal functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const wordElement = document.getElementById('correct-word');
        const attemptsElement = document.getElementById('attempts-used');
        const scoreElement = document.getElementById('round-score');
        const timeElement = document.getElementById('completion-time');
        const definitionElement = document.getElementById('word-definition');
        
        title.textContent = won ? 'Congratulations! 🎉' : 'Game Over 😔';
        wordElement.textContent = this.targetWord;
        attemptsElement.textContent = `${this.currentRow + (won ? 1 : 0)}/${this.maxAttempts}`;
        
        if (won) {
            const roundScore = this.calculateScore();
            scoreElement.textContent = `+${roundScore}`;
        } else {
            scoreElement.textContent = '0';
        }
        
        const timeUsed = this.timeLimit - this.currentTime;
        const minutes = Math.floor(timeUsed / 60);
        const seconds = timeUsed % 60;
        timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        definitionElement.textContent = this.wordHints[this.targetWord] || 'No definition available.';
        
        this.showModal('game-over-modal');
    }
    
    // Settings functions
    changeDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
        
        const difficultySettings = {
            'easy': { length: 4, attempts: 7 },
            'normal': { length: 5, attempts: 6 },
            'hard': { length: 6, attempts: 6 },
            'expert': { length: 7, attempts: 7 }
        };
        
        const settings = difficultySettings[newDifficulty];
        this.wordLength = settings.length;
        this.maxAttempts = settings.attempts;
        
        this.newGame();
    }
    
    toggleTimer(enabled) {
        if (enabled && this.gameState === 'playing') {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }
    
    toggleDarkMode(enabled) {
        document.body.setAttribute('data-theme', enabled ? 'dark' : 'light');
    }
    
    saveSettings() {
        const settings = {
            difficulty: this.difficulty,
            timeLimit: document.getElementById('time-limit-toggle').checked,
            darkMode: document.getElementById('dark-mode-toggle').checked,
            animations: document.getElementById('animation-toggle').checked,
            highContrast: document.getElementById('high-contrast-toggle').checked,
            screenReader: document.getElementById('screen-reader-toggle').checked
        };
        
        localStorage.setItem('vibewordle-settings', JSON.stringify(settings));
        this.showMessage('Settings saved! ⚙️');
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('vibewordle-settings') || '{}');
        
        if (settings.difficulty) {
            document.getElementById('difficulty-select').value = settings.difficulty;
            this.changeDifficulty(settings.difficulty);
        }
        
        if (settings.timeLimit !== undefined) {
            document.getElementById('time-limit-toggle').checked = settings.timeLimit;
        }
        
        if (settings.darkMode) {
            document.getElementById('dark-mode-toggle').checked = settings.darkMode;
            this.toggleDarkMode(settings.darkMode);
        }
        
        if (settings.animations !== undefined) {
            document.getElementById('animation-toggle').checked = settings.animations;
        }
        
        if (settings.highContrast) {
            document.getElementById('high-contrast-toggle').checked = settings.highContrast;
        }
        
        if (settings.screenReader) {
            document.getElementById('screen-reader-toggle').checked = settings.screenReader;
        }
    }
    
    // Statistics functions
    loadStats() {
        return JSON.parse(localStorage.getItem('vibewordle-stats') || JSON.stringify({
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0, 0],
            totalScore: 0,
            averageGuesses: 0
        }));
    }
    
    updateStats(won = null) {
        if (won !== null) {
            this.stats.gamesPlayed++;
            if (won) {
                this.stats.gamesWon++;
                this.stats.currentStreak++;
                this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
                this.stats.guessDistribution[this.currentRow]++;
            } else {
                this.stats.currentStreak = 0;
            }
            this.stats.totalScore = this.score;
            this.stats.averageGuesses = this.stats.gamesWon > 0 ? 
                this.stats.guessDistribution.reduce((sum, count, index) => sum + count * (index + 1), 0) / this.stats.gamesWon : 0;
        }
        
        // Update modal display
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('win-percentage').textContent = 
            this.stats.gamesPlayed > 0 ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0;
        document.getElementById('current-streak-stat').textContent = this.stats.currentStreak;
        document.getElementById('max-streak').textContent = this.stats.maxStreak;
        
        // Update guess distribution
        const maxCount = Math.max(...this.stats.guessDistribution);
        this.stats.guessDistribution.forEach((count, index) => {
            const bar = document.querySelector(`.distribution-row:nth-child(${index + 1}) .bar`);
            if (bar) {
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                bar.style.width = `${Math.max(percentage, 5)}%`;
                bar.textContent = count;
            }
        });
        
        // Save to localStorage
        localStorage.setItem('vibewordle-stats', JSON.stringify(this.stats));
    }
    
    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.stats = {
                gamesPlayed: 0,
                gamesWon: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0, 0, 0, 0, 0, 0, 0],
                totalScore: 0,
                averageGuesses: 0
            };
            this.score = 0;
            this.streak = 0;
            this.level = 1;
            
            localStorage.removeItem('vibewordle-stats');
            this.updateStats();
            this.updateDisplay();
            this.showMessage('Statistics reset! 📊');
        }
    }
    
    shareResult() {
        const gameResult = this.generateShareText();
        
        if (navigator.share) {
            navigator.share({
                title: 'VibeWordle Result',
                text: gameResult
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(gameResult).then(() => {
                this.showMessage('Result copied to clipboard! 📋');
            });
        } else {
            // Fallback: show result in modal
            prompt('Copy this result:', gameResult);
        }
    }
    
    generateShareText() {
        const won = this.gameState === 'won';
        const attempts = this.currentRow + (won ? 1 : 0);
        
        let result = `VibeWordle ${this.level} ${won ? attempts : 'X'}/${this.maxAttempts}\n`;
        result += `Difficulty: ${this.difficulty.toUpperCase()}\n`;
        result += `Score: ${this.score}\n\n`;
        
        // Add visual representation
        this.evaluations.forEach(evaluation => {
            evaluation.forEach(state => {
                if (state === 'correct') result += '🟩';
                else if (state === 'present') result += '🟨';
                else result += '⬛';
            });
            result += '\n';
        });
        
        return result;
    }
    
    // Dictionary management methods
    updateDictionaryStatus() {
        const statusElement = document.getElementById('dictionary-status');
        const refreshBtn = document.getElementById('refresh-dictionary-btn');
        
        if (!statusElement || !refreshBtn) return;
        
        const status = this.autoUpdater.getUpdateStatus();
        const lastUpdate = localStorage.getItem('vibewordle_last_update');
        
        if (status) {
            const timeSince = Date.now() - status.timestamp;
            const hours = Math.floor(timeSince / (1000 * 60 * 60));
            const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60));
            
            let statusText = '';
            let statusClass = '';
            
            switch (status.status) {
                case 'success':
                    if (hours < 1) {
                        statusText = `✅ Updated ${minutes}m ago (${status.wordCount} words)`;
                    } else if (hours < 24) {
                        statusText = `✅ Updated ${hours}h ago (${status.wordCount} words)`;
                    } else {
                        statusText = `⚠️ Last updated ${Math.floor(hours/24)}d ago`;
                        statusClass = 'status-warning';
                    }
                    statusClass = statusClass || 'status-success';
                    break;
                    
                case 'updating':
                    statusText = '🔄 Updating dictionary...';
                    statusClass = 'status-info';
                    refreshBtn.disabled = true;
                    break;
                    
                case 'error':
                    statusText = `❌ Update failed: ${status.message}`;
                    statusClass = 'status-error';
                    break;
                    
                default:
                    statusText = '📚 Using offline dictionary';
                    statusClass = 'status-info';
            }
            
            statusElement.textContent = statusText;
            statusElement.className = statusClass;
        } else {
            statusElement.textContent = '📚 Dictionary ready';
            statusElement.className = 'status-info';
        }
        
        // Setup refresh button
        refreshBtn.onclick = () => this.refreshDictionary();
    }
    
    async refreshDictionary() {
        const refreshBtn = document.getElementById('refresh-dictionary-btn');
        const statusElement = document.getElementById('dictionary-status');
        
        try {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '🔄 Updating...';
            statusElement.textContent = '🔄 Fetching fresh words...';
            statusElement.className = 'status-info';
            
            // Force update
            const newWords = await this.autoUpdater.forceUpdate();
            
            // Update dictionary
            this.dictionary = {
                all: new Set(newWords),
                5: newWords.filter(word => word.length === 5),
                4: newWords.filter(word => word.length === 4),
                6: newWords.filter(word => word.length === 6),
                7: newWords.filter(word => word.length === 7)
            };
            
            // Show success message
            this.showMessage(`📚 Dictionary updated! ${newWords.length} words available`, 3000);
            
            // Update status display
            this.updateDictionaryStatus();
            
        } catch (error) {
            console.error('Manual dictionary refresh failed:', error);
            this.showMessage('❌ Dictionary update failed. Using cached words.', 3000);
            
            statusElement.textContent = `❌ Update failed: ${error.message}`;
            statusElement.className = 'status-error';
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '🔄 Refresh Now';
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing VibeWordle');
    try {
        window.vibeWordleGame = new VibeWordle();
        console.log('VibeWordle game instance created successfully');
        
        // Make debug functions available
        window.testWordle = () => window.vibeWordleGame.testEvaluation();
        window.debugWordle = window.vibeWordleGame;
        window.checkCurrentGame = () => {
            console.log('=== CURRENT GAME STATE ===');
            console.log('Target word:', window.vibeWordleGame.targetWord);
            console.log('Current guesses:', window.vibeWordleGame.guesses);
            console.log('Evaluations:', window.vibeWordleGame.evaluations);
            console.log('Current row:', window.vibeWordleGame.currentRow);
            console.log('Game state:', window.vibeWordleGame.gameState);
        };
        
        // Update dictionary status after a short delay to ensure elements are ready
        setTimeout(() => {
            if (window.vibeWordleGame && window.vibeWordleGame.updateDictionaryStatus) {
                window.vibeWordleGame.updateDictionaryStatus();
                
                // Update status every 5 minutes
                setInterval(() => {
                    window.vibeWordleGame.updateDictionaryStatus();
                }, 5 * 60 * 1000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing VibeWordle:', error);
    }
});

// Fallback initialization
window.addEventListener('load', () => {
    if (!window.vibeWordleGame) {
        console.log('Fallback initialization triggered');
        try {
            window.vibeWordleGame = new VibeWordle();
        } catch (error) {
            console.error('Error in fallback initialization:', error);
        }
    }
});
