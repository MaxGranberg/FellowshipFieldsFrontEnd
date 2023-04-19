import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.treeSprites = {}
    this.treeContainer = null
    this.stopFrame = null
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/assets/FellowshipFieldsV0.json')
    this.load.image('farmGroundTileset', '/assets/images/tiles/tiles.png')
    this.load.image('houses', '/assets/images/Buildings/buildings.png')
    this.load.image('crops', '/assets/images/farming/crops_all.png')

    this.load.spritesheet('player', '/assets/images/walking/char1_walk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('player_clothes', '/assets/images/walking/clothes/spooky_walk.png', { frameWidth: 32, frameHeight: 32 })

    this.load.spritesheet('trees', '/assets/images/tiles/tree_shake1.png', { frameWidth: 32, frameHeight: 32 })
    this.load.on('complete', () => {
      this.anims.create({
        key: 'treeAnimation',
        frames: this.anims.generateFrameNumbers('trees', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      })
    })
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
    this.createCharacterAnimations()

    // Add clothes
    const clothingSprite = this.add.sprite(0, 0, 'player_clothes').setFrame(0)
    clothingSprite.setDepth(playerSprite.depth + 1)
    clothingSprite.scale = 0.8
    this.createClothesAnimations('player_clothes')

    this.cameras.main.startFollow(playerSprite, true)
    this.cameras.main.setZoom(3)
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    layers.Collisions.setCollisionByProperty({ collides: true })

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
      ],
    }

    this.layers = layers
    this.map = map
    this.player = playerSprite
    this.gridEngine.create(map, gridEngineConfig)
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys()
    const playerSprite = this.gridEngine.getSprite('player')
    const clothingSprite = this.gridEngine.getSprite('player_clothes')
    clothingSprite.setPosition(playerSprite.x, playerSprite.y)

    this.updatePlayerDepth({ id: 'player' })

    if (!this.gridEngine.isMoving('player')) {
      if (cursors.left.isDown) {
        this.gridEngine.move('player', 'left')
        this.gridEngine.move('player_clothes', 'left')
        playerSprite.anims.play('walk-left', true)
        clothingSprite.anims.play('walk-left-player_clothes', true)
        this.playerDirection = 'left'
      } else if (cursors.right.isDown) {
        this.gridEngine.move('player', 'right')
        this.gridEngine.move('player_clothes', 'right')
        playerSprite.anims.play('walk-right', true)
        clothingSprite.anims.play('walk-right-player_clothes', true)
        this.playerDirection = 'right'
      } else if (cursors.up.isDown) {
        this.gridEngine.move('player', 'up')
        this.gridEngine.move('player_clothes', 'up')
        playerSprite.anims.play('walk-up', true)
        clothingSprite.anims.play('walk-up-player_clothes', true)
        this.playerDirection = 'up'
      } else if (cursors.down.isDown) {
        this.gridEngine.move('player', 'down')
        this.gridEngine.move('player_clothes', 'down')
        playerSprite.anims.play('walk-down', true)
        clothingSprite.anims.play('walk-down-player_clothes', true)
        this.playerDirection = 'down'
      } else {
        playerSprite.anims.stop()
        clothingSprite.anims.stop()
        playerSprite.setFrame(this.getStopFrame(this.playerDirection))
        clothingSprite.setFrame(this.getStopFrame(this.playerDirection))
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

  createCharacterAnimations() {
    // Create walking animation for each row of sprite sheet. (8 columns and 4 rows)
    const directions = ['down', 'up', 'right', 'left']
    directions.forEach((dir, rowIndex) => {
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers('player', {
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

  getStopFrame(direction) {
    switch (direction) {
      case 'up':
        this.stopFrame = 8
        break
      case 'right':
        this.stopFrame = 16
        break
      case 'down':
        this.stopFrame = 0
        break
      case 'left':
        this.stopFrame = 24
        break
      default:
        break
    }
    return this.stopFrame
  }

  updatePlayerDepth(char) {
    if (char.id === 'player') {
      const playerSprite = this.gridEngine.getSprite(char.id)
      const playerTile = this.map
        .worldToTileXY(playerSprite.x, playerSprite.y + playerSprite.height / 4)

      const housesLayer = this.layers.Houses
      const housesTile = housesLayer.getTileAt(playerTile.x, playerTile.y)

      if (housesTile) {
        playerSprite.setDepth(housesLayer.depth + 1)
      } else {
        playerSprite.setDepth(8)
      }
    }
  }
}
