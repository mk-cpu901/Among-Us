// Voting System

class VotingManager {
    constructor(players) {
        this.players = players;
        this.votes = new Map();
        this.resetVotes();
    }

    resetVotes() {
        this.votes.clear();
        for (let player of this.players) {
            if (player.isAlive) {
                this.votes.set(player.id, 0);
            }
        }
    }

    vote(voterId, targetId) {
        const voter = this.players.find(p => p.id === voterId);
        const target = this.players.find(p => p.id === targetId);
        
        if (voter && target && voter.isAlive && target.isAlive) {
            this.votes.set(targetId, (this.votes.get(targetId) || 0) + 1);
            return true;
        }
        return false;
    }

    skipVote() {
        // Counting as vote to skip
        return true;
    }

    getResults() {
        let maxVotes = 0;
        let mostVoted = [];

        for (let [playerId, voteCount] of this.votes) {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                mostVoted = [playerId];
            } else if (voteCount === maxVotes && voteCount > 0) {
                mostVoted.push(playerId);
            }
        }

        if (mostVoted.length === 0) {
            return { ejected: null, reason: 'no_votes' };
        } else if (mostVoted.length === 1) {
            return { ejected: mostVoted[0], reason: 'voted_out' };
        } else {
            // Tie - randomly select one
            const selected = mostVoted[Math.floor(Math.random() * mostVoted.length)];
            return { ejected: selected, reason: 'tie_vote' };
        }
    }

    ejectPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.isAlive = false;
            return player;
        }
        return null;
    }

    draw(ctx, players) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VOTING TIME', CANVAS.WIDTH / 2, 50);

        // Draw player vote counts
        let yPos = 120;
        const alivePlayersWithVotes = players.filter(p => p.isAlive);
        
        for (let player of alivePlayersWithVotes) {
            const voteCount = this.votes.get(player.id) || 0;
            ctx.fillStyle = player.color;
            ctx.fillText(`${player.name}: ${voteCount} votes`, CANVAS.WIDTH / 2, yPos);
            yPos += 50;
        }

        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.fillText('Most voted player will be ejected', CANVAS.WIDTH / 2, CANVAS.HEIGHT - 30);
    }
}
