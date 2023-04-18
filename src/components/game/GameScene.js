import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/assets/FellowshipFieldsV0.json')
    this.load.image('farmGroundTileset', '/assets/images/tiles/tiles.png')
    this.load.image('houses', '/assets/images/Buildings/buildings.png')
    this.load.image('crops', '/assets/images/farming/crops_all.png')
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
  }
}
