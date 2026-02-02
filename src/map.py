import pygame

class Room:
    def __init__(self, name, x, y, width, height):
        self.name = name
        self.rect = pygame.Rect(x, y, width, height)
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.vents = []
        self.tasks = []

    def contains_point(self, x, y):
        return self.rect.collidepoint(x, y)

    def add_vent(self, vent):
        self.vents.append(vent)

    def draw(self, screen):
        pygame.draw.rect(screen, (50, 50, 70), self.rect, 2)
        font = pygame.font.Font(None, 20)
        text = font.render(self.name, True, (200, 200, 200))
        screen.blit(text, (self.x + 5, self.y + 5))

class Vent:
    def __init__(self, vent_id, x, y, connected_vent_id=None):
        self.id = vent_id
        self.x = x
        self.y = y
        self.radius = 10
        self.connected_vent_id = connected_vent_id
        self.cooldown = 0
        self.is_active = True

    def is_near(self, x, y, distance=30):
        dx = x - self.x
        dy = y - self.y
        return (dx**2 + dy**2) ** 0.5 <= distance

    def draw(self, screen):
        if self.is_active:
            color = (100, 255, 100) if self.cooldown == 0 else (255, 100, 100)
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), self.radius)

class GameMap:
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height
        self.rooms = {}
        self.vents = {}
        self.create_skeld_map()

    def create_skeld_map(self):
        """Create the classic Skeld map from Among Us"""
        # Define rooms
        self.rooms['Cafeteria'] = Room('Cafeteria', 50, 400, 300, 200)
        self.rooms['Admin'] = Room('Admin', 450, 450, 150, 150)
        self.rooms['Electrical'] = Room('Electrical', 50, 50, 200, 150)
        self.rooms['MedBay'] = Room('MedBay', 450, 50, 250, 150)
        self.rooms['Reactor'] = Room('Reactor', 850, 350, 200, 150)
        self.rooms['Security'] = Room('Security', 850, 150, 150, 150)
        self.rooms['Navigation'] = Room('Navigation', 1050, 150, 150, 150)
        self.rooms['Engine'] = Room('Engine', 1050, 450, 150, 150)
        self.rooms['Upper Engine'] = Room('Upper Engine', 1050, 300, 150, 120)

        # Create vents and connect them
        vents = [
            (1, 150, 130, 2),      # Electrical vent
            (2, 550, 130, 1),      # MedBay vent
            (3, 150, 500, 4),      # Cafeteria vent
            (4, 950, 430, 3),      # Reactor vent
            (5, 1100, 500, 6),     # Engine vent
            (6, 1100, 400, 5),     # Upper Engine vent
        ]

        for vent_id, x, y, connected in vents:
            vent = Vent(vent_id, x, y, connected)
            self.vents[vent_id] = vent
            # Add vent to nearest room
            for room in self.rooms.values():
                if room.contains_point(x, y):
                    room.add_vent(vent)
                    break

    def get_room_at(self, x, y):
        """Get the room at given coordinates"""
        for room in self.rooms.values():
            if room.contains_point(x, y):
                return room
        return None

    def get_vent_near(self, x, y, distance=30):
        """Get vent near given coordinates"""
        for vent in self.vents.values():
            if vent.is_near(x, y, distance):
                return vent
        return None

    def draw(self, screen):
        """Draw all map elements"""
        for room in self.rooms.values():
            room.draw(screen)
        for vent in self.vents.values():
            vent.draw(screen)
