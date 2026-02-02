# Quick Reference Guide

## Starting the Game

```bash
# Install dependencies
pip install -r requirements.txt

# Run the game
python src/game.py
# or
python run.py
```

## Game Controls

| Key | Action |
|-----|--------|
| **WASD** | Move character |
| **E** | Call emergency meeting |
| **K** | Kill nearby player (impostors) |
| **V** | Use nearby vent (impostors) |
| **ESC** | Exit / Return to menu |
| **Mouse** | Click UI buttons |

## Game Flow

1. **Lobby Screen**
   - Select number of players (4-15)
   - Select number of impostors (1-3)
   - Click "START GAME"

2. **Loading Phase**
   - Roles randomly assigned
   - Tasks distributed to crewmates
   - Players spawn on map

3. **Playing Phase**
   - Crewmates: Move and complete tasks
   - Impostors: Kill and sabotage
   - Anyone: Call emergency meeting (E key)

4. **Discussion Phase**
   - Players discuss who is suspicious
   - Limited time for discussion

5. **Voting Phase**
   - Everyone votes on who to eject
   - Most voted player is ejected
   - If tied, skip vote

6. **Game End**
   - Crewmates win: All tasks complete OR all impostors ejected
   - Impostors win: Equal or outnumber crewmates

## Winning as Crewmate

✓ Complete all assigned tasks
✓ Vote out all impostors
✗ Don't get killed before objectives complete

## Winning as Impostor

✓ Kill enough crewmates to equal or outnumber them
✓ Avoid being voted out
✓ Use vents strategically
✗ Don't get caught and voted out

## Task Types

| Task | How to Play |
|------|-------------|
| **Fix Wiring** | Match left-right connections correctly |
| **Swipe Card** | Click swipe button 3 times in sequence |
| **Start Reactor** | Repeat the sequence shown (memory game) |
| **Divert Power** | Flip switches to match pattern |

## Impostor Abilities

### Kill
- **Cooldown**: 25 seconds
- **Range**: 50 pixels
- **How**: Press K when near a crewmate

### Vent
- **Cooldown**: 10 seconds
- **Usage**: Press V when near a vent
- **Effect**: Teleport to connected vent

## Statistics Tracked

- Total games played
- Games won/lost
- Role-specific win rates
- Kills (for impostors)
- Tasks completed
- Votes cast
- Times ejected

## Networking

### Start Server
```python
python run.py server
```
Starts a game server on `localhost:5000`

### Connect as Client
```python
python run.py client
```
Connects to server at `localhost:5000`

### Custom Server Address
Edit the host/port in `run.py` or `network.py`

## Customization

### Change Player Count
Edit in `game.py`:
```python
# Add more players
game.add_player("Player 5", PlayerColor.ORANGE)
game.add_player("Player 6", PlayerColor.YELLOW)
```

### Change Kill Cooldown
Edit in `game.py` or `impostor_abilities.py`:
```python
self.kill_manager.kill_cooldown = 30  # seconds
```

### Change Player Colors
Available colors in `player.py`:
- RED, BLUE, GREEN, PINK
- ORANGE, YELLOW, BLACK, PURPLE
- CYAN, LIME

### Add Sound Effects
Place audio files in `assets/` folder:
- `assets/kill.wav`
- `assets/vent.wav`
- `assets/vote.wav`
- `assets/task_complete.wav`
- `assets/eject.wav`
- `assets/emergency.wav`
- `assets/button_click.wav`

## Troubleshooting

### Game Won't Start
- Check Python version (3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check for syntax errors: `python -m py_compile src/*.py`

### Networking Issues
- Ensure server is running first
- Check firewall allows port 5000
- Verify localhost resolution

### No Sound
- Sound system is optional
- Game works fine without audio
- Place .wav files in assets/ folder if desired

### Low FPS
- Close other applications
- Lower pygame resolution if needed
- Check for background processes

## Tips for Playing

**As Crewmate:**
1. Stick with other players for safety
2. Complete tasks efficiently
3. Report suspicious behavior
4. Don't wander alone
5. Vote with evidence, not hunches

**As Impostor:**
1. Learn task locations
2. Time kills to avoid witnesses
3. Use vents to escape
4. Act natural (pretend to do tasks)
5. Vote with the group to avoid suspicion

## Performance

- Target: 60 FPS
- Map: 1280x720 resolution
- Players: 4-15
- Networking: TCP sockets with JSON messages

## File Descriptions

| File | Purpose |
|------|---------|
| `game.py` | Main game loop and logic |
| `player.py` | Player class, colors, roles |
| `map.py` | Map rooms and vents |
| `task.py` | Task management |
| `minigames.py` | Mini-game implementations |
| `voting.py` | Voting system |
| `impostor_abilities.py` | Kill and vent mechanics |
| `ui.py` | UI components (lobby, HUD) |
| `systems.py` | Sound, chat, statistics |
| `network.py` | Networking server/client |
| `run.py` | Quick start launcher |

## Need Help?

Check `IMPLEMENTATION.md` for detailed architecture information
Check `README.md` for comprehensive documentation
