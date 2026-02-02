// Main Game Loop
let game = null;
let ui = null;
let canvas = null;
let ctx = null;
let lastTime = Date.now();
const keysPressed = {};

// Task minigame handler
window.startTaskMinigame = (taskId) => {
    if (game && game.currentPlayer.role === 'crewmate') {
        game.startTask(taskId);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    ui = new UI();

    // Set canvas size - get reference but don't set context yet
    canvas = document.getElementById('gameCanvas');
    canvas.width = 1200;
    canvas.height = 800;

    // Start button - goes to customization
    ui.startButton.addEventListener('click', () => {
        ui.showScreen('customization');
    });

    // Play button - starts the game (now on home page)
    ui.playButton.addEventListener('click', startGame);

    // Keyboard input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Emergency button
    ui.emergencyButton.addEventListener('click', () => {
        if (game) game.callEmergencyMeeting();
    });
});

function startGame() {
    try {
        const playerCount = parseInt(ui.playerCountInput.value);
        const impostorCount = parseInt(ui.impostorCountInput.value);

        // Validate inputs
        if (!playerCount || !impostorCount || playerCount < 4 || impostorCount < 1) {
            alert('Invalid player or impostor count!');
            return;
        }

        // Get canvas context when starting game
        if (!canvas) {
            console.error('Canvas not found!');
            alert('Canvas not found!');
            return;
        }
        ctx = canvas.getContext('2d');

        console.log('Creating game with', playerCount, 'players and', impostorCount, 'impostors');
        game = new Game(playerCount, impostorCount, ui.playerCustomization);
        
        if (!game) {
            alert('Failed to create game!');
            return;
        }

        console.log('Game created successfully:', game);
        ui.showScreen('game');

        // Start game loop
        lastTime = Date.now();
        gameLoop();
    } catch (error) {
        console.error('Error starting game:', error);
        console.error('Error stack:', error.stack);
        alert('Error starting game: ' + error.message);
    }
}

function gameLoop() {
    try {
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
        if (ctx && game) {
            game.draw(ctx);
        }

        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
        requestAnimationFrame(gameLoop);
    }
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
