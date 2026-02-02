// Map and Room System

class MapManager {
    constructor() {
        this.rooms = MAP.ROOMS.map(r => ({ ...r }));
        this.vents = MAP.VENTS.map(v => ({ ...v }));
    }

    drawMap(ctx) {
        // Draw rooms
        for (let room of this.rooms) {
            ctx.fillStyle = 'rgba(100, 100, 150, 0.3)';
            ctx.fillRect(room.x, room.y, room.width, room.height);

            // Draw room border
            ctx.strokeStyle = '#1e90ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(room.x, room.y, room.width, room.height);

            // Draw room name
            ctx.fillStyle = '#1e90ff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(room.name, room.x + 5, room.y + 15);
        }

        // Draw vents
        for (let vent of this.vents) {
            ctx.fillStyle = '#ff9800';
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw vent outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw grid lines for reference
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS.WIDTH; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS.HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS.HEIGHT; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS.WIDTH, y);
            ctx.stroke();
        }
    }

    getVentAt(x, y, range = 30) {
        for (let vent of this.vents) {
            const dist = Math.sqrt((vent.x - x) ** 2 + (vent.y - y) ** 2);
            if (dist < range) return vent;
        }
        return null;
    }

    getConnectedVents(vent) {
        return this.vents.filter(v => 
            v !== vent && vent.connectedTo && vent.connectedTo.includes(v.room)
        );
    }

    getRoomAt(x, y) {
        for (let room of this.rooms) {
            if (x > room.x && x < room.x + room.width &&
                y > room.y && y < room.y + room.height) {
                return room;
            }
        }
        return null;
    }
}
