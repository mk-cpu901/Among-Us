// Task and Minigames

class Task {
    constructor(type, title) {
        this.type = type;
        this.title = title;
        this.completed = false;
    }
}

class Minigame {
    constructor(type) {
        this.type = type;
        this.active = false;
        this.progress = 0;
        this.completed = false;
    }

    update(keysPressed, mousePos) {
        // Override in subclasses
    }

    draw(ctx) {
        // Override in subclasses
    }

    reset() {
        this.progress = 0;
        this.completed = false;
    }
}

class FixWiringGame extends Minigame {
    constructor() {
        super(TASK_TYPES.FIX_WIRING);
        this.wires = [];
        this.selectedLeft = null;
        this.selectedRight = null;
        this.initializeWires();
    }

    initializeWires() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        const shuffled = [...colors].sort(() => Math.random() - 0.5);
        
        this.wires = colors.map((color, i) => ({
            color: color,
            leftX: 300,
            leftY: 200 + i * 50,
            rightX: 600,
            rightY: 200 + colors.indexOf(shuffled[i]) * 50,
            connected: false
        }));
    }

    update(keysPressed, mousePos) {
        // Check for wire connections
        if (mousePos) {
            for (let wire of this.wires) {
                const leftDist = Math.sqrt((mousePos.x - wire.leftX) ** 2 + (mousePos.y - wire.leftY) ** 2);
                if (leftDist < 20) this.selectedLeft = wire;

                const rightDist = Math.sqrt((mousePos.x - wire.rightX) ** 2 + (mousePos.y - wire.rightY) ** 2);
                if (rightDist < 20) this.selectedRight = wire;
            }
        }

        // Check if all wires are connected correctly
        const allConnected = this.wires.every(w => w.connected);
        if (allConnected) {
            this.completed = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(200, 150, 600, 400);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Fix Wiring', CANVAS.WIDTH / 2, 180);

        // Draw wires
        for (let wire of this.wires) {
            ctx.strokeStyle = wire.color;
            ctx.lineWidth = 3;

            // Left side
            ctx.beginPath();
            ctx.arc(wire.leftX, wire.leftY, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Right side
            ctx.beginPath();
            ctx.arc(wire.rightX, wire.rightY, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Connection line if connected
            if (wire.connected) {
                ctx.strokeStyle = wire.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(wire.leftX + 8, wire.leftY);
                ctx.lineTo(wire.rightX - 8, wire.rightY);
                ctx.stroke();
            }
        }

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('COMPLETED!', CANVAS.WIDTH / 2, 580);
        }
    }
}

class SwipeCardGame extends Minigame {
    constructor() {
        super(TASK_TYPES.SWIPE_CARD);
        this.clicksRequired = 3;
        this.clicksReceived = 0;
    }

    update(keysPressed, mousePos) {
        // Swipe card logic
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(250, 200, 500, 300);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Swipe Card', CANVAS.WIDTH / 2, 240);

        // Draw card
        ctx.fillStyle = '#1e90ff';
        ctx.fillRect(350, 300, 200, 120);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Click to Swipe', CANVAS.WIDTH / 2, 370);
        ctx.fillText(`${this.clicksReceived}/${this.clicksRequired}`, CANVAS.WIDTH / 2, 410);

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('COMPLETED!', CANVAS.WIDTH / 2, 480);
        }
    }
}

class StartReactorGame extends Minigame {
    constructor() {
        super(TASK_TYPES.START_REACTOR);
        this.sequence = [];
        this.playerSequence = [];
        this.generateSequence();
    }

    generateSequence() {
        this.sequence = [];
        for (let i = 0; i < 5; i++) {
            this.sequence.push(Math.floor(Math.random() * 4));
        }
    }

    update(keysPressed, mousePos) {
        // Memory game logic
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(150, 100, 800, 500);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Repeat the Sequence', CANVAS.WIDTH / 2, 150);

        // Draw buttons
        const buttons = [
            { color: '#ff0000', x: 250, y: 250 },
            { color: '#00ff00', x: 550, y: 250 },
            { color: '#0000ff', x: 250, y: 450 },
            { color: '#ffff00', x: 550, y: 450 }
        ];

        for (let btn of buttons) {
            ctx.fillStyle = btn.color;
            ctx.fillRect(btn.x, btn.y, 150, 150);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, 150, 150);
        }

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('COMPLETED!', CANVAS.WIDTH / 2, 620);
        }
    }
}

class DivertPowerGame extends Minigame {
    constructor() {
        super(TASK_TYPES.DIVERT_POWER);
        this.switches = [
            { state: false, x: 300, y: 300 },
            { state: false, x: 400, y: 300 },
            { state: false, x: 500, y: 300 },
            { state: false, x: 600, y: 300 }
        ];
        this.targetPattern = [true, false, true, false];
    }

    update(keysPressed, mousePos) {
        // Switch toggling logic
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(150, 150, 800, 400);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Divert Power', CANVAS.WIDTH / 2, 200);

        // Draw switches
        for (let i = 0; i < this.switches.length; i++) {
            const sw = this.switches[i];
            ctx.fillStyle = sw.state ? '#00ff00' : '#ff0000';
            ctx.fillRect(sw.x, sw.y, 50, 100);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(sw.x, sw.y, 50, 100);
        }

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('COMPLETED!', CANVAS.WIDTH / 2, 550);
        }
    }
}
