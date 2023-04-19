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

    const layerNames = ['Ground', 'farmGround', 'brygga & broar', 'brygga2 & broar2', 'crops', 'Plants and rocks', 'fences', 'Benches, lightposts & objects', 'Trees', 'trees2', 'Houses', 'HousesWalkBehind', 'Trees3', 'Collisions']
    layerNames.forEach((layerName, index) => {
      layers[layerName] = map
        .createLayer(layerName, [farmGroundTileset, housesTileset, cropsTileset])

      layers[layerName].setDepth(index + 1)

      if (layerName === 'HousesWalkBehind') {
        layers[layerName].setDepth(100)
      }
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
    this.createCharacterAnimations()

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

    if (!this.gridEngine.isMoving('player')) {
      if (cursors.left.isDown) {
        this.gridEngine.move('player', 'left')
        playerSprite.anims.play('walk-left', true)
        this.playerDirection = 'left'
      } else if (cursors.right.isDown) {
        this.gridEngine.move('player', 'right')
        playerSprite.anims.play('walk-right', true)
        this.playerDirection = 'right'
      } else if (cursors.up.isDown) {
        this.gridEngine.move('player', 'up')
        playerSprite.anims.play('walk-up', true)
        this.playerDirection = 'up'
      } else if (cursors.down.isDown) {
        this.gridEngine.move('player', 'down')
        playerSprite.anims.play('walk-down', true)
        this.playerDirection = 'down'
      } else {
        playerSprite.anims.stop()
        playerSprite.setFrame(this.getStopFrame(this.playerDirection))
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
    // Create walking animation for each row of players sprite sheet. (8 columns and 4 rows)
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
}
