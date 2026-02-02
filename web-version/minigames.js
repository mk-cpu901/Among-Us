// Minigames System
class Minigame {
    constructor(type) {
        this.type = type;
        this.completed = false;
        this.canvas = null;
        this.ctx = null;
    }

    static createGame(type) {
        switch (type) {
            case 'wiring':
                return new WiringGame();
            case 'card':
                return new CardGame();
            case 'reactor':
                return new ReactorGame();
            case 'power':
                return new PowerGame();
            default:
                return new WiringGame();
        }
    }

    setupCanvas() {
        const container = document.getElementById('minigameContainer');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'minigameContainer';
            div.style.position = 'fixed';
            div.style.top = '50%';
            div.style.left = '50%';
            div.style.transform = 'translate(-50%, -50%)';
            div.style.zIndex = '1000';
            document.body.appendChild(div);
        }
        this.container = document.getElementById('minigameContainer');
    }

    closeMinigame() {
        const container = document.getElementById('minigameContainer');
        if (container) container.innerHTML = '';
    }
}

// Fix Wiring Task
class WiringGame extends Minigame {
    constructor() {
        super('wiring');
        this.connections = [];
        this.correctConnections = [];
        this.leftColors = ['blue', 'yellow', 'red']; // Fixed order on left
        this.rightColors = ['red', 'yellow', 'blue']; // Will be scrambled on right
        this.setupConnections();
    }

    setupConnections() {
        // Scramble the right side colors
        this.rightColors = this.rightColors.sort(() => Math.random() - 0.5);
        
        // Create correct connections based on color matching
        // Left side is always: blue (0), yellow (1), red (2)
        // Right side colors are scrambled, so we need to find where each left color appears on right
        this.correctConnections = this.leftColors.map((leftColor, leftIndex) => ({
            left: leftIndex,
            right: this.rightColors.indexOf(leftColor)
        }));

        this.connections = Array(3).fill(null);
    }

    getColorCode(colorName) {
        const colors = {
            'blue': '#0066ff',
            'yellow': '#ffff00',
            'red': '#ff0000'
        };
        return colors[colorName] || '#ff0000';
    }

    show() {
        this.setupCanvas();
        
        const html = `
            <div style="background: rgba(0, 0, 0, 0.95); padding: 30px; border-radius: 15px; width: 500px; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
                <h2 style="color: #00d4ff; margin-bottom: 20px;">Fix Wiring</h2>
                <p style="color: #ccc; margin-bottom: 20px;">Connect the wires by matching the colors.</p>
                
                <div style="display: flex; justify-content: space-between; margin: 30px 0; position: relative; height: 200px;">
                    <!-- Left side -->
                    <div>
                        <div style="color: #00d4ff; margin-bottom: 10px; font-weight: bold;">Left</div>
                        ${this.leftColors.map((color, i) => `
                            <div id="left-${i}" class="wire-point" style="background: ${this.getColorCode(color)}; width: 20px; height: 20px; margin: 40px 0; border-radius: 50%; cursor: pointer; position: relative; z-index: 10; border: 2px solid #666;"></div>
                        `).join('')}
                    </div>
                    
                    <!-- Canvas for lines -->
                    <canvas id="wiringCanvas" width="300" height="200" style="position: absolute; left: 50px; top: 0;"></canvas>
                    
                    <!-- Right side -->
                    <div>
                        <div style="color: #00d4ff; margin-bottom: 10px; font-weight: bold;">Right</div>
                        ${this.rightColors.map((color, i) => `
                            <div id="right-${i}" class="wire-point" style="background: ${this.getColorCode(color)}; width: 20px; height: 20px; margin: 40px 0; border-radius: 50%; cursor: pointer; border: 2px solid #666;"></div>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="resetWiring" class="btn btn-secondary" style="flex: 1;">Reset</button>
                    <button id="completeWiring" class="btn btn-primary" style="flex: 1;">Submit</button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupWiringGame();
    }

    setupWiringGame() {
        let selected = null;

        document.querySelectorAll('.wire-point').forEach((point, index) => {
            point.addEventListener('click', () => {
                if (selected === null) {
                    selected = { side: point.id.split('-')[0], index: parseInt(point.id.split('-')[1]) };
                    point.style.boxShadow = '0 0 10px #00ff00';
                } else {
                    if (selected.side !== point.id.split('-')[0]) {
                        this.connections[selected.index] = parseInt(point.id.split('-')[1]);
                        this.redrawWiring();
                    }
                    document.querySelectorAll('.wire-point').forEach(p => p.style.boxShadow = 'none');
                    selected = null;
                }
            });
        });

        document.getElementById('resetWiring').addEventListener('click', () => {
            this.connections = Array(3).fill(null);
            document.querySelectorAll('.wire-point').forEach(p => p.style.boxShadow = 'none');
            this.redrawWiring();
        });

        document.getElementById('completeWiring').addEventListener('click', () => {
            this.checkCompletion();
        });

        this.redrawWiring();
    }

    redrawWiring() {
        const canvas = document.getElementById('wiringCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.connections.forEach((right, left) => {
            if (right !== null) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(10, 50 + left * 40);
                ctx.lineTo(290, 50 + right * 40);
                ctx.stroke();
            }
        });
    }

    checkCompletion() {
        const correct = this.correctConnections.every((conn, i) => this.connections[i] === conn.right);
        if (correct) {
            this.completed = true;
            this.closeMinigame();
            alert('✓ Wiring task completed!');
        } else {
            alert('✗ Incorrect connections. Try again!');
        }
    }
}

// Swipe Card Task
class CardGame extends Minigame {
    constructor() {
        super('card');
        this.taps = 0;
        this.required = 3;
    }

    show() {
        this.setupCanvas();

        const html = `
            <div style="background: rgba(0, 0, 0, 0.95); padding: 40px; border-radius: 15px; width: 400px; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
                <h2 style="color: #00d4ff; margin-bottom: 20px;">Swipe Card</h2>
                <p style="color: #ccc; margin-bottom: 40px;">Swipe the card ${this.required} times</p>
                
                <div id="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 300px; height: 180px; margin: 40px auto; border-radius: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; font-size: 32px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                    👆 SWIPE
                </div>

                <div style="margin: 30px 0; font-size: 24px; color: #00d4ff; font-weight: bold;">
                    ${this.taps}/${this.required}
                </div>

                <button id="resetCard" class="btn btn-secondary" style="width: 100%;">Reset</button>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupCardGame();
    }

    setupCardGame() {
        const card = document.getElementById('card');
        const counter = this.container.querySelector('div:nth-child(5)');

        card.addEventListener('click', () => {
            this.taps++;
            counter.textContent = `${this.taps}/${this.required}`;
            
            card.style.transform = 'scaleX(-1)';
            setTimeout(() => {
                card.style.transform = 'scaleX(1)';
            }, 200);

            if (this.taps >= this.required) {
                this.completed = true;
                setTimeout(() => {
                    this.closeMinigame();
                    alert('✓ Card swiped successfully!');
                }, 300);
            }
        });

        document.getElementById('resetCard').addEventListener('click', () => {
            this.taps = 0;
            counter.textContent = `${this.taps}/${this.required}`;
        });
    }
}

// Reactor Task (Memory Game)
class ReactorGame extends Minigame {
    constructor() {
        super('reactor');
        this.sequence = [0, 2, 1, 3, 0];
        this.playerSequence = [];
        this.currentIndex = 0;
    }

    show() {
        this.setupCanvas();

        const html = `
            <div style="background: rgba(0, 0, 0, 0.95); padding: 40px; border-radius: 15px; width: 400px; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
                <h2 style="color: #00d4ff; margin-bottom: 10px;">Start Reactor</h2>
                <p style="color: #ccc; margin-bottom: 30px;">Repeat the sequence shown</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; width: 300px; margin-left: auto; margin-right: auto;">
                    <div id="btn-0" class="reactor-btn" style="background: #ff0000; height: 100px; border-radius: 10px; cursor: pointer; transition: all 0.1s;"></div>
                    <div id="btn-1" class="reactor-btn" style="background: #ffff00; height: 100px; border-radius: 10px; cursor: pointer; transition: all 0.1s;"></div>
                    <div id="btn-2" class="reactor-btn" style="background: #0000ff; height: 100px; border-radius: 10px; cursor: pointer; transition: all 0.1s;"></div>
                    <div id="btn-3" class="reactor-btn" style="background: #00ff00; height: 100px; border-radius: 10px; cursor: pointer; transition: all 0.1s;"></div>
                </div>

                <div style="margin: 20px 0; font-size: 18px; color: #00d4ff; font-weight: bold;">
                    <div id="reactorStatus">Watch the sequence...</div>
                </div>

                <button id="startReactor" class="btn btn-primary" style="width: 100%;">Start</button>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupReactorGame();
    }

    setupReactorGame() {
        const buttons = document.querySelectorAll('.reactor-btn');
        const status = document.getElementById('reactorStatus');

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.playerSequence.push(index);
                this.flashButton(btn);
                this.checkSequence();
            });
        });

        document.getElementById('startReactor').addEventListener('click', () => {
            this.playSequence();
        });
    }

    playSequence() {
        const buttons = document.querySelectorAll('.reactor-btn');
        const status = document.getElementById('reactorStatus');
        
        status.textContent = 'Watch...';
        
        this.sequence.forEach((index, step) => {
            setTimeout(() => {
                this.flashButton(buttons[index]);
            }, (step + 1) * 500);
        });

        setTimeout(() => {
            status.textContent = 'Your turn...';
            this.playerSequence = [];
        }, this.sequence.length * 500 + 500);
    }

    flashButton(btn) {
        btn.style.opacity = '0.5';
        setTimeout(() => {
            btn.style.opacity = '1';
        }, 200);
    }

    checkSequence() {
        const status = document.getElementById('reactorStatus');
        
        if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
            status.textContent = 'Wrong! Try again...';
            setTimeout(() => this.playSequence(), 1000);
            this.playerSequence = [];
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.completed = true;
            status.textContent = '✓ Reactor started!';
            setTimeout(() => {
                this.closeMinigame();
                alert('✓ Reactor task completed!');
            }, 1000);
        }
    }
}

// Power Divert Task
class PowerGame extends Minigame {
    constructor() {
        super('power');
        this.switches = [false, false, false, false, false];
        this.targetState = [true, false, true, true, false];
    }

    show() {
        this.setupCanvas();

        const html = `
            <div style="background: rgba(0, 0, 0, 0.95); padding: 40px; border-radius: 15px; width: 450px; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
                <h2 style="color: #00d4ff; margin-bottom: 10px;">Divert Power</h2>
                <p style="color: #ccc; margin-bottom: 30px;">Match the left pattern with switches on the right</p>
                
                <div style="display: flex; justify-content: space-around; gap: 40px; margin: 40px 0;">
                    <!-- Target Pattern -->
                    <div>
                        <div style="color: #00d4ff; margin-bottom: 20px; font-weight: bold;">Target</div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${this.targetState.map((state, i) => `
                                <div style="width: 40px; height: 40px; background: ${state ? '#00ff00' : '#333'}; border-radius: 5px; border: 2px solid ${state ? '#00ff00' : '#666'};"></div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Switches -->
                    <div>
                        <div style="color: #00d4ff; margin-bottom: 20px; font-weight: bold;">Switches</div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${[0, 1, 2, 3, 4].map(i => `
                                <button id="switch-${i}" class="power-switch" style="width: 60px; height: 40px; background: #333; border: 2px solid #666; border-radius: 5px; cursor: pointer; color: #fff; font-weight: bold; transition: all 0.2s;">OFF</button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div style="margin: 30px 0; font-size: 18px; color: #00d4ff; font-weight: bold;">
                    <div id="powerStatus">Configure the switches</div>
                </div>

                <button id="completePower" class="btn btn-primary" style="width: 100%;">Submit</button>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupPowerGame();
    }

    setupPowerGame() {
        const switches = document.querySelectorAll('.power-switch');
        const status = document.getElementById('powerStatus');

        switches.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                this.switches[i] = !this.switches[i];
                btn.textContent = this.switches[i] ? 'ON' : 'OFF';
                btn.style.background = this.switches[i] ? '#00ff00' : '#333';
                btn.style.borderColor = this.switches[i] ? '#00ff00' : '#666';
            });
        });

        document.getElementById('completePower').addEventListener('click', () => {
            const correct = this.switches.every((state, i) => state === this.targetState[i]);
            if (correct) {
                this.completed = true;
                this.closeMinigame();
                alert('✓ Power diverted successfully!');
            } else {
                status.textContent = 'Incorrect! Try again...';
                status.style.color = '#ff0000';
            }
        });
    }
}
