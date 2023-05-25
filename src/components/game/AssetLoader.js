export default class AssetLoader {
  constructor(scene) {
    this.scene = scene
  }

  preload() {
    const { mapKey } = this.scene

    // Load map and tilesets
    if (mapKey !== 'houseMap') {
      this.scene.load.tilemapTiledJSON('map', '/assets/FellowshipFieldsV0.json')
      this.scene.load.image('farmGroundTileset', '/assets/images/tiles/tiles.png')
      this.scene.load.image('houses', '/assets/images/Buildings/buildings.png')
      this.scene.load.image('crops', '/assets/images/farming/crops_all.png')
    } else {
      this.scene.load.tilemapTiledJSON('houseMap', '/assets/testHouse.json')
      this.scene.load.image('houses', '/assets/images/Buildings/buildings.png')
      this.scene.load.image('farming', '/assets/images/farming/tools.png')
    }

    // Load player and NPC spritesheets
    if (mapKey !== 'houseMap') {
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
        this.scene.load.spritesheet(key, path, { frameWidth: 32, frameHeight: 32 })
      })
    } else {
      const spritesheets = [
        { key: 'player', path: '/assets/images/walking/char1_walk.png' },
        { key: 'player_clothes', path: '/assets/images/walking/clothes/spooky_walk.png' },
        { key: 'player_hair', path: '/assets/images/walking/hair/hair1.png' },
      ]
      spritesheets.forEach(({ key, path }) => {
        this.scene.load.spritesheet(key, path, { frameWidth: 32, frameHeight: 32 })
      })
    }
  }
}
