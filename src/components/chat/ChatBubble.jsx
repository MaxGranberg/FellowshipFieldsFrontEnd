class ChatBubble {
  constructor(scene, character) {
    this.scene = scene
    this.character = character
    this.bubble = null
    this.text = null
    this.timeout = null
  }

  showMessage(message) {
    if (this.bubble) {
      this.bubble.destroy()
      this.text.destroy()
    }

    this.bubble = this.scene.add.graphics()
    this.text = this.scene.add.text(0, 0, message, { fontSize: '14px', fontFamily: 'Arial', color: '#000000' })

    this.text.setPosition(
      this.character.sprite.x - 1,
      this.character.sprite.y - 1,
    )

    this.text.setScale(1 / this.scene.cameras.main.zoom)

    this.bubble.fillStyle(0xffffff, 1)
    this.bubble.fillRoundedRect(
      this.text.x - 5,
      this.text.y - 5,
      this.text.width,
      this.text.height,
      5,
    )

    this.bubble.setDepth(14)
    this.text.setDepth(15)

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.hideMessage()
    }, 5000)
  }

  hideMessage() {
    if (this.bubble) {
      this.bubble.destroy()
      this.text.destroy()
    }

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }
}
export default ChatBubble
