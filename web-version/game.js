// Game Engine
class Game {
    constructor(playerCount, impostorCount) {
        this.playerCount = playerCount;
        this.impostorCount = impostorCount;
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
            const player = new Player(
                i,
                `Player ${i + 1}`,
                colors[i],
                this.roles[i],
                Math.random() * (this.width - 100) + 50,
                Math.random() * (this.height - 100) + 50
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
        const roomColor = '#3a3a52';
        const roomBorder = '#00d4ff';

        // Draw rooms
        this.rooms.forEach(room => {
            ctx.fillStyle = roomColor;
            ctx.fillRect(room.x, room.y, room.w, room.h);
            ctx.strokeStyle = roomBorder;
            ctx.lineWidth = 2;
            ctx.strokeRect(room.x, room.y, room.w, room.h);

            // Draw room labels
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2 + 5);
        });

        // Draw vents
        const vents = [
            { x: 150, y: 130 },
            { x: 550, y: 130 },
            { x: 150, y: 500 },
            { x: 950, y: 430 },
            { x: 1100, y: 500 },
            { x: 1100, y: 400 },
        ];

        vents.forEach(vent => {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
}

// Player Class
class Player {
    constructor(id, name, color, role, x, y) {
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

        ctx.fillStyle = this.getColorCode();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.split(' ')[1] || this.name, this.x, this.y + this.radius + 20);

        if (this.dead) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y - 10);
            ctx.lineTo(this.x + 10, this.y + 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y - 10);
            ctx.lineTo(this.x - 10, this.y + 10);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
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
