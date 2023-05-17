import Phaser from 'phaser'
import socket from '../socket'
import Character from './Character'
import CameraController from './CameraController'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.treeSprites = {}
    this.treeContainer = null
    this.playerId = socket.id
    this.otherPlayers = {}
  }

  init(data) {
    this.username = data.username
  }

  preload() {
    this.preloadAssets()
  }

  create() {
    const map = this.createMap()
    const layers = this.createLayers(map)
    this.createAnimatedTrees(map)
    this.createCharacters()
    this.createCameraController(map)
    this.createPhysicsCollisions(layers)
    this.createGridEngine(map)
    this.handleSocketEvents()
  }

  update() {
    this.updateCharacterMovements()
    this.updateCharacterDepths()
    this.updateTreeAnimations()
  }

  // -------------------- Custom methods -------------------------------------

  preloadAssets() {
    // Load map and tilesets
    this.load.tilemapTiledJSON('map', '/assets/FellowshipFieldsV0.json')
    this.load.image('farmGroundTileset', '/assets/images/tiles/tiles.png')
    this.load.image('houses', '/assets/images/Buildings/buildings.png')
    this.load.image('crops', '/assets/images/farming/crops_all.png')

    // Load player and NPC spritesheets
    const spritesheets = [
      { key: 'player', path: '/assets/images/walking/char1_walk.png' },
      { key: 'player_clothes', path: '/assets/images/walking/clothes/spooky_walk.png' },
      { key: 'player_hair', path: '/assets/images/walking/hair/hair1.png' },
      { key: 'npc', path: '/assets/images/walking/char4_walk.png' },
      { key: 'npc_clothes', path: '/assets/images/walking/clothes/custom_overalls_walk.png' },
      { key: 'npc_hair', path: '/assets/images/walking/hair/hair2.png' },
      { key: 'trees', path: '/assets/images/tiles/tree_shake1.png' },
    ]

    spritesheets.forEach(({ key, path }) => {
      this.load.spritesheet(key, path, { frameWidth: 32, frameHeight: 32 })
    })
  }

  createMap() {
    return this.make.tilemap({ key: 'map' })
  }

  createLayers(map) {
    const farmGroundTileset = map.addTilesetImage('farmGroundTileset', 'farmGroundTileset')
    const housesTileset = map.addTilesetImage('houses', 'houses')
    const cropsTileset = map.addTilesetImage('crops', 'crops')
    const tilesets = [farmGroundTileset, housesTileset, cropsTileset]

    this.layers = {}
    map.layers.forEach((layer) => {
      const layerName = layer.name
      this.layers[layerName] = map.createLayer(layerName, tilesets)
    })

    return this.layers
  }

  createAnimatedTrees(map) {
    this.anims.create({
      key: 'treeAnimation',
      frames: this.anims.generateFrameNumbers('trees', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    })
    const animatedTreeObjects = map.getObjectLayer('animatedTreesObjects').objects.filter((obj) => obj.properties.some((prop) => prop.name === 'type' && prop.value === 'animatedTree'))

    this.treeContainer = this.add.container()
    this.treeContainer.setDepth(13)

    animatedTreeObjects.forEach((treeObj) => {
      const treeSprite = this.add.sprite(treeObj.x, treeObj.y, 'trees').setOrigin(0, 0.5)
      treeSprite.play('treeAnimation')
      this.treeSprites[`${treeObj.x}-${treeObj.y}`] = treeSprite
      this.treeContainer.add(treeSprite)
    })
  }

  createCharacters() {
    this.player = new Character(this, 'player', 'player_clothes', 'player_hair', this.username)
    this.npc = new Character(this, 'npc', 'npc_clothes', 'npc_hair')
  }

  createCameraController(map) {
    const cameraController = new CameraController(this.cameras.main)
    cameraController.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    cameraController.follow(this.player.sprite)
  }

  createPhysicsCollisions(layers) {
    layers.Collisions.setCollisionByProperty({ collides: true })
    this.physics.add.collider(this.player.sprite, layers.Collisions)
    this.physics.add.collider(this.npc.sprite, layers.Collisions)
  }

  createGridEngine(map) {
    const gridEngineConfig = {
      characters: [
        {
          id: 'player',
          sprite: this.player.sprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'player_clothes',
          sprite: this.player.clothesSprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'player_hair',
          sprite: this.player.hairSprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'npc',
          sprite: this.npc.sprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
        {
          id: 'npc_clothes',
          sprite: this.npc.clothesSprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
        {
          id: 'npc_hair',
          sprite: this.npc.hairSprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
      ],
    }
    this.map = map
    this.gridEngine.create(map, gridEngineConfig)
  }

  handleSocketEvents() {
    // Emit player's initial position
    socket.emit('playerCreated', {
      x: 30, y: 20, playerId: this.playerId, direction: 'down',
    })

    socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((playerId) => {
        if (playerId !== this.playerId) {
          this.createOtherPlayer(players[playerId], playerId)
        }
      })
    })

    socket.on('playerJoined', (playerInfo) => {
      this.createOtherPlayer(playerInfo, playerInfo.playerId)
    })

    socket.on('playerDisconnected', (playerId) => {
      this.removeOtherPlayer(playerId)
    })

    socket.on('chatMessage', (messageData) => {
      this.handleChatMessage(messageData)
    })

    socket.on('playerMoved', (playerInfo) => {
      if (playerInfo.playerId === this.playerId) {
        return
      }
      const otherPlayer = this.otherPlayers[playerInfo.playerId]

      // Create a tween for the smooth movement
      this.tweens.add({
        targets: [otherPlayer.sprite, otherPlayer.clothesSprite, otherPlayer.hairSprite],
        x: playerInfo.x,
        y: playerInfo.y,
        duration: 300, // Change this value to adjust the tween's duration
        ease: 'linear',
        onUpdate: () => {
          this.updatePlayerDepth(this.otherPlayers[playerInfo.playerId])
        },
      })
      otherPlayer.updateAnimation(playerInfo.direction, playerInfo.moving)
      otherPlayer.update()
    })
  }

  updateCharacterMovements() {
    const cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.clearCaptures()
    const playerSprite = this.player.sprite

    this.player.clothesSprite.setPosition(playerSprite.x, playerSprite.y)
    this.player.hairSprite.setPosition(playerSprite.x, playerSprite.y)

    this.updateNPC()
    this.player.update() // Chatbubble update to follow the players when moving
    Object.values(this.otherPlayers).forEach((otherPlayer) => {
      otherPlayer.update()
    })

    const isMoving = cursors.left.isDown || cursors.right.isDown
      || cursors.up.isDown || cursors.down.isDown

    if (!this.gridEngine.isMoving('player')) {
      if (cursors.left.isDown) {
        this.gridEngine.move('player', 'left')
        this.gridEngine.move('player_clothes', 'left')
        this.gridEngine.move('player_hair', 'left')
        this.playerDirection = 'left'
      } else if (cursors.right.isDown) {
        this.gridEngine.move('player', 'right')
        this.gridEngine.move('player_clothes', 'right')
        this.gridEngine.move('player_hair', 'right')
        this.playerDirection = 'right'
      } else if (cursors.up.isDown) {
        this.gridEngine.move('player', 'up')
        this.gridEngine.move('player_clothes', 'up')
        this.gridEngine.move('player_hair', 'up')
        this.playerDirection = 'up'
      } else if (cursors.down.isDown) {
        this.gridEngine.move('player', 'down')
        this.gridEngine.move('player_clothes', 'down')
        this.gridEngine.move('player_hair', 'down')
        this.playerDirection = 'down'
      }
      this.player.updateAnimation(this.playerDirection, isMoving)

      socket.emit('playerMoved', {
        x: playerSprite.x,
        y: playerSprite.y,
        playerId: this.playerId,
        direction: this.playerDirection,
        moving: isMoving,
      })
    }
  }

  updateCharacterDepths() {
    this.updatePlayerDepth(this.npc)
    this.updatePlayerDepth(this.player)
  }

  updateTreeAnimations() {
    Object.values(this.treeSprites).forEach((treeSprite) => {
      if (this.cameras.main.worldView.contains(treeSprite.x, treeSprite.y)) {
        if (!treeSprite.anims.isPlaying) {
          treeSprite.anims.play('treeAnimation', true)
        }
      } else {
        treeSprite.anims.stop()
        treeSprite.setFrame(0)
      }
    })
  }

  updatePlayerDepth(character) {
    const playerSprite = character.sprite
    const clothingSprite = character.clothesSprite
    const { hairSprite } = character

    const playerTile = this.map
      .worldToTileXY(playerSprite.x, playerSprite.y + playerSprite.height / 4)

    const housesLayer = this.layers.Houses
    const housesTile = housesLayer.getTileAt(playerTile.x, playerTile.y)

    if (housesTile) {
      playerSprite.setDepth(housesLayer.depth + 1)
      clothingSprite.setDepth(housesLayer.depth + 1)
      hairSprite.setDepth(housesLayer.depth + 1)
    } else {
      playerSprite.setDepth(8)
      clothingSprite.setDepth(8)
      hairSprite.setDepth(8)
    }
  }

  updateNPC() {
    this.npc.clothesSprite.setPosition(this.npc.sprite.x, this.npc.sprite.y)
    this.npc.hairSprite.setPosition(this.npc.sprite.x, this.npc.sprite.y)

    // Add simple AI logic for the NPC here
    if (!this.gridEngine.isMoving('npc')) {
      this.gridEngine.moveRandomly('npc')
    }
    const direction = this.gridEngine.getFacingDirection('npc')
    this.gridEngine.move('npc', direction)
    this.gridEngine.move('npc_clothes', direction)
    this.gridEngine.move('npc_hair', direction)

    // Update the NPC's animation
    const isMoving = this.gridEngine.isMoving('npc')
    this.npc.updateAnimation(direction, isMoving)
  }

  createOtherPlayer(playerInfo, playerId) {
    const otherPlayer = new Character(this, 'player', 'player_clothes', 'player_hair', playerInfo.username)

    otherPlayer.sprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.clothesSprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.hairSprite.setPosition(playerInfo.x, playerInfo.y)

    // Add the new character instance to the otherPlayers object
    this.otherPlayers[playerInfo.playerId] = otherPlayer

    // Add the other player to the gridEngine config
    this.createGridEngineOtherPlayer(playerId)
  }

  removeOtherPlayer(playerId) {
    if (this.otherPlayers[playerId]) {
      this.otherPlayers[playerId].sprite.destroy()
      this.otherPlayers[playerId].clothesSprite.destroy()
      this.otherPlayers[playerId].hairSprite.destroy()
      this.otherPlayers[playerId].usernameText.destroy()

      // Remove characters from the gridEngine
      this.gridEngine.removeCharacter(this.otherPlayers[playerId])
      this.gridEngine.removeCharacter(`${this.otherPlayers[playerId]}_clothes`)
      this.gridEngine.removeCharacter(`${this.otherPlayers[playerId]}_hair`)
      delete this.otherPlayers[playerId]
    }
  }

  handlePlayerMoved(playerInfo) {
    if (playerInfo.playerId === this.playerId) {
      return
    }

    if (!this.otherPlayers[playerInfo.playerId]) {
      this.createOtherPlayer(playerInfo, playerInfo.playerId)
    } else {
      const otherPlayer = this.otherPlayers[playerInfo.playerId]
      otherPlayer.sprite.x = playerInfo.x
      otherPlayer.sprite.y = playerInfo.y
      otherPlayer.clothesSprite.setPosition(playerInfo.x, playerInfo.y)
      otherPlayer.hairSprite.setPosition(playerInfo.x, playerInfo.y)

      if (playerInfo.moving) {
        otherPlayer.updateAnimation(playerInfo.direction, playerInfo.moving)
      }
    }
  }

  createGridEngineOtherPlayer(playerId) {
    // console.log(playerId):  ltYEfF48W86bChH7AAAz
    const gridEngineOtherPlayerConfig = {
      id: playerId, // 'player' eller en ny sprite kanske
      sprite: this.otherPlayers[playerId].sprite,
      startPosition: { x: 30, y: 20 },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerConfig)

    const gridEngineOtherPlayerClothesConfig = {
      id: `${playerId}_clothes`,
      sprite: this.otherPlayers[playerId].clothesSprite,
      startPosition: { x: 30, y: 20 },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerClothesConfig)

    const gridEngineOtherPlayerHairConfig = {
      id: `${playerId}_hair`,
      sprite: this.otherPlayers[playerId].hairSprite,
      startPosition: { x: 30, y: 20 },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerHairConfig)
  }

  handleChatMessage(messageData) {
    const { playerId, message } = messageData
    if (playerId === this.playerId) {
      this.player.say(message)
    } else if (this.otherPlayers[playerId]) {
      this.otherPlayers[playerId].say(message)
    }
  }
}
