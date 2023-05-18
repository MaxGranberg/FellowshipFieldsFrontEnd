class CameraController {
  constructor(camera) {
    this.camera = camera
  }

  follow(target, lerp = true, zoom = 3) {
    this.camera.startFollow(target, lerp)
    this.camera.setZoom(zoom)
  }

  setBounds(x, y, width, height) {
    this.camera.setBounds(x, y, width, height)
  }
}

export default CameraController
