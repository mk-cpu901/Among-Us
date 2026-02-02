import random

class TaskMinigame:
    def __init__(self, task_id, task_type):
        self.task_id = task_id
        self.task_type = task_type
        self.completed = False
        self.progress = 0  # 0-100

    def complete(self):
        self.completed = True
        self.progress = 100

class WiringMinigame(TaskMinigame):
    """Fix wiring puzzle"""
    def __init__(self, task_id):
        super().__init__(task_id, "Fix Wiring")
        self.connections = []
        self.correct_connections = 0
        self.total_connections = 6
        self.generate_puzzle()

    def generate_puzzle(self):
        """Generate random wiring connections"""
        self.connections = [(i, random.randint(0, 5)) for i in range(6)]

    def attempt_connection(self, left_port, right_port):
        """Try to connect two ports"""
        # Check if connection matches pattern
        if self.is_correct(left_port, right_port):
            self.correct_connections += 1
            self.progress = (self.correct_connections / self.total_connections) * 100
            if self.correct_connections >= self.total_connections:
                self.complete()
            return True
        return False

    def is_correct(self, left_port, right_port):
        """Check if connection is correct (simplified logic)"""
        return (left_port + right_port) % 2 == 0

class CardSwipeMinigame(TaskMinigame):
    """Swipe card minigame"""
    def __init__(self, task_id):
        super().__init__(task_id, "Swipe Card")
        self.swipes_needed = 3
        self.swipes_done = 0

    def swipe_card(self):
        """Perform a card swipe"""
        self.swipes_done += 1
        self.progress = (self.swipes_done / self.swipes_needed) * 100
        if self.swipes_done >= self.swipes_needed:
            self.complete()
        return self.completed

class ReactorStartMinigame(TaskMinigame):
    """Start reactor minigame - memory puzzle"""
    def __init__(self, task_id):
        super().__init__(task_id, "Start Reactor")
        self.sequence = [random.randint(0, 3) for _ in range(5)]
        self.player_sequence = []
        self.is_correct_so_far = True

    def button_press(self, button_id):
        """Handle button press"""
        self.player_sequence.append(button_id)
        
        # Check if button matches sequence
        if button_id != self.sequence[len(self.player_sequence) - 1]:
            self.is_correct_so_far = False
            return False
        
        # If player completed the sequence
        if len(self.player_sequence) >= len(self.sequence):
            self.progress = 100
            self.complete()
            return True
        
        self.progress = (len(self.player_sequence) / len(self.sequence)) * 100
        return True

    def reset_sequence(self):
        """Reset player sequence on error"""
        self.player_sequence = []
        self.is_correct_so_far = True

class DivertPowerMinigame(TaskMinigame):
    """Divert power from other rooms"""
    def __init__(self, task_id):
        super().__init__(task_id, "Divert Power")
        self.switches = [False] * 5  # 5 switches to flip

    def flip_switch(self, switch_id):
        """Flip a switch"""
        if 0 <= switch_id < len(self.switches):
            self.switches[switch_id] = not self.switches[switch_id]
            
            # Check if correct pattern
            if self.check_correct():
                self.progress = 100
                self.complete()
                return True
            
            self.progress = (sum(self.switches) / len(self.switches)) * 50
            return True
        return False

    def check_correct(self):
        """Check if correct switch pattern is achieved"""
        # Simplified: need alternating pattern
        correct_pattern = [True, False, True, False, True]
        return self.switches == correct_pattern

class TaskMinigameFactory:
    """Factory for creating minigames"""
    MINIGAME_TYPES = {
        "Fix Wiring": WiringMinigame,
        "Swipe Card": CardSwipeMinigame,
        "Start Reactor": ReactorStartMinigame,
        "Divert Power": DivertPowerMinigame,
    }

    @staticmethod
    def create_minigame(task_id, task_type):
        """Create a minigame based on task type"""
        minigame_class = TaskMinigameFactory.MINIGAME_TYPES.get(task_type, TaskMinigame)
        return minigame_class(task_id)
