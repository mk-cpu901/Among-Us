#!/usr/bin/env python3
"""
Among Us Clone - Quick Start Guide

This script demonstrates how to run the game in different modes.
"""

import sys
from src.game import Game
from src.player import PlayerColor

def run_single_player():
    """Run a single-player game with AI players"""
    print("Starting single-player game...")
    game = Game()
    
    # Add players
    colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.PINK]
    for i, color in enumerate(colors, 1):
        game.add_player(f"Player {i}", color)
    
    # Run the game
    game.run()

def run_with_server():
    """Run the game with a network server"""
    print("Starting game with network server...")
    from src.network import NetworkServer
    
    game = Game(multiplayer=True)
    
    # Start server
    game.network_server = NetworkServer('localhost', 5000)
    game.network_server.start()
    
    # Add local players
    colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.PINK]
    for i, color in enumerate(colors, 1):
        game.add_player(f"Player {i}", color)
    
    # Run the game
    game.run()

def run_as_client():
    """Run the game as a client connecting to a server"""
    print("Starting game as network client...")
    from src.network import NetworkClient
    
    game = Game(multiplayer=True)
    
    # Connect to server
    game.network_client = NetworkClient('localhost', 5000)
    if game.network_client.connect():
        # Add local player
        game.add_player("Local Player", PlayerColor.RED)
        
        # Run the game
        game.run()
    else:
        print("Failed to connect to server!")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        if mode == "server":
            run_with_server()
        elif mode == "client":
            run_as_client()
        else:
            print(f"Unknown mode: {mode}")
            print("Usage: python run.py [single|server|client]")
            sys.exit(1)
    else:
        # Default: single-player
        run_single_player()
