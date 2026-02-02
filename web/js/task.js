// Task Management

class TaskManager {
    constructor(players) {
        this.players = players;
        this.taskTypes = [
            TASK_TYPES.FIX_WIRING,
            TASK_TYPES.SWIPE_CARD,
            TASK_TYPES.START_REACTOR,
            TASK_TYPES.DIVERT_POWER
        ];
        this.distributeTasks();
    }

    distributeTasks() {
        for (let player of this.players) {
            if (player.role === ROLES.CREWMATE) {
                const numTasks = 2 + Math.floor(Math.random() * 2); // 2-3 tasks
                for (let i = 0; i < numTasks; i++) {
                    const taskType = this.taskTypes[Math.floor(Math.random() * this.taskTypes.length)];
                    const task = new Task(taskType, this.getTaskTitle(taskType));
                    player.addTask(task);
                }
            }
        }
    }

    getTaskTitle(type) {
        const titles = {
            [TASK_TYPES.FIX_WIRING]: 'Fix Wiring',
            [TASK_TYPES.SWIPE_CARD]: 'Swipe Card',
            [TASK_TYPES.START_REACTOR]: 'Start Reactor',
            [TASK_TYPES.DIVERT_POWER]: 'Divert Power'
        };
        return titles[type] || 'Unknown Task';
    }

    getCrewmateTaskProgress() {
        let totalTasks = 0;
        let completedTasks = 0;

        for (let player of this.players) {
            if (player.role === ROLES.CREWMATE && player.isAlive) {
                totalTasks += player.tasks.length;
                completedTasks += player.completedTasks;
            }
        }

        return { totalTasks, completedTasks };
    }

    allTasksCompleted() {
        for (let player of this.players) {
            if (player.role === ROLES.CREWMATE) {
                if (!player.getAllTasksCompleted()) return false;
            }
        }
        return true;
    }

    draw(ctx, players) {
        ctx.fillStyle = '#1e90ff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Tasks:', 20, 30);

        let yPos = 60;
        for (let player of players) {
            if (player.role === ROLES.CREWMATE) {
                const completed = player.completedTasks;
                const total = player.tasks.length;
                ctx.fillStyle = player.color;
                ctx.font = '12px Arial';
                ctx.fillText(`${player.name}: ${completed}/${total}`, 20, yPos);
                yPos += 25;
            }
        }
    }
}
