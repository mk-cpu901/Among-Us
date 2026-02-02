// Game Engine
class Game {
    constructor(playerCount, impostorCount, playerCustomization = {}) {
        this.playerCount = playerCount;
        this.impostorCount = impostorCount;
        this.playerCustomization = playerCustomization;
        this.players = [];
        this.currentPlayer = null;
        this.gameState = 'playing'; // playing, voting, gameOver
        this.roles = [];
        this.tasks = [];
        this.impostorKillCooldown = 0;
        this.impostorVentCooldown = 0;
        this.emergencyMeetingCooldown = 0;
        this.time = 0;
        this.width = 1200;
        this.height = 800;
        
        this.initialize();
    }

    initialize() {
        this.setupRooms();
        this.assignRoles();
        this.createPlayers();
        this.generateTasks();
    }

    setupRooms() {
        this.rooms = [
            { name: 'Cafeteria', x: 50, y: 400, w: 300, h: 200 },
            { name: 'Admin', x: 450, y: 450, w: 150, h: 150 },
            { name: 'Electrical', x: 50, y: 50, w: 200, h: 150 },
            { name: 'MedBay', x: 450, y: 50, w: 250, h: 150 },
            { name: 'Reactor', x: 850, y: 350, w: 200, h: 150 },
            { name: 'Security', x: 850, y: 150, w: 150, h: 150 },
            { name: 'Navigation', x: 1050, y: 150, w: 120, h: 150 },
            { name: 'Engine', x: 1050, y: 450, w: 120, h: 120 },
        ];
    }

    isPositionValid(x, y, radius) {
        // Check if player can be at this position without hitting walls
        for (let room of this.rooms) {
            // Check if player is inside or overlapping with a room
            if (x + radius > room.x && x - radius < room.x + room.w &&
                y + radius > room.y && y - radius < room.y + room.h) {
                return true;
            }
        }
        return false;
    }

    assignRoles() {
        const roles = Array(this.playerCount).fill('crewmate');
        const indices = [];
        for (let i = 0; i < this.impostorCount; i++) {
            let idx;
            do {
                idx = Math.floor(Math.random() * this.playerCount);
            } while (indices.includes(idx));
            indices.push(idx);
            roles[idx] = 'impostor';
        }
        this.roles = roles;
    }

    createPlayers() {
        const colors = ['red', 'blue', 'green', 'pink', 'orange', 'yellow', 'black', 'white', 'purple', 'cyan', 'lime', 'maroon', 'navy', 'olive', 'teal'];
        
        for (let i = 0; i < this.playerCount; i++) {
            // Use player customization for the first player, random for others
            const customization = i === 0 ? this.playerCustomization : {
                hat: 'none',
                pet: 'none',
                visorColor: 'cyan'
            };
            
            const player = new Player(
                i,
                `Player ${i + 1}`,
                colors[i],
                this.roles[i],
                Math.random() * (this.width - 100) + 50,
                Math.random() * (this.height - 100) + 50,
                customization
            );
            this.players.push(player);
            if (i === 0) this.currentPlayer = player;
        }
    }

    generateTasks() {
        const taskTypes = ['wiring', 'card', 'reactor', 'power'];
        const taskCount = Math.ceil(this.playerCount * 2);
        this.tasks = [];
        
        for (let i = 0; i < taskCount; i++) {
            const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
            const assignedTo = i % this.playerCount;
            this.tasks.push({
                id: i,
                type: taskType,
                name: this.getTaskName(taskType),
                completed: false,
                assignedTo: assignedTo,
                active: false,
                minigame: null
            });
        }
    }

    getTaskName(type) {
        const names = {
            wiring: 'Fix Wiring',
            card: 'Swipe Card',
            reactor: 'Start Reactor',
            power: 'Divert Power'
        };
        return names[type] || 'Unknown Task';
    }

    startTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.assignedTo === this.currentPlayer.id && !task.completed) {
            task.active = true;
            task.minigame = Minigame.createGame(task.type);
            task.minigame.show();
        }
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.minigame && task.minigame.completed) {
            task.completed = true;
            task.active = false;
            return true;
        }
        return false;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.impostorKillCooldown = Math.max(0, this.impostorKillCooldown - deltaTime);
        this.impostorVentCooldown = Math.max(0, this.impostorVentCooldown - deltaTime);
        this.emergencyMeetingCooldown = Math.max(0, this.emergencyMeetingCooldown - deltaTime);

        // Update players
        for (let player of this.players) {
            if (!player.dead) {
                player.update(deltaTime, this.width, this.height, this);
            }
        }

        // Check win conditions
        this.checkWinConditions();
    }

    movePlayer(direction) {
        if (this.currentPlayer) {
            this.currentPlayer.move(direction);
        }
    }

    callEmergencyMeeting() {
        if (this.emergencyMeetingCooldown === 0) {
            this.gameState = 'voting';
            this.emergencyMeetingCooldown = 60;
        }
    }

    killPlayer(playerId) {
        if (this.currentPlayer.role === 'impostor' && this.impostorKillCooldown === 0) {
            const target = this.players.find(p => p.id === playerId);
            if (target && !target.dead) {
                const distance = Math.hypot(
                    this.currentPlayer.x - target.x,
                    this.currentPlayer.y - target.y
                );
                if (distance < 50) {
                    target.dead = true;
                    this.impostorKillCooldown = 25;
                }
            }
        }
    }

    ventPlayer() {
        if (this.currentPlayer.role === 'impostor' && this.impostorVentCooldown === 0) {
            // Simple teleport to random location
            this.currentPlayer.x = Math.random() * (this.width - 100) + 50;
            this.currentPlayer.y = Math.random() * (this.height - 100) + 50;
            this.impostorVentCooldown = 10;
        }
    }

    votePlayer(targetId) {
        const target = this.players.find(p => p.id === targetId);
        if (target) {
            target.dead = true;
            this.gameState = 'playing';
        }
    }

    checkWinConditions() {
        const impostorsAlive = this.players.filter(p => p.role === 'impostor' && !p.dead).length;
        const crewmatesAlive = this.players.filter(p => p.role === 'crewmate' && !p.dead).length;
        const tasksCompleted = this.tasks.filter(t => t.completed).length;

        if (impostorsAlive === 0) {
            this.endGame('crewmates');
        } else if (impostorsAlive >= crewmatesAlive) {
            this.endGame('impostors');
        } else if (tasksCompleted === this.tasks.length) {
            this.endGame('crewmates');
        }
    }

    endGame(winner) {
        this.gameState = 'gameOver';
        this.winner = winner;
    }

    draw(ctx) {
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Skeld map
        this.drawSkeldMap(ctx);

        // Draw players
        for (let player of this.players) {
            player.draw(ctx);
        }

        // Draw current player highlight
        if (this.currentPlayer) {
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.currentPlayer.x, this.currentPlayer.y, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawSkeldMap(ctx) {
        // Room colors
        const roomColor = '#2a4a5a';
        const roomBorder = '#1a7a9a';
        const wallColor = '#0a3a4a';

        // Draw rooms
        this.rooms.forEach(room => {
            ctx.fillStyle = roomColor;
            ctx.fillRect(room.x, room.y, room.w, room.h);
            ctx.strokeStyle = roomBorder;
            ctx.lineWidth = 3;
            ctx.strokeRect(room.x, room.y, room.w, room.h);

            // Draw room labels
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2 + 5);
        });

        // Draw walls with visible line
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        
        // Add visual walls between rooms
        const walls = [
            { x1: 350, y1: 0, x2: 350, y2: 400 },      // Between Electrical and MedBay
            { x1: 350, y1: 600, x2: 350, y2: 800 },    // Between Electrical and Cafeteria
            { x1: 600, y1: 200, x2: 600, y2: 600 },    // Between Admin and other rooms
            { x1: 0, y1: 200, x2: 50, y2: 200 },       // Wall segment
            { x1: 850, y1: 0, x2: 850, y2: 150 },      // Between top rooms
            { x1: 1000, y1: 300, x2: 1000, y2: 450 },  // Between Reactor and other rooms
        ];

        walls.forEach(wall => {
            ctx.beginPath();
            ctx.moveTo(wall.x1, wall.y1);
            ctx.lineTo(wall.x2, wall.y2);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Draw task locations (white squares)
        const tasks = [
            { x: 100, y: 80 },    // Electrical
            { x: 500, y: 100 },   // MedBay
            { x: 150, y: 450 },   // Cafeteria
            { x: 500, y: 500 },   // Admin
            { x: 900, y: 400 },   // Reactor
            { x: 900, y: 180 },   // Security
        ];

        tasks.forEach(task => {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(task.x - 8, task.y - 8, 16, 16);
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(task.x - 8, task.y - 8, 16, 16);
        });

        // Draw vents with more detail
        const vents = [
            { x: 150, y: 130 },
            { x: 550, y: 130 },
            { x: 150, y: 500 },
            { x: 950, y: 430 },
            { x: 1100, y: 500 },
            { x: 1100, y: 400 },
        ];

        vents.forEach(vent => {
            // Outer circle
            ctx.fillStyle = '#004400';
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 12, 0, Math.PI * 2);
            ctx.fill();
            // Inner circle
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
            ctx.fill();
            // Border
            ctx.strokeStyle = '#00aa00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 10, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw emergency button
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(200, 500, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffaaaa';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Player Class
class Player {
    constructor(id, name, color, role, x, y, customization = {}) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.role = role;
        this.x = x;
        this.y = y;
        this.dead = false;
        this.velocity = { x: 0, y: 0 };
        this.speed = 3;
        this.radius = 15;
        this.customization = {
            hat: customization.hat || 'none',
            pet: customization.pet || 'none',
            visorColor: customization.visorColor || 'cyan'
        };
    }
    }

    move(direction) {
        const speed = this.speed;
        switch (direction) {
            case 'up': this.velocity.y = -speed; break;
            case 'down': this.velocity.y = speed; break;
            case 'left': this.velocity.x = -speed; break;
            case 'right': this.velocity.x = speed; break;
            case 'stop': this.velocity = { x: 0, y: 0 }; break;
        }
    }

    update(deltaTime, width, height, game) {
        const newX = this.x + this.velocity.x;
        const newY = this.y + this.velocity.y;

        // Check collision with walls - only allow movement if new position is valid
        if (game && game.isPositionValid(newX, newY, this.radius)) {
            this.x = newX;
            this.y = newY;
        } else if (!game) {
            // Fallback if game object not provided
            this.x = newX;
            this.y = newY;
        }

        // Boundary check
        this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
    }

    draw(ctx) {
        if (this.dead) {
            ctx.globalAlpha = 0.5;
        }

        // Draw Among Us character
        this.drawAmongUsCharacter(ctx, this.x, this.y, this.getColorCode());

        // Draw name
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.split(' ')[1] || this.name, this.x, this.y + this.radius + 25);

        if (this.dead) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - 15, this.y - 15);
            ctx.lineTo(this.x + 15, this.y + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + 15, this.y - 15);
            ctx.lineTo(this.x - 15, this.y + 15);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    drawAmongUsCharacter(ctx, x, y, colorCode) {
        // Draw bean-shaped body (capsule)
        const bodyWidth = 16;
        const bodyHeight = 22;

        // Main body - rounded rectangle
        ctx.fillStyle = colorCode;
        ctx.beginPath();
        ctx.moveTo(x - bodyWidth / 2 + 5, y - bodyHeight / 2);
        ctx.lineTo(x + bodyWidth / 2 - 5, y - bodyHeight / 2);
        ctx.quadraticCurveTo(x + bodyWidth / 2, y - bodyHeight / 2, x + bodyWidth / 2, y - bodyHeight / 2 + 5);
        ctx.lineTo(x + bodyWidth / 2, y + bodyHeight / 2 - 5);
        ctx.quadraticCurveTo(x + bodyWidth / 2, y + bodyHeight / 2, x + bodyWidth / 2 - 5, y + bodyHeight / 2);
        ctx.lineTo(x - bodyWidth / 2 + 5, y + bodyHeight / 2);
        ctx.quadraticCurveTo(x - bodyWidth / 2, y + bodyHeight / 2, x - bodyWidth / 2, y + bodyHeight / 2 - 5);
        ctx.lineTo(x - bodyWidth / 2, y - bodyHeight / 2 + 5);
        ctx.quadraticCurveTo(x - bodyWidth / 2, y - bodyHeight / 2, x - bodyWidth / 2 + 5, y - bodyHeight / 2);
        ctx.fill();

        // Draw visor/helmet
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.ellipse(x, y - 6, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Visor shine/glass - use customization visor color
        const visorColorMap = {
            cyan: '#00ccff',
            red: '#ff6666',
            blue: '#6666ff',
            green: '#66ff66',
            yellow: '#ffff66',
            purple: '#ff66ff'
        };
        const visorColor = visorColorMap[this.customization.visorColor] || '#00ccff';
        ctx.fillStyle = visorColor;
        ctx.beginPath();
        ctx.ellipse(x - 3, y - 8, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Backpack (simple rectangle)
        ctx.fillStyle = '#666666';
        ctx.fillRect(x - 5, y + 8, 10, 8);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 5, y + 8, 10, 8);

        // Draw hat if selected
        if (this.customization.hat !== 'none') {
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            const hatEmoji = this.getHatEmoji(this.customization.hat);
            ctx.fillText(hatEmoji, x, y - 20);
        }

        // Draw pet if selected
        if (this.customization.pet !== 'none') {
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            const petEmoji = this.getPetEmoji(this.customization.pet);
            ctx.fillText(petEmoji, x + 15, y + 10);
        }

        // Border around character
        ctx.strokeStyle = colorCode;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, bodyWidth / 2 + 2, bodyHeight / 2 + 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    getHatEmoji(hat) {
        const hats = {
            'none': '',
            'tophat': '🎩',
            'crown': '👑',
            'flower': '🌸',
            'astronaut': '🚀',
            'military': '⚔️'
        };
        return hats[hat] || '';
    }

    getPetEmoji(pet) {
        const pets = {
            'none': '',
            'crewmate': '👾',
            'dog': '🐕',
            'hamster': '🐹',
            'alien': '👽'
        };
        return pets[pet] || '';
    }

    getColorCode() {
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
        return colorMap[this.color] || '#ffffff';
    }
}

// Task Class
class Task {
    constructor(type, assignedTo) {
        this.type = type;
        this.assignedTo = assignedTo;
        this.completed = false;
    }
}
