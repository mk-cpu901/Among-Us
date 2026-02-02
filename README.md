# Among Us Clone - Python Edition

A comprehensive Python implementation of Among Us using Pygame with networking, minigames, and full gameplay mechanics.

## ✨ Features

### Core Gameplay
- ✅ **Player Management**: Add and manage multiple players
- ✅ **Role Assignment**: Randomly assign Crewmates and Impostors
- ✅ **Task System**: Crewmates complete tasks to win with minigames
- ✅ **Movement**: WASD controls to move your character
- ✅ **Emergency Meetings**: Press E to call an emergency meeting
- ✅ **Color-coded Players**: 10 different player colors

### Advanced Features
- ✅ **Kill Mechanic**: Impostors can eliminate crewmates (cooldown: 25s)
- ✅ **Vent System**: Impostors can teleport between vents
- ✅ **Voting System**: Discussion and voting to eject players
- ✅ **Map System**: Multiple rooms with connected vents
- ✅ **Task Minigames**: 4 different minigame types
- ✅ **Chat System**: In-game messaging system
- ✅ **Statistics Tracking**: Track wins, losses, and achievements
- ✅ **Sound Management**: Sound effects and music support
- ✅ **GUI System**: Lobby, settings, and in-game HUD
- ✅ **Networking**: Client-server architecture for multiplayer

## Setup

### Requirements
- Python 3.8+
- Pygame 2.5.2+

### Installation

1. Clone this repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the game:
```bash
python src/game.py
```

## Controls

### Movement
- **W/A/S/D**: Move your character
- **Mouse**: Click buttons in UI

### Actions
- **E**: Call emergency meeting (when playing)
- **K**: Kill nearby crewmate (impostors only - testing)
- **V**: Use nearby vent (impostors only - testing)
- **ESC**: Exit game / Return to menu

## Game Mechanics

### Crewmates
- Complete assigned tasks to win
- Navigate the map and interact with tasks
- Discuss and vote to eliminate the impostor
- Win condition: Complete all tasks OR eject all impostors

### Impostors
- Pretend to do tasks
- Kill crewmates (with cooldown)
- Use vents to travel quickly
- Sabotage the ship
- Win condition: Equal or outnumber crewmates

### Tasks
Available minigames:
- **Fix Wiring**: Connection puzzle
- **Swipe Card**: Simple swipe mechanic
- **Start Reactor**: Memory sequence game
- **Divert Power**: Switch puzzle

## Project Structure

```
src/
  game.py              - Main game loop and state management
  player.py            - Player class with roles and movement
  task.py              - Task management
  map.py               - Map, rooms, and vent system
  impostor_abilities.py - Kill and vent mechanics
  voting.py            - Voting system
  minigames.py         - Task minigames
  ui.py                - GUI components (lobby, settings, HUD)
  systems.py           - Sound, chat, and statistics
  network.py           - Networking (server/client)
  
assets/                - Sprites, sounds, etc.
```

## Game States

- **LOBBY**: Player selection and game setup
- **PLAYING**: Main gameplay with movement and tasks
- **DISCUSSION**: Emergency meeting discussion
- **VOTING**: Vote to eject a player
- **GAME_OVER**: Winner announcement and statistics

## Networking

The game includes a basic TCP socket-based networking system:
- **Server**: Manages game state and broadcasts to clients
- **Client**: Connects to server and receives updates
- **Messages**: JSON-based message protocol

Start a server:
```python
from network import NetworkServer
server = NetworkServer('localhost', 5000)
server.start()
```

Connect a client:
```python
from network import NetworkClient
client = NetworkClient('localhost', 5000)
client.connect()
```

## Statistics Tracking

The game tracks:
- Games played and won
- Role-specific statistics (crewmate vs impostor)
- Kills (for impostors)
- Tasks completed
- Votes cast
- Ejections
- Win rate per role

## Configuration

Adjust settings in `systems.py` and `game.py`:
- Kill cooldown time
- Task bar update frequency
- Emergency meetings available
- Number of impostors
- Player count limits

## Sound & Music

The sound system supports:
- Sound effects (kill, vent, vote, etc.)
- Background music
- Volume control

Place audio files in `assets/` with standard names like:
- `assets/kill.wav`
- `assets/vent.wav`
- `assets/vote.wav`
- etc.

## Future Enhancements

- [ ] Advanced minigames with better graphics
- [ ] Sabotage mechanics (lights, oxygen, etc.)
- [ ] Multi-player stable networking
- [ ] Persistent leaderboards
- [ ] Custom map editor
- [ ] Spectator mode
- [ ] Ghost chat for dead players
- [ ] Cosmetics system
- [ ] Advanced UI with animations

## License

MIT

# Initialize Pygame
pygame.init()

# Screen settings
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Simple Among Us Prototype")

# Colors
WHITE = (255, 255, 255)
RED = (255, 0, 0)

# Player settings
player_pos = [WIDTH // 2, HEIGHT // 2]
player_size = 50
player_speed = 5

# Game loop
clock = pygame.time.Clock()

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        player_pos[0] -= player_speed
    if keys[pygame.K_RIGHT]:
        player_pos[0] += player_speed
    if keys[pygame.K_UP]:
        player_pos[1] -= player_speed
    if keys[pygame.K_DOWN]:
        player_pos[1] += player_speed

    # Fill screen with white
    screen.fill(WHITE)

    # Draw player (a simple red square)
    pygame.draw.rect(screen, RED, (*player_pos, player_size, player_size))

    pygame.display.flip()
    clock.tick(60)