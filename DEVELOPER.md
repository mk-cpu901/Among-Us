# Developer's Guide - Extending the Game

## Adding a New Minigame

Create a new class in `minigames.py`:

```python
class MyMinigame(TaskMinigame):
    def __init__(self, task_id):
        super().__init__(task_id, "My Task Name")
        # Initialize your minigame
        self.setup_puzzle()
    
    def setup_puzzle(self):
        """Set up the puzzle"""
        pass
    
    def handle_input(self, event):
        """Handle player input"""
        pass
    
    def draw(self, screen):
        """Draw the minigame UI"""
        pass
    
    def check_completion(self):
        """Check if task is complete"""
        if self.is_correct:
            self.complete()
```

Register in the factory:

```python
TaskMinigameFactory.MINIGAME_TYPES["My Task Name"] = MyMinigame
```

## Adding a New Map

Create a method in `GameMap` class:

```python
def create_custom_map(self):
    """Create a custom map layout"""
    # Define rooms
    self.rooms['NewRoom1'] = Room('NewRoom1', 100, 100, 200, 200)
    self.rooms['NewRoom2'] = Room('NewRoom2', 400, 100, 200, 200)
    
    # Define vents
    vent1 = Vent(1, 150, 150, 2)
    vent2 = Vent(2, 450, 150, 1)
    
    # Add vents to rooms
    for room in self.rooms.values():
        if room.contains_point(vent1.x, vent1.y):
            room.add_vent(vent1)
```

Then call in `__init__`:

```python
def __init__(self, width=1280, height=720):
    # ... existing code ...
    self.create_custom_map()  # Instead of create_skeld_map()
```

## Adding Network Message Types

Add to `MessageType` enum in `network.py`:

```python
class MessageType(Enum):
    # ... existing types ...
    CUSTOM_MESSAGE = "custom_message"
    SABOTAGE = "sabotage"
```

Handle in `Game.handle_network_message()`:

```python
def handle_network_message(self, message):
    # ... existing handlers ...
    elif message.type == MessageType.CUSTOM_MESSAGE:
        # Handle custom message
        pass
```

## Adding Statistics

Add to `StatisticsTracker` in `systems.py`:

```python
def record_custom_stat(self, player_id, stat_name, value):
    """Record custom statistic"""
    if player_id in self.player_stats:
        stat = self.player_stats[player_id]
        if stat_name not in stat:
            stat[stat_name] = 0
        stat[stat_name] += value
```

## Adding UI Elements

Create new button/component in `ui.py`:

```python
class CustomUI:
    def __init__(self, x, y, width, height):
        self.rect = pygame.Rect(x, y, width, height)
        self.state = False
    
    def update(self, mouse_pos):
        self.is_hovered = self.rect.collidepoint(mouse_pos)
    
    def draw(self, screen):
        pygame.draw.rect(screen, (100, 100, 150), self.rect)
    
    def handle_click(self, pos):
        if self.rect.collidepoint(pos):
            self.state = not self.state
            return True
        return False
```

Integrate into game:

```python
self.custom_ui = CustomUI(x, y, width, height)

# In handle_events():
action = self.custom_ui.handle_click(pos)

# In draw():
self.custom_ui.draw(self.screen)
```

## Adding Sound Effects

1. Place audio file in `assets/` folder
2. Add to sound loading in `SoundManager`:

```python
sound_files = {
    # ... existing sounds ...
    'custom_sound': 'assets/custom_sound.wav',
}
```

3. Play in game:

```python
self.sound_manager.play_sound('custom_sound')
```

## Modifying Game Rules

### Kill Cooldown
In `impostor_abilities.py`:
```python
self.kill_cooldown = 30  # Change from 25
```

### Vent Cooldown
In `impostor_abilities.py`:
```python
self.vent_cooldown = 15  # Change from 10
```

### Emergency Meetings
In `game.py`:
```python
self.emergency_meetings_left = 2  # Change from 1
```

### Task Requirements
In `game.py`:
```python
num_tasks = random.randint(3, 5)  # Change from 2-3
```

## Extending Player Class

Add properties/methods to `Player` in `player.py`:

```python
class Player:
    def __init__(self, player_id, name, color, x=0, y=0):
        # ... existing code ...
        self.custom_property = None
    
    def custom_method(self):
        """Custom player method"""
        pass
```

## Creating a Sabotage System

Example sabotage in `game.py`:

```python
class SabotageManager:
    def __init__(self):
        self.sabotages = {}
        self.cooldown = 30
    
    def trigger_sabotage(self, sabotage_type):
        """Trigger a sabotage event"""
        if sabotage_type == "lights":
            self.sabotages['lights'] = True
        elif sabotage_type == "oxygen":
            self.sabotages['oxygen'] = True
    
    def resolve_sabotage(self, sabotage_type):
        """Resolve a sabotage"""
        if sabotage_type in self.sabotages:
            del self.sabotages[sabotage_type]
```

## Testing Your Changes

1. **Unit Testing**:
```python
# In test_game.py
import unittest
from src.game import Game

class TestGame(unittest.TestCase):
    def test_player_addition(self):
        game = Game()
        game.add_player("Test", PlayerColor.RED)
        self.assertEqual(len(game.players), 1)
```

2. **Integration Testing**:
```bash
python run.py
# Manually test features
```

3. **Network Testing**:
```bash
# Terminal 1
python run.py server

# Terminal 2
python run.py client
```

## Code Structure Best Practices

1. **Keep modules focused**: Each file handles one responsibility
2. **Use enums**: For state management and types
3. **Document code**: Use docstrings for public methods
4. **Error handling**: Wrap network operations in try-except
5. **Thread safety**: Use locks for shared resources
6. **Performance**: Profile before optimizing

## Common Extensions

### Chat Message Filtering
```python
def is_valid_message(self, text):
    return len(text) > 0 and len(text) < 256
```

### Player Customization
```python
class PlayerCosmetic:
    def __init__(self, hat, skin, pet):
        self.hat = hat
        self.skin = skin
        self.pet = pet
```

### Game Statistics
```python
def get_session_stats(self):
    return {
        'games_played': self.games_played,
        'average_game_duration': self.total_duration / self.games_played,
        'most_played_role': self.get_most_played_role(),
    }
```

### Persistent Data
```python
import json

def save_game_state(self, filename):
    data = {
        'players': [p.__dict__ for p in self.players.values()],
        'state': self.current_state.value,
    }
    with open(filename, 'w') as f:
        json.dump(data, f)
```

## Performance Optimization

1. **Reduce draw calls**: Batch rendering operations
2. **Cache calculations**: Store frequently computed values
3. **Use object pooling**: Reuse objects instead of creating new ones
4. **Optimize networking**: Compress messages, reduce update frequency
5. **Profile code**: Use cProfile to find bottlenecks

## Contributing

When adding features:
1. Follow existing code style
2. Write docstrings
3. Handle edge cases
4. Test thoroughly
5. Update documentation

