import pygame
import time

class KillManager:
    def __init__(self):
        self.kill_cooldown = 25  # Seconds between kills
        self.last_kill_time = {}  # {impostor_id: timestamp}
        self.kill_distance = 50

    def can_kill(self, impostor_id):
        """Check if impostor can kill"""
        current_time = time.time()
        last_kill = self.last_kill_time.get(impostor_id, 0)
        return current_time - last_kill >= self.kill_cooldown

    def get_kill_cooldown(self, impostor_id):
        """Get remaining cooldown time"""
        current_time = time.time()
        last_kill = self.last_kill_time.get(impostor_id, 0)
        cooldown = self.kill_cooldown - (current_time - last_kill)
        return max(0, cooldown)

    def execute_kill(self, impostor, victim):
        """Execute a kill"""
        if not self.can_kill(impostor.id):
            return False
        
        # Check distance
        dx = impostor.x - victim.x
        dy = impostor.y - victim.y
        distance = (dx**2 + dy**2) ** 0.5
        
        if distance > self.kill_distance:
            return False
        
        # Execute kill
        victim.kill()
        self.last_kill_time[impostor.id] = time.time()
        return True

class VentManager:
    def __init__(self):
        self.vent_cooldown = 10  # Seconds between vents
        self.last_vent_time = {}  # {impostor_id: timestamp}
        self.vent_duration = 3  # Seconds to complete vent animation

    def can_vent(self, impostor_id):
        """Check if impostor can use vent"""
        current_time = time.time()
        last_vent = self.last_vent_time.get(impostor_id, 0)
        return current_time - last_vent >= self.vent_cooldown

    def get_vent_cooldown(self, impostor_id):
        """Get remaining cooldown time"""
        current_time = time.time()
        last_vent = self.last_vent_time.get(impostor_id, 0)
        cooldown = self.vent_cooldown - (current_time - last_vent)
        return max(0, cooldown)

    def execute_vent(self, impostor, vent_from, vent_to, game_map):
        """Teleport impostor through vent"""
        if not self.can_vent(impostor.id):
            return False
        
        # Check if vents are connected
        if vent_from.connected_vent_id != vent_to.id:
            return False
        
        # Teleport
        impostor.x = vent_to.x
        impostor.y = vent_to.y
        self.last_vent_time[impostor.id] = time.time()
        return True
