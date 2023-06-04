/**
 * A class that represents a chat bubble in a game scene.
 */
class ChatBubble {
  constructor(scene, character) {
    this.scene = scene
    this.character = character
    this.bubble = null
    this.text = null
    this.timeout = null
  }

  /**
   * Displays a message in the chat bubble.
   *
   * @param {string} message - The message to display.
   */
  showMessage(message) {
    if (this.bubble) {
      this.bubble.destroy()
      this.text.destroy()
      this.container.destroy()
    }

    this.bubble = this.scene.add.graphics()
    this.text = this.scene.add.text(0, 0, message, {
      fontSize: '14px', fontFamily: 'Arial', color: '#000000', padding: { x: 5, y: 3 },
    })

    this.bubble.fillStyle(0xffffff, 1)
    this.bubble.fillRoundedRect(
      0,
      0,
      this.text.width,
      this.text.height,
      5,
    )

    // Create a container for the bubble and text
    this.container = this.scene.add.container(0, 0, [this.bubble, this.text])
    this.container.setPosition(this.character.sprite.x - 1, this.character.sprite.y - 1)
    this.container.setScale(1 / this.scene.cameras.main.zoom)

    this.container.setDepth(14)
    this.bubble.setDepth(14)
    this.text.setDepth(15)

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.hideMessage()
    }, 5000)
  }

  /**
   * Hides the chat bubble and removes the displayed message.
   */
  hideMessage() {
    if (this.bubble) {
      this.bubble.destroy()
      this.text.destroy()
      this.container.destroy()
    }

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  /**
   * Updates the position of the chat bubble based on the character's position.
   */
  update() {
    if (this.container) {
      this.container.setPosition(this.character.sprite.x - 1, this.character.sprite.y - 1)
    }
  }
}
export default ChatBubble
