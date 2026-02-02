// UI Management
class UI {
    constructor() {
        this.lobbyScreen = document.getElementById('lobbyScreen');
        this.customizationScreen = document.getElementById('customizationScreen');
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

        // Customization elements
        this.backButton = document.getElementById('backButton');
        this.playButton = document.getElementById('playButton');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.colorGrid = document.getElementById('colorGrid');
        this.hatGrid = document.getElementById('hatGrid');
        this.petGrid = document.getElementById('petGrid');
        this.visorGrid = document.getElementById('visorGrid');

        // Player customization
        this.playerCustomization = {
            color: 'red',
            hat: 'none',
            pet: 'none',
            visorColor: 'cyan'
        };

        this.setupEventListeners();
        this.setupCustomization();
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

        this.backButton.addEventListener('click', () => this.showScreen('lobby'));
    }

    setupCustomization() {
        const colors = ['red', 'blue', 'green', 'pink', 'orange', 'yellow', 'black', 'white', 'purple', 'cyan', 'lime', 'maroon'];
        const hats = ['none', 'tophat', 'crown', 'flower', 'astronaut', 'military'];
        const pets = ['none', 'crewmate', 'dog', 'hamster', 'alien'];
        const visorColors = ['cyan', 'red', 'blue', 'green', 'yellow', 'purple'];

        // Color grid
        colors.forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option' + (color === this.playerCustomization.color ? ' selected' : '');
            option.style.backgroundColor = this.getColorCode(color);
            option.dataset.color = color;
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                this.playerCustomization.color = color;
                this.updatePreview();
            });
            this.colorGrid.appendChild(option);
        });

        // Hat grid
        hats.forEach(hat => {
            const option = document.createElement('div');
            option.className = 'hat-option' + (hat === this.playerCustomization.hat ? ' selected' : '');
            option.dataset.hat = hat;
            option.textContent = this.getHatEmoji(hat);
            option.addEventListener('click', () => {
                document.querySelectorAll('.hat-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                this.playerCustomization.hat = hat;
                this.updatePreview();
            });
            this.hatGrid.appendChild(option);
        });

        // Pet grid
        pets.forEach(pet => {
            const option = document.createElement('div');
            option.className = 'pet-option' + (pet === this.playerCustomization.pet ? ' selected' : '');
            option.dataset.pet = pet;
            option.textContent = this.getPetEmoji(pet);
            option.addEventListener('click', () => {
                document.querySelectorAll('.pet-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                this.playerCustomization.pet = pet;
                this.updatePreview();
            });
            this.petGrid.appendChild(option);
        });

        // Visor color grid
        visorColors.forEach(color => {
            const option = document.createElement('div');
            option.className = 'visor-option' + (color === this.playerCustomization.visorColor ? ' selected' : '');
            option.style.backgroundColor = this.getColorCode(color);
            option.dataset.visor = color;
            option.addEventListener('click', () => {
                document.querySelectorAll('.visor-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                this.playerCustomization.visorColor = color;
                this.updatePreview();
            });
            this.visorGrid.appendChild(option);
        });
    }

    getHatEmoji(hat) {
        const hats = {
            'none': '❌',
            'tophat': '🎩',
            'crown': '👑',
            'flower': '🌸',
            'astronaut': '🚀',
            'military': '⚔️'
        };
        return hats[hat] || '❌';
    }

    getPetEmoji(pet) {
        const pets = {
            'none': '❌',
            'crewmate': '👾',
            'dog': '🐕',
            'hamster': '🐹',
            'alien': '👽'
        };
        return pets[pet] || '❌';
    }

    getColorCode(color) {
        const colorMap = {
            red: '#ff0000',
            blue: '#0000ff',
            green: '#00ff00',
            pink: '#ff1493',
            orange: '#ff8c00',
            yellow: '#ffff00',
            black: '#000000',
            white: '#ffffff',
            purple: '#800080',
            cyan: '#00ffff',
            lime: '#32cd32',
            maroon: '#800000',
            navy: '#000080',
            olive: '#808000',
            teal: '#008080'
        };
        return colorMap[color] || '#ffffff';
    }

    updatePreview() {
        const ctx = this.previewCtx;
        ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        ctx.globalAlpha = 1;

        // Draw character
        const x = this.previewCanvas.width / 2;
        const y = 80;
        const colorCode = this.getColorCode(this.playerCustomization.color);
        const visorColor = this.getColorCode(this.playerCustomization.visorColor);

        // Bean body
        const bodyWidth = 20;
        const bodyHeight = 28;
        ctx.fillStyle = colorCode;
        ctx.beginPath();
        ctx.moveTo(x - bodyWidth / 2 + 6, y - bodyHeight / 2);
        ctx.lineTo(x + bodyWidth / 2 - 6, y - bodyHeight / 2);
        ctx.quadraticCurveTo(x + bodyWidth / 2, y - bodyHeight / 2, x + bodyWidth / 2, y - bodyHeight / 2 + 6);
        ctx.lineTo(x + bodyWidth / 2, y + bodyHeight / 2 - 6);
        ctx.quadraticCurveTo(x + bodyWidth / 2, y + bodyHeight / 2, x + bodyWidth / 2 - 6, y + bodyHeight / 2);
        ctx.lineTo(x - bodyWidth / 2 + 6, y + bodyHeight / 2);
        ctx.quadraticCurveTo(x - bodyWidth / 2, y + bodyHeight / 2, x - bodyWidth / 2, y + bodyHeight / 2 - 6);
        ctx.lineTo(x - bodyWidth / 2, y - bodyHeight / 2 + 6);
        ctx.quadraticCurveTo(x - bodyWidth / 2, y - bodyHeight / 2, x - bodyWidth / 2 + 6, y - bodyHeight / 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.ellipse(x, y - 7, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = visorColor;
        ctx.beginPath();
        ctx.ellipse(x - 4, y - 9, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Backpack
        ctx.fillStyle = '#666666';
        ctx.fillRect(x - 6, y + 10, 12, 10);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 6, y + 10, 12, 10);

        // Draw hat if selected
        if (this.playerCustomization.hat !== 'none') {
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.getHatEmoji(this.playerCustomization.hat), x, y - 25);
        }

        // Draw pet if selected
        if (this.playerCustomization.pet !== 'none') {
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.getPetEmoji(this.playerCustomization.pet), x + 25, y + 35);
        }
    }

    showScreen(screenName) {
        this.lobbyScreen.classList.remove('active');
        this.customizationScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.votingScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        switch (screenName) {
            case 'lobby':
                this.lobbyScreen.classList.add('active');
                break;
            case 'customization':
                this.customizationScreen.classList.add('active');
                this.updatePreview();
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

        // Show task list
        this.updateTaskList(game);
    }

    updateTaskList(game) {
        let taskHtml = '<div id="taskList" style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 10px; max-width: 250px; max-height: 400px; overflow-y: auto; border: 2px solid #00d4ff;">';
        taskHtml += '<div style="color: #00d4ff; font-weight: bold; margin-bottom: 10px;">📋 Your Tasks</div>';

        const myTasks = game.tasks.filter(t => t.assignedTo === game.currentPlayer.id);
        
        if (myTasks.length === 0) {
            taskHtml += '<div style="color: #aaa; font-size: 12px;">No tasks assigned</div>';
        } else {
            myTasks.forEach(task => {
                const icon = task.completed ? '✓' : '→';
                const color = task.completed ? '#00ff00' : '#fff';
                const cursor = task.completed ? 'default' : 'pointer';
                taskHtml += `<div style="color: ${color}; margin: 8px 0; font-size: 12px; cursor: ${cursor}; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;" onclick="window.startTaskMinigame(${task.id})">${icon} ${task.name}</div>`;
            });
        }

        taskHtml += '</div>';

        const existing = document.getElementById('taskList');
        if (existing) existing.remove();

        try {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.insertAdjacentHTML('beforeend', taskHtml);
            }
        } catch (error) {
            console.error('Error updating task list:', error);
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
