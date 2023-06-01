import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create(data) {
    const { username } = data
    this.scene.start('GameScene', { username, mapKey: 'map' })
  }
}
