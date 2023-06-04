import Phaser from 'phaser'

/**
 * Represents the boot scene of a Phaser game.
 * @extends Phaser.Scene
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  /**
   * Creates the BootScene.
   *
   * @param {Object} data - The data passed to the scene. Username in this case
   */
  create(data) {
    const { username } = data
    this.scene.start('GameScene', { username, mapKey: 'map' })
  }
}
