// Game Constants

const GAME_STATES = {
    LOBBY: 'lobby',
    LOADING: 'loading',
    PLAYING: 'playing',
    MEETING: 'meeting',
    VOTING: 'voting',
    GAME_OVER: 'gameOver'
};

const PLAYER_COLORS = {
    RED: '#ff0000',
    BLUE: '#0000ff',
    GREEN: '#00ff00',
    PINK: '#ff69b4',
    ORANGE: '#ffa500',
    YELLOW: '#ffff00',
    PURPLE: '#800080',
    CYAN: '#00ffff',
    LIME: '#00ff00',
    MAROON: '#800000'
};

const ROLES = {
    CREWMATE: 'crewmate',
    IMPOSTOR: 'impostor'
};

const TASK_TYPES = {
    FIX_WIRING: 'fixWiring',
    SWIPE_CARD: 'swipeCard',
    START_REACTOR: 'startReactor',
    DIVERT_POWER: 'divertPower'
};

const COOLDOWNS = {
    KILL: 25000,      // 25 seconds
    VENT: 10000,      // 10 seconds
    MEETING: 45000    // 45 seconds
};

const MAP = {
    ROOMS: [
        { name: 'Cafeteria', x: 100, y: 100, width: 150, height: 120 },
        { name: 'Upper Engine', x: 280, y: 80, width: 120, height: 100 },
        { name: 'Reactor', x: 280, y: 200, width: 120, height: 100 },
        { name: 'Security', x: 450, y: 100, width: 120, height: 100 },
        { name: 'Electrical', x: 450, y: 220, width: 120, height: 100 },
        { name: 'Medbay', x: 600, y: 100, width: 120, height: 100 },
        { name: 'Communications', x: 600, y: 220, width: 120, height: 100 },
        { name: 'Storage', x: 100, y: 280, width: 120, height: 100 },
        { name: 'Weapons', x: 280, y: 380, width: 120, height: 100 }
    ],
    VENTS: [
        { room: 'Cafeteria', x: 110, y: 110, connectedTo: ['Upper Engine', 'Storage'] },
        { room: 'Upper Engine', x: 290, y: 90, connectedTo: ['Cafeteria', 'Reactor'] },
        { room: 'Reactor', x: 290, y: 210, connectedTo: ['Upper Engine', 'Security'] },
        { room: 'Security', x: 460, y: 110, connectedTo: ['Reactor', 'Electrical'] },
        { room: 'Electrical', x: 460, y: 230, connectedTo: ['Security', 'Storage'] },
        { room: 'Storage', x: 110, y: 290, connectedTo: ['Cafeteria', 'Electrical'] }
    ]
};

const CANVAS = {
    WIDTH: 1280,
    HEIGHT: 720
};
