import socket
import json
import threading
import queue
from enum import Enum

class MessageType(Enum):
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    PLAYER_MOVE = "player_move"
    PLAYER_KILL = "player_kill"
    PLAYER_VENT = "player_vent"
    GAME_START = "game_start"
    GAME_STATE = "game_state"
    VOTING_START = "voting_start"
    VOTE_CAST = "vote_cast"
    VOTING_END = "voting_end"
    CHAT = "chat"
    GAME_END = "game_end"

class NetworkMessage:
    def __init__(self, msg_type, sender_id, data):
        self.type = msg_type
        self.sender_id = sender_id
        self.data = data

    def to_json(self):
        return json.dumps({
            'type': self.type.value,
            'sender_id': self.sender_id,
            'data': self.data
        })

    @staticmethod
    def from_json(json_str):
        try:
            obj = json.loads(json_str)
            return NetworkMessage(
                MessageType(obj['type']),
                obj['sender_id'],
                obj['data']
            )
        except:
            return None

class NetworkServer:
    def __init__(self, host='localhost', port=5000):
        self.host = host
        self.port = port
        self.server_socket = None
        self.clients = {}  # {client_id: (socket, address)}
        self.message_queue = queue.Queue()
        self.running = False
        self.next_client_id = 1

    def start(self):
        """Start the network server"""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(10)
        self.running = True
        
        # Start accepting connections in a separate thread
        threading.Thread(target=self._accept_connections, daemon=True).start()
        print(f"Server started on {self.host}:{self.port}")

    def _accept_connections(self):
        """Accept incoming client connections"""
        while self.running:
            try:
                client_socket, address = self.server_socket.accept()
                client_id = self.next_client_id
                self.next_client_id += 1
                self.clients[client_id] = (client_socket, address)
                
                # Handle client in separate thread
                threading.Thread(
                    target=self._handle_client,
                    args=(client_id, client_socket),
                    daemon=True
                ).start()
                
                print(f"Client {client_id} connected from {address}")
            except:
                if self.running:
                    continue

    def _handle_client(self, client_id, client_socket):
        """Handle individual client"""
        while self.running:
            try:
                data = client_socket.recv(4096).decode('utf-8')
                if not data:
                    break
                
                # Parse message and add to queue
                message = NetworkMessage.from_json(data)
                if message:
                    self.message_queue.put((client_id, message))
            except:
                break
        
        # Client disconnected
        if client_id in self.clients:
            del self.clients[client_id]
        print(f"Client {client_id} disconnected")

    def broadcast_message(self, message):
        """Broadcast message to all clients"""
        json_data = message.to_json()
        for client_id, (client_socket, _) in self.clients.items():
            try:
                client_socket.send(json_data.encode('utf-8'))
            except:
                pass

    def send_to_client(self, client_id, message):
        """Send message to specific client"""
        if client_id in self.clients:
            client_socket, _ = self.clients[client_id]
            try:
                client_socket.send(message.to_json().encode('utf-8'))
            except:
                pass

    def get_message(self):
        """Get next message from queue"""
        try:
            return self.message_queue.get_nowait()
        except queue.Empty:
            return None

    def stop(self):
        """Stop the server"""
        self.running = False
        if self.server_socket:
            self.server_socket.close()

class NetworkClient:
    def __init__(self, host='localhost', port=5000):
        self.host = host
        self.port = port
        self.socket = None
        self.connected = False
        self.message_queue = queue.Queue()
        self.client_id = None

    def connect(self):
        """Connect to server"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            self.connected = True
            
            # Start receiving messages in separate thread
            threading.Thread(target=self._receive_messages, daemon=True).start()
            print(f"Connected to server at {self.host}:{self.port}")
            return True
        except:
            print(f"Failed to connect to {self.host}:{self.port}")
            return False

    def _receive_messages(self):
        """Receive messages from server"""
        while self.connected:
            try:
                data = self.socket.recv(4096).decode('utf-8')
                if not data:
                    break
                
                message = NetworkMessage.from_json(data)
                if message:
                    self.message_queue.put(message)
            except:
                break
        
        self.connected = False

    def send_message(self, msg_type, data):
        """Send message to server"""
        if not self.connected:
            return False
        
        message = NetworkMessage(msg_type, self.client_id, data)
        try:
            self.socket.send(message.to_json().encode('utf-8'))
            return True
        except:
            self.connected = False
            return False

    def get_message(self):
        """Get next message from server"""
        try:
            return self.message_queue.get_nowait()
        except queue.Empty:
            return None

    def disconnect(self):
        """Disconnect from server"""
        self.connected = False
        if self.socket:
            self.socket.close()
