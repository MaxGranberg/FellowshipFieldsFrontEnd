import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create(data) {
    this.scene.start('GameScene', data)
  }
}
