import pygame
from enum import Enum

class UIState(Enum):
    MAIN_MENU = 1
    LOBBY = 2
    SETTINGS = 3
    GAME = 4

class Button:
    def __init__(self, x, y, width, height, text, callback=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.callback = callback
        self.is_hovered = False
        self.color = (100, 100, 150)
        self.hover_color = (150, 150, 200)
        self.text_color = (255, 255, 255)

    def update(self, mouse_pos):
        self.is_hovered = self.rect.collidepoint(mouse_pos)

    def draw(self, screen):
        color = self.hover_color if self.is_hovered else self.color
        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, (200, 200, 200), self.rect, 2)
        
        font = pygame.font.Font(None, 24)
        text_surface = font.render(self.text, True, self.text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)

    def is_clicked(self, pos):
        return self.rect.collidepoint(pos)

class PlayerCountSelector:
    def __init__(self, x, y, min_players=4, max_players=15):
        self.x = x
        self.y = y
        self.min_players = min_players
        self.max_players = max_players
        self.count = 4
        self.decrease_btn = Button(x, y, 40, 40, "-", None)
        self.increase_btn = Button(x + 50, y, 40, 40, "+", None)
        self.rect = pygame.Rect(x + 100, y, 100, 40)

    def update(self, mouse_pos):
        self.decrease_btn.update(mouse_pos)
        self.increase_btn.update(mouse_pos)

    def handle_click(self, pos):
        if self.decrease_btn.is_clicked(pos) and self.count > self.min_players:
            self.count -= 1
        elif self.increase_btn.is_clicked(pos) and self.count < self.max_players:
            self.count += 1

    def draw(self, screen):
        self.decrease_btn.draw(screen)
        self.increase_btn.draw(screen)
        pygame.draw.rect(screen, (50, 50, 70), self.rect)
        pygame.draw.rect(screen, (200, 200, 200), self.rect, 2)
        
        font = pygame.font.Font(None, 24)
        text = font.render(str(self.count), True, (255, 255, 255))
        text_rect = text.get_rect(center=self.rect.center)
        screen.blit(text, text_rect)

class LobbyUI:
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height
        self.buttons = {}
        self.setup_buttons()
        self.player_count_selector = PlayerCountSelector(400, 250)
        self.impostor_count = 1

    def setup_buttons(self):
        self.buttons['start'] = Button(450, 400, 200, 50, "START GAME", None)
        self.buttons['settings'] = Button(450, 480, 200, 50, "SETTINGS", None)
        self.buttons['quit'] = Button(450, 560, 200, 50, "QUIT", None)

    def update(self, mouse_pos):
        for button in self.buttons.values():
            button.update(mouse_pos)
        self.player_count_selector.update(mouse_pos)

    def handle_click(self, pos):
        for button_name, button in self.buttons.items():
            if button.is_clicked(pos):
                return button_name
        
        self.player_count_selector.handle_click(pos)
        return None

    def draw(self, screen):
        screen.fill((30, 30, 40))
        
        # Title
        font_title = pygame.font.Font(None, 72)
        title = font_title.render("AMONG US", True, (255, 100, 100))
        title_rect = title.get_rect(center=(self.width // 2, 50))
        screen.blit(title, title_rect)
        
        # Player count
        font_label = pygame.font.Font(None, 28)
        label = font_label.render("Players:", True, (200, 200, 200))
        screen.blit(label, (350, 260))
        self.player_count_selector.draw(screen)
        
        # Impostor count
        label2 = font_label.render("Impostors:", True, (200, 200, 200))
        screen.blit(label2, (350, 340))
        impostor_selector = PlayerCountSelector(400, 330, 1, 3)
        impostor_selector.count = self.impostor_count
        impostor_selector.draw(screen)
        
        # Buttons
        for button in self.buttons.values():
            button.draw(screen)

class SettingsUI:
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height
        self.buttons = {}
        self.settings = {
            'kill_cooldown': 25,
            'task_bar_updates': 'always',
            'confirm_ejects': True,
            'emergency_meetings': 1
        }
        self.setup_buttons()

    def setup_buttons(self):
        self.buttons['back'] = Button(50, 650, 150, 50, "BACK", None)

    def update(self, mouse_pos):
        for button in self.buttons.values():
            button.update(mouse_pos)

    def handle_click(self, pos):
        for button_name, button in self.buttons.items():
            if button.is_clicked(pos):
                return button_name
        return None

    def draw(self, screen):
        screen.fill((30, 30, 40))
        
        font_title = pygame.font.Font(None, 48)
        title = font_title.render("SETTINGS", True, (255, 255, 255))
        title_rect = title.get_rect(center=(self.width // 2, 50))
        screen.blit(title, title_rect)
        
        font_label = pygame.font.Font(None, 24)
        y = 150
        for setting, value in self.settings.items():
            text = font_label.render(f"{setting}: {value}", True, (200, 200, 200))
            screen.blit(text, (100, y))
            y += 40
        
        for button in self.buttons.values():
            button.draw(screen)

class HUD:
    """Heads-up display for during gameplay"""
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height

    def draw(self, screen, game_state):
        font_small = pygame.font.Font(None, 20)
        font_large = pygame.font.Font(None, 28)
        
        # Top-left: Game state and player count
        alive_count = sum(1 for p in game_state.players.values() if p.is_alive)
        text = font_small.render(f"Players Alive: {alive_count}/{len(game_state.players)}", True, (255, 255, 255))
        screen.blit(text, (10, 10))
        
        # Top-right: Role (if known)
        if hasattr(game_state, 'local_player') and game_state.local_player:
            role_text = game_state.local_player.role.name
            color = (255, 100, 100) if game_state.local_player.role.name == "IMPOSTOR" else (100, 255, 100)
            text = font_large.render(f"Role: {role_text}", True, color)
            screen.blit(text, (self.width - 250, 10))
        
        # Bottom-left: Tasks completed
        if hasattr(game_state, 'tasks'):
            completed = sum(1 for t in game_state.tasks if t.completed)
            total = len(game_state.tasks)
            text = font_small.render(f"Tasks: {completed}/{total}", True, (100, 255, 100))
            screen.blit(text, (10, self.height - 30))
