// Main Game Loop
let game = null;
let ui = null;
let canvas = null;
let ctx = null;
let lastTime = Date.now();
const keysPressed = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    ui = new UI();
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Start button
    ui.startButton.addEventListener('click', startGame);

    // Keyboard input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Emergency button
    ui.emergencyButton.addEventListener('click', () => {
        if (game) game.callEmergencyMeeting();
    });
});

function startGame() {
    const playerCount = parseInt(ui.playerCountInput.value);
    const impostorCount = parseInt(ui.impostorCountInput.value);

    game = new Game(playerCount, impostorCount);
    ui.showScreen('game');

    // Start game loop
    gameLoop();
}

function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    // Update
    if (game.gameState === 'playing') {
        game.update(deltaTime);
        handleMovement();
        ui.updateGameHUD(game);
    } else if (game.gameState === 'voting') {
        if (ui.votingScreen.style.display !== 'block') {
            ui.showScreen('voting');
            ui.updateVotingScreen(game);
        }
    } else if (game.gameState === 'gameOver') {
        ui.showScreen('gameOver');
        ui.showGameOver(game);
        return; // Stop loop
    }

    // Draw
    game.draw(ctx);

    requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    keysPressed[e.key.toLowerCase()] = true;

    // Special keys
    if (e.key === 'Escape') {
        if (confirm('Exit to lobby?')) {
            ui.showScreen('lobby');
            game = null;
        }
    }
    if (e.key === 'e' || e.key === 'E') {
        if (game) game.callEmergencyMeeting();
    }
    if (e.key === 'k' || e.key === 'K') {
        if (game && game.currentPlayer.role === 'impostor') {
            const target = game.players.find(p => p !== game.currentPlayer && !p.dead);
            if (target) game.killPlayer(target.id);
        }
    }
    if (e.key === 'v' || e.key === 'V') {
        if (game && game.currentPlayer.role === 'impostor') {
            game.ventPlayer();
        }
    }
}

function handleKeyUp(e) {
    keysPressed[e.key.toLowerCase()] = false;
}

function handleMovement() {
    const directions = [];
    if (keysPressed['w']) directions.push('up');
    if (keysPressed['a']) directions.push('left');
    if (keysPressed['s']) directions.push('down');
    if (keysPressed['d']) directions.push('right');

    if (directions.length === 0) {
        game.movePlayer('stop');
    } else {
        // Handle diagonal movement
        const lastPressed = Object.keys(keysPressed).filter(k => keysPressed[k] && ['w', 'a', 's', 'd'].includes(k)).pop();
        if (lastPressed === 'w') game.movePlayer('up');
        else if (lastPressed === 's') game.movePlayer('down');
        else if (lastPressed === 'a') game.movePlayer('left');
        else if (lastPressed === 'd') game.movePlayer('right');
    }
}

// Mobile touch controls
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touch is on a player
    for (let player of game.players) {
        const dist = Math.hypot(x - player.x, y - player.y);
        if (dist < 30 && game.currentPlayer.role === 'impostor') {
            game.killPlayer(player.id);
        }
    }
});

// Responsive canvas
window.addEventListener('resize', () => {
    const width = Math.min(window.innerWidth - 20, 1200);
    const height = Math.min(window.innerHeight - 100, 800);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
});
