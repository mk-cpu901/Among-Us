class Task:
    def __init__(self, assigned_to_player_id, task_type):
        self.assigned_to_player_id = assigned_to_player_id
        self.task_type = task_type
        self.completed = False

    def complete(self):
        """Mark task as completed"""
        self.completed = True

    def __repr__(self):
        return f"Task({self.task_type}, completed={self.completed})"
