import ChatBubble from '../chat/ChatBubble'

/**
 * Represents a character in a game.
 * @param {Phaser.Scene} scene - The current scene.
 * @param {string} spriteKey - The key for the character sprite.
 * @param {string} clothesKey - The key for the character's clothes sprite.
 * @param {string} hairKey - The key for the character's hair sprite.
 * @param {string} shadowKey - The key for the character's shadow sprite.
 * @param {string} username - The username of the character.
 */
class Character {
  constructor(scene, spriteKey, clothesKey, hairKey, shadowKey, username) {
    this.scene = scene
    this.spriteKey = spriteKey
    this.clothesKey = clothesKey
    this.hairKey = hairKey
    this.shadowKey = shadowKey
    this.username = username

    this.sprite = this.createSprite(this.spriteKey)
    this.clothesSprite = this.createAccessorySprite(this.clothesKey, this.sprite)
    this.hairSprite = this.createAccessorySprite(this.hairKey, this.sprite)
    this.shadowSprite = this.createAccessorySprite(this.shadowKey, this.sprite)

    this.stopFrame = 0
    this.chatBubble = new ChatBubble(scene, this)
    this.usernameText = this.createUsernameText()

    // Create animations for each sprite
    this.createAnimations(this.spriteKey)
    this.createAnimations(this.clothesKey, `${spriteKey}_clothes`)
    this.createAnimations(this.hairKey, `${spriteKey}_hair`)
  }

  /**
   * Creates a sprite for the character.
   *
   * @param {string} key - The key for the sprite.
   * @returns {Phaser.Physics.Arcade.Sprite} The created sprite.
   */
  createSprite(key) {
    const sprite = this.scene.physics.add.sprite(0, 0, key)
    sprite.setDepth(10)
    sprite.scale = 0.8

    sprite.body.setSize(sprite.width * 0.8, sprite.height * 0.8)
    sprite.body.setOffset(sprite.width * 0.3, sprite.height * 0.4)

    return sprite
  }

  /**
   * Creates an accessory sprite for the character.
   *
   * @param {string} key - The key for the sprite.
   * @param {Phaser.GameObjects.Sprite} parentSprite The parent sprite to which this sprite belongs.
   * @returns {Phaser.GameObjects.Sprite} The created accessory sprite.
   */
  createAccessorySprite(key, parentSprite) {
    const sprite = this.scene.add.sprite(parentSprite.x, parentSprite.y, key)
    sprite.setDepth(parentSprite.depth + 1)
    sprite.scale = parentSprite.scale
    return sprite
  }

  /**
   * Creates animations for a sprite.
   *
   * @param {string} spriteKey - The key for the sprite.
   * @param {string} [suffix=''] - An optional suffix for the animation key.
   */
  createAnimations(spriteKey, suffix = '') {
    // Create walking animation for each row of sprite sheet. (8 columns and 4 rows)
    const directions = ['down', 'up', 'right', 'left']
    directions.forEach((dir, rowIndex) => {
      this.scene.anims.create({
        key: `walk-${dir}${suffix ? `-${suffix}` : ''}`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: rowIndex * 8,
          end: rowIndex * 8 + 7,
          first: rowIndex * 8,
        }),
        frameRate: 12,
        repeat: -1,
      })
    })
  }

  /**
   * Updates the animation of the character.
   *
   * @param {string} direction - The direction the character is moving.
   * @param {boolean} isMoving - Whether the character is moving.
   */
  updateAnimation(direction, isMoving) {
    const stopFrame = this.getStopFrame(direction)
    if (isMoving) {
      this.sprite.anims.play(`walk-${direction}`, true)
      this.clothesSprite.anims.play(`walk-${direction}-${this.clothesKey}`, true)
      this.hairSprite.anims.play(`walk-${direction}-${this.hairKey}`, true)
    } else {
      this.sprite.anims.stop()
      this.sprite.setFrame(stopFrame)
      this.clothesSprite.anims.stop()
      this.clothesSprite.setFrame(stopFrame)
      this.hairSprite.anims.stop()
      this.hairSprite.setFrame(stopFrame)
    }
  }

  /**
   * Returns the stop frame based on the direction.
   *
   * @param {string} direction - The direction the character is moving.
   * @returns {number} The stop frame.
   */
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

  /**
   * Creates a text object for the character's username.
   *
   * @returns {Phaser.GameObjects.Text} The text object.
   */
  createUsernameText() {
    const text = this.scene.add.text(0, 0, this.username, {
      fontSize: '16px',
      color: '#000000',
      align: 'center',
    })

    // Set the origin of the text object to be the center of the text
    text.setOrigin(-0.5, -5.5)

    // Set the depth so the text is rendered above the sprite
    text.setDepth(20)
    text.setScale(0.333)

    return text
  }

  /**
   * Makes the character say a message.
   *
   * @param {string} message - The message for the character to say.
   */
  say(message) {
    this.chatBubble.showMessage(message)
  }

  /**
   * Updates the character.
   */
  update() {
    this.chatBubble.update()
    this.usernameText.setPosition(this.sprite.x, this.sprite.y)
    this.shadowSprite
      .setPosition(this.sprite.x + 6.4, this.sprite.y + 14.5) // Place the shadow below the player
  }
}
export default Character
