// Player Class

class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.role = ROLES.CREWMATE;
        this.isAlive = true;
        this.x = 200;
        this.y = 150;
        this.width = 30;
        this.height = 40;
        this.speed = 4;
        this.velocityX = 0;
        this.velocityY = 0;
        this.tasks = [];
        this.completedTasks = 0;
        this.inVent = false;
        this.ventCooldown = 0;
        this.lastMeetingTime = 0;
    }

    update(keysPressed, deltaTime) {
        // Update cooldowns
        this.ventCooldown = Math.max(0, this.ventCooldown - deltaTime);

        // Handle input
        this.velocityX = 0;
        this.velocityY = 0;

        if (keysPressed['w'] || keysPressed['W']) this.velocityY = -this.speed;
        if (keysPressed['s'] || keysPressed['S']) this.velocityY = this.speed;
        if (keysPressed['a'] || keysPressed['A']) this.velocityX = -this.speed;
        if (keysPressed['d'] || keysPressed['D']) this.velocityX = this.speed;

        // Apply movement
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary checking
        this.x = Math.max(0, Math.min(this.x, CANVAS.WIDTH - this.width));
        this.y = Math.max(0, Math.min(this.y, CANVAS.HEIGHT - this.height));

        // Room collision detection
        this.checkRoomCollisions();
    }

    checkRoomCollisions() {
        // Keep player within rooms (simplified)
        for (let room of MAP.ROOMS) {
            if (this.isInRoom(room)) {
                return;
            }
        }
    }

    isInRoom(room) {
        return this.x > room.x && this.x < room.x + room.width &&
               this.y > room.y && this.y < room.y + room.height;
    }

    draw(ctx) {
        if (!this.isAlive) return;

        // Draw player body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height + 15);

        // Draw role indicator for impostors
        if (this.role === ROLES.IMPOSTOR) {
            ctx.fillStyle = '#ff1744';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('IMPOSTOR', this.x + this.width / 2, this.y - 10);
        }

        // Draw if in vent
        if (this.inVent) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
    }

    addTask(task) {
        this.tasks.push(task);
    }

    completeTask(taskIndex) {
        if (taskIndex < this.tasks.length) {
            this.tasks[taskIndex].completed = true;
            this.completedTasks++;
        }
    }

    getAllTasksCompleted() {
        return this.tasks.length > 0 && this.completedTasks === this.tasks.length;
    }

    distanceTo(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    canKill(targetPlayer) {
        return this.isAlive && 
               this.role === ROLES.IMPOSTOR && 
               targetPlayer.isAlive &&
               this.distanceTo(targetPlayer.x, targetPlayer.y) < 50;
    }

    canVent(vent) {
        return this.isAlive &&
               this.ventCooldown === 0 &&
               this.distanceTo(vent.x, vent.y) < 30;
    }

    kill(targetPlayer) {
        targetPlayer.isAlive = false;
    }

    teleportToVent(ventX, ventY) {
        this.x = ventX;
        this.y = ventY;
        this.ventCooldown = COOLDOWNS.VENT;
        this.inVent = true;
    }
}
