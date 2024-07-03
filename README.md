# Fellowship Fields

Fellowship Fields is a multiplayer online game built with React, Phaser 3 and gridEngine.

## Usage

After logging in or registering, the user enters the game field. Here, the user can move around and interact with other players. The chat functionality allows communication with other players in real-time. Users can also start a mini-game of Tic Tac Toe by pressing ALT and T.

## Gameplay

The game is controlled via keyboard input. Here's a quick guide to help you get started:

Arrow keys for navigation.

ALT + 't' to start a mini-game.

## Code Overview

The main part of the game is contained in the GameScene class. Here's a quick overview of some important functions:

init(data): Initializes the game scene with provided data.

preload(): Preloads all the necessary assets for the game.

create(): Creates the game scene, including the map, characters, camera, and GridEngine setup.

update(): Updates the game scene, responsible for character movements, depths, and tree animations.

createCharacters(): Creates the game characters.

createGridEngine(map): Initializes GridEngine with the given map and characters.

updateCharacterMovements(): Handles character movements based on user input.

createOtherPlayer(playerInfo, playerId): Handles creation of other players in the multiplayer environment.

## Technologies Used

JavaScript & React: The primary language of the game development.

Phaser 3: A popular game framework used for creating the game.

GridEngine: Used for handling grid-based movements and collisions in the game.

Tiled: Used for designing the game-world.

## Other important repositories

https://github.com/MaxGranberg/fellowshipfields-realtime-communication
