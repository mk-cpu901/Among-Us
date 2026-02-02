#!/usr/bin/env python3
"""
Among Us Clone - Quick Start Guide

This script demonstrates how to run the game in different modes.
"""

import sys
import argparse
from src.game import Game
from src.player import PlayerColor


def run_single_player(enable_sound=True, record=False, duration=None):
    """Run a single-player game with AI players"""
    print("Starting single-player game...")
    game = Game(enable_sound=enable_sound, record_frames=record, record_duration=duration)

    # Add players
    colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.PINK]
    for i, color in enumerate(colors, 1):
        game.add_player(f"Player {i}", color)

    # Run the game
    game.run()


def run_with_server(enable_sound=True):
    """Run the game with a network server"""
    print("Starting game with network server...")
    from src.network import NetworkServer

    game = Game(multiplayer=True, enable_sound=enable_sound)

    # Start server
    game.network_server = NetworkServer('localhost', 5000)
    game.network_server.start()

    # Add local players
    colors = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.PINK]
    for i, color in enumerate(colors, 1):
        game.add_player(f"Player {i}", color)

    # Run the game
    game.run()


def run_as_client(enable_sound=True):
    """Run the game as a client connecting to a server"""
    print("Starting game as network client...")
    from src.network import NetworkClient

    game = Game(multiplayer=True, enable_sound=enable_sound)

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


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', nargs='?', default='single', choices=['single', 'server', 'client'])
    parser.add_argument('--no-audio', action='store_true', help='Disable audio')
    parser.add_argument('--record', action='store_true', help='Record screenshots to snapshots/')
    parser.add_argument('--duration', type=float, default=None, help='Recording duration in seconds')

    args = parser.parse_args(argv)

    enable_sound = not args.no_audio

    if args.mode == 'server':
        run_with_server(enable_sound=enable_sound)
    elif args.mode == 'client':
        run_as_client(enable_sound=enable_sound)
    else:
        run_single_player(enable_sound=enable_sound, record=args.record, duration=args.duration)


if __name__ == "__main__":
    main()
