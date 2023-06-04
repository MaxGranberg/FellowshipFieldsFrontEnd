/**
 * Class for controlling a Phaser camera.
 */
class CameraController {
  constructor(camera) {
    this.camera = camera
  }

  /**
   * Make the camera follow a given target.
   *
   * @param {Phaser.GameObjects.GameObject} target - The game object to follow.
   * @param {boolean} [lerp=true] - Whether or not to interpolate the camera's movement.
   * @param {number} [zoom=3] - The zoom level for the camera.
   */
  follow(target, lerp = true, zoom = 3) {
    this.camera.startFollow(target, lerp)
    this.camera.setZoom(zoom)
  }

  /**
   * Set the bounds for the camera's viewport.
   * @param {number} x - The x-coordinate of the upper left corner of the bounds.
   * @param {number} y - The y-coordinate of the upper left corner of the bounds.
   * @param {number} width - The width of the bounds.
   * @param {number} height - The height of the bounds.
   */
  setBounds(x, y, width, height) {
    this.camera.setBounds(x, y, width, height)
  }
}

export default CameraController
