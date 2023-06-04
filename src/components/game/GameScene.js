import Phaser from 'phaser'
import socket from '../socket'
import AssetLoader from './AssetLoader'
import Character from './Character'
import CameraController from './CameraController'
import SocketManager from './SocketManager'

/**
 * GameScene class handles the logic and rendering of the game scene.
 * @extends Phaser.Scene
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.treeSprites = {}
    this.treeContainer = null
    this.playerId = socket.id
    this.otherPlayers = {}
  }

  /**
   * Initializes the scene with the provided data.
   *
   * @param {object} data - The data to initialize the scene with.
   */
  init(data) {
    this.username = data.username
    this.mapKey = data.mapKey
    this.fadeTriggered = data.fade
  }

  /**
   * Preloads the necessary assets for the scene.
   */
  preload() {
    const assetLoader = new AssetLoader(this)
    assetLoader.preload()
  }

  /**
   * Creates the scene objects.
   */
  create() {
    const map = this.createMap()
    this.createLayers(map)
    this.createAnimatedTrees(map)
    this.createCharacters()
    this.createCameraController(map)
    this.createGridEngine(map)
    const socketManager = new SocketManager(this, socket)
    socketManager.handleSocketEvents()
    this.createTeleportZones()
    this.input.keyboard.on('keydown', (event) => {
      if (event.altKey && event.key === 't') {
        Object.keys(this.otherPlayers).forEach((playerId) => {
          this.removeOtherPlayer(playerId)
        })
        this.scene.start('MiniGameScene')
      }
    })
  }

  /**
   * Updates the scene objects.
   */
  update() {
    this.updateCharacterMovements()
    this.updateCharacterDepths()
    if (this.mapKey !== 'houseMap') {
      this.updateTreeAnimations()
    }
  }

  // -------------------- Custom methods -------------------------------------

  /**
   * Creates a new map.
   *
   * @returns {Phaser.Tilemaps.Tilemap} The created map.
   */
  createMap() {
    return this.make.tilemap({ key: this.mapKey })
  }

  /**
   * Creates the necessary layers for the provided map.
   *
   * @param {Phaser.Tilemaps.Tilemap} map - The map to create layers for.
   * @returns {object} The created layers.
   */
  createLayers(map) {
    const housesTileset = map.addTilesetImage('houses', 'houses')

    if (this.mapKey !== 'houseMap') {
      const farmGroundTileset = map.addTilesetImage('farmGroundTileset', 'farmGroundTileset')
      const cropsTileset = map.addTilesetImage('crops', 'crops')
      const tilesets = [farmGroundTileset, housesTileset, cropsTileset]

      this.layers = {}
      map.layers.forEach((layer) => {
        const layerName = layer.name
        this.layers[layerName] = map.createLayer(layerName, tilesets)
      })
    } else {
      const farmingTileset = map.addTilesetImage('farming', 'farming')
      const tilesets = [housesTileset, farmingTileset]

      this.layers = {}
      map.layers.forEach((layer) => {
        const layerName = layer.name
        this.layers[layerName] = map.createLayer(layerName, tilesets)
      })
    }

    this.doors = map.getObjectLayer('Doors').objects
    return this.layers
  }

  /**
   * Creates animated trees for the provided map.
   *
   * @param {Phaser.Tilemaps.Tilemap} map - The map to create animated trees for.
   */
  createAnimatedTrees(map) {
    if (this.mapKey !== 'houseMap') {
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
  }

  /**
   * Creates characters for the scene.
   */
  createCharacters() {
    if (this.player) {
      this.removeOtherPlayer(this.playerId)
    }
    this.player = new Character(this, 'player', 'player_clothes', 'player_hair', 'shadow', this.username)
    if (this.mapKey !== 'houseMap') {
      this.npc = new Character(this, 'npc', 'npc_clothes', 'npc_hair', 'npc_shadow', 'NPC')
    }
  }

  /**
   * Creates a camera controller for the provided map.
   *
   * @param {Phaser.Tilemaps.Tilemap} map - The map to create a camera controller for.
   */
  createCameraController(map) {
    this.cameraController = new CameraController(this.cameras.main)
    this.cameraController.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameraController.follow(this.player.sprite)
  }

  /**
   * Creates a grid engine for the provided map.
   *
   * @param {Phaser.Tilemaps.Tilemap} map - The map to create a grid engine for.
   */
  createGridEngine(map) {
    if (this.mapKey === 'houseMap') {
      const gridEngineConfig = {
        characters: [
          {
            id: 'player',
            sprite: this.player.sprite,
            startPosition: { x: 8, y: 12 },
            speed: 4,
          },
          {
            id: 'player_clothes',
            sprite: this.player.clothesSprite,
            startPosition: { x: 8, y: 12 },
            speed: 4,
          },
          {
            id: 'player_hair',
            sprite: this.player.hairSprite,
            startPosition: { x: 8, y: 12 },
            speed: 4,
          },
          {
            id: 'shadow',
            sprite: this.player.shadowSprite,
            startPosition: { x: 8, y: 12 },
            speed: 4,
          },
        ],
      }
      this.map = map
      this.gridEngine.create(map, gridEngineConfig)
    } else {
      const gridEngineConfig = {
        characters: [
          {
            id: 'player',
            sprite: this.player.sprite,
            startPosition: this.lastPosition || { x: 30, y: 20 },
            speed: 4,
          },
          {
            id: 'player_clothes',
            sprite: this.player.clothesSprite,
            startPosition: this.lastPosition || { x: 30, y: 20 },
            speed: 4,
          },
          {
            id: 'player_hair',
            sprite: this.player.hairSprite,
            startPosition: this.lastPosition || { x: 30, y: 20 },
            speed: 4,
          },
          {
            id: 'shadow',
            sprite: this.player.shadowSprite,
            startPosition: { x: 8, y: 12 },
            speed: 4,
          },
          {
            id: 'npc',
            sprite: this.npc.sprite,
            startPosition: { x: 26, y: 26 },
          },
          {
            id: 'npc_clothes',
            sprite: this.npc.clothesSprite,
            startPosition: { x: 26, y: 26 },
          },
          {
            id: 'npc_hair',
            sprite: this.npc.hairSprite,
            startPosition: { x: 26, y: 26 },
          },
          {
            id: 'npc_shadow',
            sprite: this.npc.shadowSprite,
            startPosition: { x: 26, y: 26 },
          },
        ],
      }
      this.map = map
      this.gridEngine.create(map, gridEngineConfig)
    }
  }

  /**
   * Updates the movements of the characters in the scene.
   */
  updateCharacterMovements() {
    const cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.clearCaptures()
    const playerSprite = this.player.sprite

    this.player.clothesSprite.setPosition(playerSprite.x, playerSprite.y)
    this.player.hairSprite.setPosition(playerSprite.x, playerSprite.y)

    this.npc.update()
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
        this.gridEngine.move('shadow', 'left')
        this.playerDirection = 'left'
      } else if (cursors.right.isDown) {
        this.gridEngine.move('player', 'right')
        this.gridEngine.move('player_clothes', 'right')
        this.gridEngine.move('player_hair', 'right')
        this.gridEngine.move('shadow', 'right')
        this.playerDirection = 'right'
      } else if (cursors.up.isDown) {
        this.gridEngine.move('player', 'up')
        this.gridEngine.move('player_clothes', 'up')
        this.gridEngine.move('player_hair', 'up')
        this.gridEngine.move('shadow', 'up')
        this.playerDirection = 'up'
      } else if (cursors.down.isDown) {
        this.gridEngine.move('player', 'down')
        this.gridEngine.move('player_clothes', 'down')
        this.gridEngine.move('player_hair', 'down')
        this.gridEngine.move('shadow', 'down')
        this.playerDirection = 'down'
      }
      this.player.updateAnimation(this.playerDirection, isMoving)

      socket.emit('playerMoved', {
        x: playerSprite.x,
        y: playerSprite.y,
        map: this.mapKey,
        playerId: this.playerId,
        direction: this.playerDirection,
        moving: isMoving,
      })
    }
  }

  /**
   * Updates the depths of the characters in the scene.
   */
  updateCharacterDepths() {
    if (this.mapKey !== 'houseMap') {
      this.updatePlayerDepth(this.npc)
    }
    this.updatePlayerDepth(this.player)
  }

  /**
   * Updates the animations of the trees in the scene.
   */
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

  /**
   * Updates the depth of the provided character.
   *
   * @param {Character} character - The character to update the depth for.
   */
  updatePlayerDepth(character) {
    const playerSprite = character.sprite
    const clothingSprite = character.clothesSprite
    const { hairSprite } = character
    const { shadowSprite } = character

    if (this.mapKey !== 'houseMap') {
      const playerTile = this.map
        .worldToTileXY(playerSprite.x, playerSprite.y + playerSprite.height / 4)

      const housesLayer = this.layers.Houses
      const housesTile = housesLayer.getTileAt(playerTile.x, playerTile.y)

      if (housesTile) {
        playerSprite.setDepth(housesLayer.depth + 1)
        clothingSprite.setDepth(housesLayer.depth + 1)
        hairSprite.setDepth(housesLayer.depth + 1)
        shadowSprite.setDepth(playerSprite.depth - 1)
      } else {
        playerSprite.setDepth(8)
        clothingSprite.setDepth(8)
        hairSprite.setDepth(8)
        shadowSprite.setDepth(7)
      }
    } else {
      playerSprite.setDepth(8)
      clothingSprite.setDepth(8)
      hairSprite.setDepth(8)
      shadowSprite.setDepth(7)
    }
  }

  /**
   * Creates another player with the provided player info and player ID.
   *
   * @param {object} playerInfo - The information of the player to create.
   * @param {string} playerId - The ID of the player to create.
   */
  createOtherPlayer(playerInfo, playerId) {
    const otherPlayer = new Character(this, 'player', 'player_clothes', 'player_hair', 'shadow', playerInfo.username)

    otherPlayer.sprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.clothesSprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.hairSprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.shadowSprite.setPosition(playerInfo.x, playerInfo.y)

    // Add the new character instance to the otherPlayers object
    this.otherPlayers[playerInfo.playerId] = otherPlayer

    // Add the other player to the gridEngine config
    this.createGridEngineOtherPlayer(playerId)
  }

  /**
   * Removes another player with the provided player ID.
   *
   * @param {string} playerId - The ID of the player to remove.
   */
  removeOtherPlayer(playerId) {
    if (this.otherPlayers[playerId]) {
      this.otherPlayers[playerId].sprite.destroy()
      this.otherPlayers[playerId].clothesSprite.destroy()
      this.otherPlayers[playerId].hairSprite.destroy()
      this.otherPlayers[playerId].shadowSprite.destroy()
      this.otherPlayers[playerId].usernameText.destroy()

      // Remove characters from the gridEngine
      if (this.gridEngine.hasCharacter(playerId)) {
        this.gridEngine.removeCharacter(playerId)
      }

      if (this.gridEngine.hasCharacter(`${playerId}_clothes`)) {
        this.gridEngine.removeCharacter(`${playerId}_clothes`)
      }

      if (this.gridEngine.hasCharacter(`${playerId}_hair`)) {
        this.gridEngine.removeCharacter(`${playerId}_hair`)
      }

      if (this.gridEngine.hasCharacter(`${playerId}_shadow`)) {
        this.gridEngine.removeCharacter(`${playerId}_shadow`)
      }
      delete this.otherPlayers[playerId]
    }
  }

  /**
   * Handles the moved player with the provided player info.
   *
   * @param {object} playerInfo - The information of the moved player.
   */
  handlePlayerMoved(playerInfo) {
    if (playerInfo.playerId === this.playerId) {
      return
    }

    const otherPlayer = this.otherPlayers[playerInfo.playerId]
    otherPlayer.sprite.x = playerInfo.x
    otherPlayer.sprite.y = playerInfo.y
    otherPlayer.clothesSprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.hairSprite.setPosition(playerInfo.x, playerInfo.y)
    otherPlayer.shadowSprite.setPosition(playerInfo.x, playerInfo.y)

    if (playerInfo.moving) {
      otherPlayer.updateAnimation(playerInfo.direction, playerInfo.moving)
    }
  }

  /**
   * Creates a grid engine for another player with the provided player ID.
   *
   * @param {string} playerId - The ID of the other player to create a grid engine for.
   */
  createGridEngineOtherPlayer(playerId) {
    const gridEngineOtherPlayerConfig = {
      id: playerId,
      sprite: this.otherPlayers[playerId].sprite,
      startPosition: {
        x: this.otherPlayers[playerId].sprite.x,
        y: this.otherPlayers[playerId].sprite.y,
      },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerConfig)

    const gridEngineOtherPlayerClothesConfig = {
      id: `${playerId}_clothes`,
      sprite: this.otherPlayers[playerId].clothesSprite,
      startPosition: {
        x: this.otherPlayers[playerId].clothesSprite.x,
        y: this.otherPlayers[playerId].clothesSprite.y,
      },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerClothesConfig)

    const gridEngineOtherPlayerHairConfig = {
      id: `${playerId}_hair`,
      sprite: this.otherPlayers[playerId].hairSprite,
      startPosition: {
        x: this.otherPlayers[playerId].hairSprite.x,
        y: this.otherPlayers[playerId].hairSprite.y,
      },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerHairConfig)

    const gridEngineOtherPlayerShadowConfig = {
      id: `${playerId}_shadow`,
      sprite: this.otherPlayers[playerId].shadowSprite,
      startPosition: {
        x: this.otherPlayers[playerId].shadowSprite.x,
        y: this.otherPlayers[playerId].shadowSprite.y,
      },
      speed: 4,
    }

    this.gridEngine.addCharacter(gridEngineOtherPlayerShadowConfig)
  }

  /**
   * Handles an incoming chat message and displays it on the appropriate player's chat bubble.
   *
   * @param {Object} messageData - The data containing the player ID and the message text.
   */
  handleChatMessage(messageData) {
    const { playerId, message } = messageData
    if (playerId === this.playerId) {
      this.player.say(message)
    } else if (this.otherPlayers[playerId]) {
      this.otherPlayers[playerId].say(message)
    }
  }

  /**
   * Creates zones at the locations of doors for the purpose of teleportation.
   */
  createTeleportZones() {
    this.doors.forEach((door) => {
      const doorZone = this.add.zone(door.x, door.y, door.width, door.height).setOrigin(0)
      // Enable physics on the zone
      this.physics.world.enable(doorZone)

      if (this.mapKey === 'map') {
        doorZone.setData('houseMap', door.properties.find((property) => property.name === 'destination').value)
      } else {
        doorZone.setData('map', door.properties.find((property) => property.name === 'destination').value)
      }
      this.physics.add.overlap(this.player.sprite, doorZone, this.handleTeleport, null, this)
      this.physics.add.overlap(this.player.clothesSprite, doorZone, this.handleTeleport, null, this)
      this.physics.add.overlap(this.player.hairSprite, doorZone, this.handleTeleport, null, this)
      this.physics.add.overlap(this.player.shadowSprite, doorZone, this.handleTeleport, null, this)
    })
  }

  /**
   * Handles the event when the player interacts with a teleport zone. The player is transported to
   * a different map based on the zone's metadata.
   *
   * @param {Object} player - The player sprite.
   * @param {Object} doorZone - The teleport zone that the player interacted with.
   */
  handleTeleport(player, doorZone) {
    if (this.mapKey === 'map') {
      const target = doorZone.getData('houseMap')

      // Store current position before teleport
      const playerTile = this.map
        .worldToTileXY(this.player.sprite.x, this.player.sprite.y + this.player.sprite.height / 4)

      this.lastPosition = { x: playerTile.x + 1, y: playerTile.y + 2 }
      this.loadNewMap(target)
    } else {
      const target = doorZone.getData('map')
      this.loadNewMap(target)
    }
  }

  /**
   * Loads a new map when a player moves to a new location. Also emits a 'playerChangedLocation'
   * event to the server to update the player's location on other clients.
   *
   * @param {string} target - The key of the new map to load.
   */
  loadNewMap(target) {
    if (!this.fadeTriggered) {
      this.fadeTriggered = true
      this.cameras.main.fadeOut(500)
      this.cameras.main.on('camerafadeoutcomplete', () => {
        this.scene
          .restart({ mapKey: target, username: this.username, fade: this.fadeTriggered = false })
      })
    }
    socket.emit('playerChangedLocation', {
      playerId: this.playerId,
      mapKey: target, // the new map key
    })
  }
}
