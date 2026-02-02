import os

class SoundManager:
    def __init__(self, enable_sound=True):
        self.enable_sound = enable_sound
        self.sounds = {}
        self.music = None
        self.master_volume = 0.7
        
        if enable_sound:
            try:
                import pygame
                pygame.mixer.init()
                self.load_sounds()
            except:
                self.enable_sound = False
                print("Sound system not available")

    def load_sounds(self):
        """Load sound effects"""
        # Dictionary of sound files (will create placeholder if not found)
        sound_files = {
            'kill': 'assets/kill.wav',
            'vent': 'assets/vent.wav',
            'vote': 'assets/vote.wav',
            'task_complete': 'assets/task_complete.wav',
            'eject': 'assets/eject.wav',
            'emergency': 'assets/emergency.wav',
            'button_click': 'assets/button_click.wav',
        }
        
        for sound_name, file_path in sound_files.items():
            try:
                if os.path.exists(file_path):
                    import pygame
                    self.sounds[sound_name] = pygame.mixer.Sound(file_path)
            except:
                pass  # Sound file not found

    def play_sound(self, sound_name):
        """Play a sound effect"""
        if not self.enable_sound or sound_name not in self.sounds:
            return
        
        try:
            sound = self.sounds[sound_name]
            sound.set_volume(self.master_volume)
            sound.play()
        except:
            pass

    def load_music(self, file_path):
        """Load background music"""
        if not self.enable_sound:
            return
        
        try:
            import pygame
            if os.path.exists(file_path):
                pygame.mixer.music.load(file_path)
        except:
            pass

    def play_music(self, loops=-1):
        """Play background music"""
        if not self.enable_sound:
            return
        
        try:
            import pygame
            pygame.mixer.music.play(loops)
            pygame.mixer.music.set_volume(self.master_volume * 0.5)
        except:
            pass

    def stop_music(self):
        """Stop background music"""
        if self.enable_sound:
            try:
                import pygame
                pygame.mixer.music.stop()
            except:
                pass

    def set_volume(self, volume):
        """Set master volume (0.0 to 1.0)"""
        self.master_volume = max(0.0, min(1.0, volume))

class ChatManager:
    def __init__(self, max_messages=50):
        self.messages = []
        self.max_messages = max_messages
        self.chat_history = []

    def add_message(self, player_name, player_id, message):
        """Add a chat message"""
        msg = {
            'player_name': player_name,
            'player_id': player_id,
            'text': message,
            'timestamp': None
        }
        self.messages.append(msg)
        self.chat_history.append(msg)
        
        # Keep only recent messages
        if len(self.messages) > self.max_messages:
            self.messages.pop(0)

    def get_messages(self):
        """Get all current messages"""
        return self.messages.copy()

    def clear_messages(self):
        """Clear message buffer (used for discussion phase)"""
        self.messages.clear()

    def get_history(self):
        """Get full chat history"""
        return self.chat_history.copy()

    def disable_chat(self):
        """Disable chat (during voting, etc)"""
        pass

    def enable_chat(self):
        """Enable chat"""
        pass

    def draw_messages(self, screen, x=10, y=600):
        """Draw chat messages on screen"""
        font = pygame.font.Font(None, 16)
        
        for i, msg in enumerate(self.messages[-5:]):  # Show last 5 messages
            text = font.render(f"{msg['player_name']}: {msg['text']}", True, (200, 200, 200))
            screen.blit(text, (x, y - (i * 20)))

class StatisticsTracker:
    def __init__(self):
        self.player_stats = {}  # {player_id: stats}
        self.game_stats = {}

    def create_player_stat(self, player_id, player_name):
        """Create a stat entry for a player"""
        self.player_stats[player_id] = {
            'name': player_name,
            'games_played': 0,
            'games_won': 0,
            'games_as_crewmate': 0,
            'games_as_impostor': 0,
            'kills': 0,
            'tasks_completed': 0,
            'votes_cast': 0,
            'times_ejected': 0,
            'win_rate': 0.0,
        }

    def add_game_win(self, player_id, as_role):
        """Record a game win"""
        if player_id not in self.player_stats:
            return
        
        stats = self.player_stats[player_id]
        stats['games_played'] += 1
        stats['games_won'] += 1
        
        if as_role == "CREWMATE":
            stats['games_as_crewmate'] += 1
        else:
            stats['games_as_impostor'] += 1
        
        stats['win_rate'] = stats['games_won'] / stats['games_played']

    def add_game_loss(self, player_id, as_role):
        """Record a game loss"""
        if player_id not in self.player_stats:
            return
        
        stats = self.player_stats[player_id]
        stats['games_played'] += 1
        
        if as_role == "CREWMATE":
            stats['games_as_crewmate'] += 1
        else:
            stats['games_as_impostor'] += 1
        
        stats['win_rate'] = stats['games_won'] / stats['games_played'] if stats['games_played'] > 0 else 0

    def record_kill(self, impostor_id):
        """Record a kill"""
        if impostor_id in self.player_stats:
            self.player_stats[impostor_id]['kills'] += 1

    def record_task_completion(self, player_id):
        """Record task completion"""
        if player_id in self.player_stats:
            self.player_stats[player_id]['tasks_completed'] += 1

    def record_vote(self, player_id):
        """Record a vote cast"""
        if player_id in self.player_stats:
            self.player_stats[player_id]['votes_cast'] += 1

    def record_ejection(self, player_id):
        """Record player ejection"""
        if player_id in self.player_stats:
            self.player_stats[player_id]['times_ejected'] += 1

    def get_player_stats(self, player_id):
        """Get a player's statistics"""
        return self.player_stats.get(player_id, {})

    def get_leaderboard(self):
        """Get leaderboard sorted by win rate"""
        return sorted(
            self.player_stats.values(),
            key=lambda x: x['win_rate'],
            reverse=True
        )
