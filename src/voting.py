class VoteManager:
    def __init__(self):
        self.votes = {}  # {voter_id: voted_player_id}
        self.vote_counts = {}  # {player_id: count}
        self.voting_active = False

    def start_voting(self, players):
        """Start voting phase"""
        self.votes.clear()
        self.vote_counts = {player_id: 0 for player_id in players.keys()}
        self.voting_active = True

    def vote(self, voter_id, voted_id):
        """Register a vote"""
        if not self.voting_active:
            return False
        
        # Player can change their vote
        self.votes[voter_id] = voted_id
        
        # Recalculate vote counts
        self.vote_counts = {player_id: 0 for player_id in self.vote_counts.keys()}
        for voted_id in self.votes.values():
            if voted_id in self.vote_counts:
                self.vote_counts[voted_id] += 1
        
        return True

    def end_voting(self):
        """End voting and determine who gets ejected"""
        self.voting_active = False
        
        if not self.vote_counts:
            return None
        
        # Find player with most votes
        max_votes = max(self.vote_counts.values())
        
        if max_votes == 0:
            return None  # No one was voted
        
        # Get all players with max votes (tie)
        tied_players = [pid for pid, count in self.vote_counts.items() if count == max_votes]
        
        if len(tied_players) > 1:
            return tied_players  # Return list if tie
        
        return tied_players[0]  # Return single player ID

    def skip_voting(self):
        """Skip voting phase"""
        self.voting_active = False
        return None

    def get_vote_counts(self):
        """Get current vote counts"""
        return self.vote_counts.copy()

    def has_all_voted(self, player_ids):
        """Check if all players have voted"""
        return len(self.votes) == len(player_ids)
