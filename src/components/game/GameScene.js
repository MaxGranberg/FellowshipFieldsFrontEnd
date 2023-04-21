import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.treeSprites = {}
    this.treeContainer = null
    this.playerStopFrame = null
    this.npcStopFrame = null
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/assets/FellowshipFieldsV0.json')
    this.load.image('farmGroundTileset', '/assets/images/tiles/tiles.png')
    this.load.image('houses', '/assets/images/Buildings/buildings.png')
    this.load.image('crops', '/assets/images/farming/crops_all.png')

    // Player
    this.load.spritesheet('player', '/assets/images/walking/char1_walk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('player_clothes', '/assets/images/walking/clothes/spooky_walk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('player_hair', '/assets/images/walking/hair/hair1.png', { frameWidth: 32, frameHeight: 32 })

    // NPC
    this.load.spritesheet('npc', '/assets/images/walking/char4_walk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('npc_clothes', '/assets/images/walking/clothes/custom_overalls_walk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('npc_hair', '/assets/images/walking/hair/hair2.png', { frameWidth: 32, frameHeight: 32 })

    // Animated trees
    this.load.spritesheet('trees', '/assets/images/tiles/tree_shake1.png', { frameWidth: 32, frameHeight: 32 })
  }

  create() {
    const map = this.make.tilemap({ key: 'map' })
    const farmGroundTileset = map.addTilesetImage('farmGroundTileset', 'farmGroundTileset')
    const housesTileset = map.addTilesetImage('houses', 'houses')
    const cropsTileset = map.addTilesetImage('crops', 'crops')

    const layers = {}
    const tilesets = [farmGroundTileset, housesTileset, cropsTileset]

    map.layers.forEach((layer) => {
      const layerName = layer.name
      layers[layerName] = map.createLayer(layerName, tilesets)
    })

    this.anims.create({
      key: 'treeAnimation',
      frames: this.anims.generateFrameNumbers('trees', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    })
    const animatedTreeObjects = map.getObjectLayer('animatedTreesObjects').objects.filter((obj) => obj.properties.some((prop) => prop.name === 'type' && prop.value === 'animatedTree'))

    this.treeContainer = this.add.container()
    this.treeContainer.setDepth(13) // Set the depth higher than the other layers

    animatedTreeObjects.forEach((treeObj) => {
      const treeSprite = this.add.sprite(treeObj.x, treeObj.y, 'trees').setOrigin(0, 0.5)
      treeSprite.play('treeAnimation')
      this.treeSprites[`${treeObj.x}-${treeObj.y}`] = treeSprite
      this.treeContainer.add(treeSprite)
    })

    // Create animations for the character
    const playerSprite = this.physics.add.sprite(0, 0, 'player').setFrame(0)
    playerSprite.scale = 0.8
    this.createCharacterAnimations('player')

    // Add clothes
    const clothingSprite = this.add.sprite(0, 0, 'player_clothes').setFrame(0)
    clothingSprite.setDepth(playerSprite.depth + 1)
    clothingSprite.scale = 0.8
    this.createClothesAnimations('player_clothes')

    // Add hair
    const hairSprite = this.add.sprite(0, 0, 'player_hair').setFrame(0)
    hairSprite.setDepth(clothingSprite.depth + 1)
    hairSprite.scale = 0.8
    this.createClothesAnimations('player_hair') // ändra namn på den funktionen sen

    // Now same for NPC
    const npcSprite = this.physics.add.sprite(0, 0, 'npc').setFrame(0)
    npcSprite.scale = 0.8
    this.createCharacterAnimations('npc')

    const npcClothingSprite = this.add.sprite(0, 0, 'npc_clothes').setFrame(0)
    npcClothingSprite.setDepth(npcSprite.depth + 1)
    npcClothingSprite.scale = 0.8
    this.createClothesAnimations('npc_clothes')

    const npcHairSprite = this.add.sprite(0, 0, 'npc_hair').setFrame(0)
    npcHairSprite.setDepth(npcClothingSprite.depth + 1)
    npcHairSprite.scale = 0.8
    this.createClothesAnimations('npc_hair')

    this.cameras.main.startFollow(playerSprite, true)
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.setZoom(3)
    /* this.physics.world.createDebugGraphic()
    this.physics.world.drawDebug = true
    npcSprite.setDebugBodyColor(0xff0000) // Draw NPC bounding box in red */

    layers.Collisions.setCollisionByProperty({ collides: true })
    this.physics.add.collider(playerSprite, layers.Collisions)
    this.physics.add.collider(npcSprite, layers.Collisions)

    const gridEngineConfig = {
      characters: [
        {
          id: 'player',
          sprite: playerSprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'player_clothes',
          sprite: clothingSprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'player_hair',
          sprite: hairSprite,
          startPosition: { x: 30, y: 20 },
          speed: 4,
        },
        {
          id: 'npc',
          sprite: npcSprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
        {
          id: 'npc_clothes',
          sprite: npcClothingSprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
        {
          id: 'npc_hair',
          sprite: npcHairSprite,
          startPosition: { x: 25, y: 25 },
          speed: 1,
        },
      ],
    }

    this.layers = layers
    this.map = map
    this.gridEngine.create(map, gridEngineConfig)
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys()
    const playerSprite = this.gridEngine.getSprite('player')
    const clothingSprite = this.gridEngine.getSprite('player_clothes')
    clothingSprite.setPosition(playerSprite.x, playerSprite.y)
    const hairSprite = this.gridEngine.getSprite('player_hair')
    hairSprite.setPosition(playerSprite.x, playerSprite.y)

    this.updateNPC()
    this.updatePlayerDepth({ id: 'npc' })
    this.updatePlayerDepth({ id: 'player' })

    if (!this.gridEngine.isMoving('player')) {
      if (cursors.left.isDown) {
        this.gridEngine.move('player', 'left')
        this.gridEngine.move('player_clothes', 'left')
        this.gridEngine.move('player_hair', 'left')

        playerSprite.anims.play('walk-left', true)
        clothingSprite.anims.play('walk-left-player_clothes', true)
        hairSprite.anims.play('walk-left-player_hair', true)

        this.playerDirection = 'left'
      } else if (cursors.right.isDown) {
        this.gridEngine.move('player', 'right')
        this.gridEngine.move('player_clothes', 'right')
        this.gridEngine.move('player_hair', 'right')

        playerSprite.anims.play('walk-right', true)
        clothingSprite.anims.play('walk-right-player_clothes', true)
        hairSprite.anims.play('walk-right-player_hair', true)

        this.playerDirection = 'right'
      } else if (cursors.up.isDown) {
        this.gridEngine.move('player', 'up')
        this.gridEngine.move('player_clothes', 'up')
        this.gridEngine.move('player_hair', 'up')

        playerSprite.anims.play('walk-up', true)
        clothingSprite.anims.play('walk-up-player_clothes', true)
        hairSprite.anims.play('walk-up-player_hair', true)

        this.playerDirection = 'up'
      } else if (cursors.down.isDown) {
        this.gridEngine.move('player', 'down')
        this.gridEngine.move('player_clothes', 'down')
        this.gridEngine.move('player_hair', 'down')

        playerSprite.anims.play('walk-down', true)
        clothingSprite.anims.play('walk-down-player_clothes', true)
        hairSprite.anims.play('walk-down-player_hair', true)

        this.playerDirection = 'down'
      } else {
        playerSprite.anims.stop()
        clothingSprite.anims.stop()
        hairSprite.anims.stop()
        playerSprite.setFrame(this.getStopFrame(this.playerDirection, true))
        clothingSprite.setFrame(this.getStopFrame(this.playerDirection, true))
        hairSprite.setFrame(this.getStopFrame(this.playerDirection, true))
      }
    }

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

  createCharacterAnimations(sprite) {
    // Create walking animation for each row of sprite sheet. (8 columns and 4 rows)
    const directions = ['down', 'up', 'right', 'left']
    directions.forEach((dir, rowIndex) => {
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers(sprite, {
          start: rowIndex * 8,
          end: rowIndex * 8 + 7,
          first: rowIndex * 8,
        }),
        frameRate: 12,
        repeat: -1,
      })
    })
  }

  createClothesAnimations(spriteKey) {
    // Create walking animation for each row of sprite sheet. (8 columns and 4 rows)
    const directions = ['down', 'up', 'right', 'left']
    directions.forEach((dir, rowIndex) => {
      this.anims.create({
        key: `walk-${dir}-${spriteKey}`,
        frames: this.anims.generateFrameNumbers(spriteKey, {
          start: rowIndex * 8,
          end: rowIndex * 8 + 7,
          first: rowIndex * 8,
        }),
        frameRate: 12,
        repeat: -1,
      })
    })
  }

  getStopFrame(direction, isPlayer) {
    switch (direction) {
      case 'up':
        this.playerStopFrame = 8
        this.npcStopFrame = 8
        break
      case 'right':
        this.playerStopFrame = 16
        this.npcStopFrame = 16
        break
      case 'down':
        this.playerStopFrame = 0
        this.npcStopFrame = 0
        break
      case 'left':
        this.playerStopFrame = 24
        this.npcStopFrame = 24
        break
      default:
        break
    }
    if (isPlayer) { return this.playerStopFrame }
    return this.npcStopFrame
  }

  updatePlayerDepth(char) {
    if (char.id) {
      const playerSprite = this.gridEngine.getSprite(char.id)
      const clothingSprite = this.gridEngine.getSprite(`${char.id}_clothes`)
      const hairSprite = this.gridEngine.getSprite(`${char.id}_hair`)

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
  }

  updateNPC() {
    const npcSprite = this.gridEngine.getSprite('npc')
    const npcClothingSprite = this.gridEngine.getSprite('npc_clothes')
    const npcHairSprite = this.gridEngine.getSprite('npc_hair')

    npcClothingSprite.setPosition(npcSprite.x, npcSprite.y)
    npcHairSprite.setPosition(npcSprite.x, npcSprite.y)

    // Add simple AI logic for the NPC here
    this.gridEngine.moveRandomly('npc')
    const direction = this.gridEngine.getFacingDirection('npc')
    this.gridEngine.move('npc', direction)
    this.gridEngine.move('npc_clothes', direction)
    this.gridEngine.move('npc_hair', direction)

    npcSprite.anims.play(`walk-${direction}`, true)
    npcClothingSprite.anims.play(`walk-${direction}-npc_clothes`, true)
    npcHairSprite.anims.play(`walk-${direction}-npc_hair`, true)

    if (!this.gridEngine.isMoving('npc')) {
      npcSprite.anims.stop()
      npcClothingSprite.anims.stop()
      npcHairSprite.anims.stop()
      npcSprite.setFrame(this.getStopFrame(direction, false))
      npcClothingSprite.setFrame(this.getStopFrame(direction, false))
      npcHairSprite.setFrame(this.getStopFrame(direction, false))
    }
  }
}
