import pygame
from enum import Enum

class PlayerRole(Enum):
    CREWMATE = 1
    IMPOSTOR = 2

class PlayerColor(Enum):
    RED = (255, 0, 0)
    BLUE = (0, 0, 255)
    GREEN = (0, 255, 0)
    PINK = (255, 192, 203)
    ORANGE = (255, 165, 0)
    YELLOW = (255, 255, 0)
    BLACK = (0, 0, 0)
    PURPLE = (128, 0, 128)
    CYAN = (0, 255, 255)
    LIME = (50, 205, 50)

class Player:
    def __init__(self, player_id, name, color, x=0, y=0):
        self.id = player_id
        self.name = name
        self.color = color
        self.x = x
        self.y = y
        self.role = PlayerRole.CREWMATE  # Default role
        self.is_alive = True
        self.speed = 3
        self.size = 20
        self.velocity_x = 0
        self.velocity_y = 0

    def update(self):
        """Update player position"""
        self.x += self.velocity_x
        self.y += self.velocity_y
        
        # Boundary checking (example: 1280x720 screen)
        self.x = max(self.size, min(1280 - self.size, self.x))
        self.y = max(self.size, min(720 - self.size, self.y))

    def draw(self, screen):
        """Draw player on screen"""
        if not self.is_alive:
            return
        
        pygame.draw.circle(screen, self.color.value, (int(self.x), int(self.y)), self.size)
        
        # Draw name above player
        font = pygame.font.Font(None, 24)
        text = font.render(self.name, True, (255, 255, 255))
        text_rect = text.get_rect(center=(int(self.x), int(self.y) - 35))
        screen.blit(text, text_rect)

    def set_role(self, role):
        """Set player role (crewmate or impostor)"""
        self.role = role

    def kill(self):
        """Mark player as dead"""
        self.is_alive = False

    def move_towards(self, target_x, target_y):
        """Move player towards target position"""
        dx = target_x - self.x
        dy = target_y - self.y
        distance = (dx**2 + dy**2) ** 0.5
        
        if distance > 0:
            self.velocity_x = (dx / distance) * self.speed
            self.velocity_y = (dy / distance) * self.speed
        else:
            self.velocity_x = 0
            self.velocity_y = 0
