// UI Management
class UI {
    constructor() {
        this.lobbyScreen = document.getElementById('lobbyScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.votingScreen = document.getElementById('votingScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');

        this.playerCountInput = document.getElementById('playerCount');
        this.impostorCountInput = document.getElementById('impostorCount');
        this.playerLabel = document.getElementById('playerLabel');
        this.impostorLabel = document.getElementById('impostorLabel');
        this.startButton = document.getElementById('startButton');
        this.emergencyButton = document.getElementById('emergencyButton');
        this.skipVoteButton = document.getElementById('skipVoteButton');
        this.playAgainButton = document.getElementById('playAgainButton');

        this.roleDisplay = document.getElementById('roleDisplay');
        this.tasksDisplay = document.getElementById('tasksDisplay');
        this.gameStatus = document.getElementById('gameStatus');
        this.playersAlive = document.getElementById('playersAlive');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.statsDisplay = document.getElementById('statsDisplay');
        this.votingPlayers = document.getElementById('votingPlayers');
        this.votingTimer = document.getElementById('votingTimer');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.playerCountInput.addEventListener('input', (e) => {
            const value = Math.max(4, Math.min(15, parseInt(e.target.value) || 4));
            e.target.value = value;
            this.playerLabel.textContent = value;
        });

        this.impostorCountInput.addEventListener('input', (e) => {
            const value = Math.max(1, Math.min(3, parseInt(e.target.value) || 1));
            e.target.value = value;
            this.impostorLabel.textContent = value;
        });
    }

    showScreen(screenName) {
        this.lobbyScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.votingScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        switch (screenName) {
            case 'lobby':
                this.lobbyScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'voting':
                this.votingScreen.classList.add('active');
                break;
            case 'gameOver':
                this.gameOverScreen.classList.add('active');
                break;
        }
    }

    updateGameHUD(game) {
        const role = game.currentPlayer.role.charAt(0).toUpperCase() + game.currentPlayer.role.slice(1);
        this.roleDisplay.querySelector('span').textContent = role;

        const completedTasks = game.tasks.filter(t => t.completed).length;
        this.tasksDisplay.querySelector('span').textContent = `${completedTasks}/${game.tasks.length}`;

        const playersAlive = game.players.filter(p => !p.dead).length;
        this.playersAlive.querySelector('span').textContent = playersAlive;

        const impostorsAlive = game.players.filter(p => p.role === 'impostor' && !p.dead).length;
        const crewmatesAlive = game.players.filter(p => p.role === 'crewmate' && !p.dead).length;

        if (impostorsAlive > 0 && crewmatesAlive > 0) {
            this.gameStatus.textContent = `Impostors: ${impostorsAlive} | Crewmates: ${crewmatesAlive}`;
        }
    }

    updateVotingScreen(game) {
        this.votingPlayers.innerHTML = '';
        
        game.players.forEach(player => {
            if (!player.dead) {
                const button = document.createElement('button');
                button.className = 'player-vote';
                button.innerHTML = `<div>${player.name}</div><div style="font-size: 12px;">${player.color}</div>`;
                button.onclick = () => {
                    game.votePlayer(player.id);
                    this.showScreen('game');
                };
                this.votingPlayers.appendChild(button);
            }
        });

        this.skipVoteButton.onclick = () => {
            game.gameState = 'playing';
            this.showScreen('game');
        };
    }

    showGameOver(game) {
        const winner = game.winner === 'impostors' ? 'IMPOSTORS WIN! 👽' : 'CREWMATES WIN! ✓';
        this.gameOverTitle.textContent = winner;

        const impostors = game.players.filter(p => p.role === 'impostor').map(p => p.name).join(', ');
        this.gameOverMessage.innerHTML = `<p>Impostors were: ${impostors}</p>`;

        const stats = `
            <div><strong>Players:</strong> ${game.playerCount}</div>
            <div><strong>Impostors:</strong> ${game.impostorCount}</div>
            <div><strong>Your Role:</strong> ${game.currentPlayer.role}</div>
            <div><strong>Survivors:</strong> ${game.players.filter(p => !p.dead).length}</div>
            <div><strong>Tasks Completed:</strong> ${game.tasks.filter(t => t.completed).length}/${game.tasks.length}</div>
        `;
        this.statsDisplay.innerHTML = stats;

        this.playAgainButton.onclick = () => location.reload();
    }
}
