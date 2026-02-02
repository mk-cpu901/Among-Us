import pygame
import sys
import random
import os
from src.player import Player, PlayerColor, PlayerRole
from src.task import Task
from src.map import GameMap
from src.impostor_abilities import KillManager, VentManager
from src.voting import VoteManager
from src.minigames import TaskMinigameFactory
from src.ui import LobbyUI, SettingsUI, HUD, UIState
from src.systems import SoundManager, ChatManager, StatisticsTracker
from src.network import NetworkServer, NetworkClient, MessageType
from enum import Enum

class GameState(Enum):
    LOBBY = 1
    DISCUSSION = 2
    PLAYING = 3
    VOTING = 4
    GAME_OVER = 5

class Game:
    def __init__(self, width=1280, height=720, multiplayer=False, enable_sound=True, record_frames=False, record_dir="snapshots", record_duration=None):
        pygame.init()
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Among Us Clone")
        
        self.clock = pygame.time.Clock()
        self.fps = 60
        self.running = True
        
        self.players = {}
        self.current_state = GameState.LOBBY
        self.tasks = []
        self.impostors = []
        self.emergency_meetings_left = 1
        self.next_player_id = 1
        
        # Game systems
        self.game_map = GameMap(width, height)
        self.kill_manager = KillManager()
        self.vent_manager = VentManager()
        self.vote_manager = VoteManager()
        self.sound_manager = SoundManager(enable_sound=enable_sound)
        self.chat_manager = ChatManager()
        self.stats_tracker = StatisticsTracker()
        self.hud = HUD(width, height)
        
        # UI
        self.lobby_ui = LobbyUI(width, height)
        self.settings_ui = SettingsUI(width, height)
        self.ui_state = UIState.MAIN_MENU
        
        # Networking
        self.multiplayer = multiplayer
        self.network_server = None
        self.network_client = None
        
        # Game state
        self.game_over = False
        self.winning_team = None
        self.minigame_active = False
        self.current_minigame = None
        # Recording screenshots (for headless viewing)
        self.record_frames = record_frames
        self.record_dir = record_dir
        self.record_duration = record_duration  # seconds
        self._frame_count = 0
        if self.record_frames:
            try:
                os.makedirs(self.record_dir, exist_ok=True)
            except Exception:
                pass

    def add_player(self, name, color):
        """Add a new player to the game"""
        player = Player(self.next_player_id, name, color)
        player.x = self.width // 2 + random.randint(-100, 100)
        player.y = self.height // 2 + random.randint(-100, 100)
        self.players[self.next_player_id] = player
        self.stats_tracker.create_player_stat(self.next_player_id, name)
        self.next_player_id += 1
        return player

    def start_game(self, num_impostors=1):
        """Start the game and assign roles"""
        if len(self.players) < 4:
            print("Need at least 4 players to start")
            return False
        
        player_list = list(self.players.values())
        
        # Randomly assign impostors
        import random
        random.shuffle(player_list)
        self.impostors = player_list[:num_impostors]
        
        for impostor in self.impostors:
            impostor.set_role(PlayerRole.IMPOSTOR)
        
        # Create tasks for crewmates
        self.create_tasks()
        
        self.current_state = GameState.PLAYING
        return True

    def create_tasks(self):
        """Create tasks for the game"""
        task_types = [
            "Fix Wiring",
            "Swipe Card",
            "Start Reactor",
            "Divert Power",
        ]
        
        for player in self.players.values():
            if player.role == PlayerRole.CREWMATE:
                # Assign 2-3 tasks per crewmate
                num_tasks = random.randint(2, 3)
                for _ in range(num_tasks):
                    task_type = random.choice(task_types)
                    task = Task(player.id, task_type)
                    self.tasks.append(task)

    def handle_events(self):
        """Handle user input and events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_e and self.current_state == GameState.PLAYING:
                    # Emergency meeting
                    if self.emergency_meetings_left > 0:
                        self.start_voting()
                        self.emergency_meetings_left -= 1
                        self.sound_manager.play_sound('emergency')
                elif event.key == pygame.K_k and self.current_state == GameState.PLAYING:
                    # Kill key (for testing)
                    if 1 in self.players and 2 in self.players:
                        self.kill_manager.execute_kill(self.players[1], self.players[2])
                        self.sound_manager.play_sound('kill')
                elif event.key == pygame.K_v and self.current_state == GameState.PLAYING:
                    # Vent key (for testing)
                    if 1 in self.players:
                        player = self.players[1]
                        vent = self.game_map.get_vent_near(player.x, player.y)
                        if vent and player.role == PlayerRole.IMPOSTOR:
                            # Find connected vent
                            if vent.connected_vent_id in self.game_map.vents:
                                connected = self.game_map.vents[vent.connected_vent_id]
                                self.vent_manager.execute_vent(player, vent, connected, self.game_map)
                                self.sound_manager.play_sound('vent')
            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.handle_click(event.pos)
        
        # Handle continuous key presses for movement
        if self.current_state == GameState.PLAYING:
            keys = pygame.key.get_pressed()
            if 1 in self.players:
                player = self.players[1]
                player.velocity_x = 0
                player.velocity_y = 0
                
                if keys[pygame.K_w]:
                    player.velocity_y = -player.speed
                if keys[pygame.K_s]:
                    player.velocity_y = player.speed
                if keys[pygame.K_a]:
                    player.velocity_x = -player.speed
                if keys[pygame.K_d]:
                    player.velocity_x = player.speed

    def handle_click(self, pos):
        """Handle mouse clicks"""
        if self.ui_state == UIState.MAIN_MENU:
            action = self.lobby_ui.handle_click(pos)
            if action == 'start':
                self.start_game(self.lobby_ui.player_count_selector.count)
                self.ui_state = UIState.GAME
                self.sound_manager.play_sound('button_click')
            elif action == 'settings':
                self.ui_state = UIState.SETTINGS
                self.sound_manager.play_sound('button_click')
            elif action == 'quit':
                self.running = False
        elif self.ui_state == UIState.SETTINGS:
            action = self.settings_ui.handle_click(pos)
            if action == 'back':
                self.ui_state = UIState.MAIN_MENU
                self.sound_manager.play_sound('button_click')

    def update(self):
        """Update game logic"""
        if self.current_state == GameState.PLAYING:
            for player in self.players.values():
                player.update()
            
            # Check if game should end
            self.check_game_end()
        
        # Process network messages if multiplayer
        if self.network_client and self.network_client.connected:
            while True:
                msg = self.network_client.get_message()
                if not msg:
                    break
                self.handle_network_message(msg)

    def start_voting(self):
        """Start voting phase"""
        self.current_state = GameState.VOTING
        self.vote_manager.start_voting(self.players)
        self.sound_manager.play_sound('vote')

    def end_game(self, winning_team):
        """End the game"""
        self.game_over = True
        self.winning_team = winning_team
        self.sound_manager.play_sound('eject')

    def check_game_end(self):
        """Check win/loss conditions"""
        alive_players = [p for p in self.players.values() if p.is_alive]
        alive_crewmates = [p for p in alive_players if p.role == PlayerRole.CREWMATE]
        alive_impostors = [p for p in alive_players if p.role == PlayerRole.IMPOSTOR]
        
        # Impostors win if they equal or outnumber crewmates
        if len(alive_impostors) >= len(alive_crewmates) and len(alive_crewmates) > 0:
            self.end_game("IMPOSTORS")
            for impostor in alive_impostors:
                self.stats_tracker.add_game_win(impostor.id, "IMPOSTOR")
            for crewmate in alive_crewmates:
                self.stats_tracker.add_game_loss(crewmate.id, "CREWMATE")
        
        # Crewmates win if all tasks are completed
        completed_tasks = sum(1 for t in self.tasks if t.completed)
        if completed_tasks == len(self.tasks) and len(self.tasks) > 0:
            self.end_game("CREWMATES")
            for crewmate in alive_crewmates:
                self.stats_tracker.add_game_win(crewmate.id, "CREWMATE")
            for impostor in alive_impostors:
                self.stats_tracker.add_game_loss(impostor.id, "IMPOSTOR")
        
        # Crewmates win if all impostors are eliminated
        if len(alive_impostors) == 0 and len(alive_crewmates) > 0:
            self.end_game("CREWMATES")
            for crewmate in alive_crewmates:
                self.stats_tracker.add_game_win(crewmate.id, "CREWMATE")

    def handle_network_message(self, message):
        """Handle incoming network messages"""
        if message.type == MessageType.GAME_STATE:
            # Update game state from server
            pass
        elif message.type == MessageType.PLAYER_MOVE:
            # Update player position
            player_id = message.data.get('player_id')
            if player_id in self.players:
                self.players[player_id].x = message.data.get('x')
                self.players[player_id].y = message.data.get('y')
        elif message.type == MessageType.CHAT:
            # Add chat message
            self.chat_manager.add_message(
                message.data.get('player_name'),
                message.sender_id,
                message.data.get('text')
            )

    def draw(self):
        """Draw everything on screen"""
        self.screen.fill((30, 30, 40))  # Dark background
        
        if self.ui_state == UIState.MAIN_MENU:
            self.lobby_ui.draw(self.screen)
        elif self.ui_state == UIState.SETTINGS:
            self.settings_ui.draw(self.screen)
        elif self.ui_state == UIState.GAME:
            # Draw map
            self.game_map.draw(self.screen)
            
            # Draw players
            for player in self.players.values():
                player.draw(self.screen)
            
            # Draw HUD
            self.hud.draw(self.screen, self)
            
            # Draw game state UI
            self.draw_game_ui()
        
        pygame.display.flip()

    def draw_game_ui(self):
        """Draw game-specific UI"""
        font_small = pygame.font.Font(None, 20)
        font_large = pygame.font.Font(None, 36)
        
        # Draw state
        state_text = font_small.render(f"State: {self.current_state.name}", True, (255, 255, 255))
        self.screen.blit(state_text, (10, 10))
        
        # Draw emergency meetings left
        if self.current_state == GameState.PLAYING:
            meetings_text = font_small.render(f"Emergency Meetings: {self.emergency_meetings_left}", True, (255, 255, 255))
            self.screen.blit(meetings_text, (10, 70))
        
        # Draw game over message
        if self.game_over:
            game_over_text = font_large.render("GAME OVER", True, (255, 100, 100))
            game_over_rect = game_over_text.get_rect(center=(self.width // 2, self.height // 2))
            self.screen.blit(game_over_text, game_over_rect)
            
            if self.winning_team:
                winner_text = font_large.render(f"{self.winning_team} WIN", True, (100, 255, 100))
                winner_rect = winner_text.get_rect(center=(self.width // 2, self.height // 2 + 50))
                self.screen.blit(winner_text, winner_rect)

    def run(self):
        """Main game loop"""
        start_ticks = pygame.time.get_ticks()
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            # Save frame if requested
            if self.record_frames:
                try:
                    path = os.path.join(self.record_dir, f"frame_{self._frame_count:04d}.png")
                    pygame.image.save(self.screen, path)
                    self._frame_count += 1
                except Exception:
                    pass
            self.clock.tick(self.fps)
            # Exit after duration if recording for automated captures
            if self.record_frames and self.record_duration is not None:
                elapsed_ms = pygame.time.get_ticks() - start_ticks
                if elapsed_ms >= int(self.record_duration * 1000):
                    self.running = False
        
        pygame.quit()
        if self.network_client:
            self.network_client.disconnect()
        if self.network_server:
            self.network_server.stop()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    
    # Example: Add test players for single-player testing
    colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.PINK]
    for i, color in enumerate(colors, 1):
        game.add_player(f"Player {i}", color)
    
    # Run the game
    game.run()
