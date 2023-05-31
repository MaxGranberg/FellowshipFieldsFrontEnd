import ChatBubble from '../chat/ChatBubble'

class Character {
  constructor(scene, spriteKey, clothesKey, hairKey, username) {
    this.scene = scene
    this.spriteKey = spriteKey
    this.clothesKey = clothesKey
    this.hairKey = hairKey
    this.username = username

    this.sprite = this.createSprite(this.spriteKey)
    this.clothesSprite = this.createAccessorySprite(this.clothesKey, this.sprite)
    this.hairSprite = this.createAccessorySprite(this.hairKey, this.sprite)

    this.stopFrame = 0
    this.chatBubble = new ChatBubble(scene, this)
    this.usernameText = this.createUsernameText()

    // Create animations for each sprite
    this.createAnimations(this.spriteKey)
    this.createAnimations(this.clothesKey, `${spriteKey}_clothes`)
    this.createAnimations(this.hairKey, `${spriteKey}_hair`)
  }

  createSprite(key) {
    const sprite = this.scene.physics.add.sprite(0, 0, key)
    sprite.setDepth(10)
    sprite.scale = 0.8

    sprite.body.setSize(sprite.width * 0.8, sprite.height * 0.8)
    sprite.body.setOffset(sprite.width * 0.3, sprite.height * 0.4)

    return sprite
  }

  createAccessorySprite(key, parentSprite) {
    const sprite = this.scene.add.sprite(parentSprite.x, parentSprite.y, key)
    sprite.setDepth(parentSprite.depth + 1)
    sprite.scale = parentSprite.scale
    return sprite
  }

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

  createUsernameText() {
    // Create a new text object
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

  say(message) {
    this.chatBubble.showMessage(message)
  }

  update() {
    this.chatBubble.update()
    this.usernameText.setPosition(this.sprite.x, this.sprite.y)
  }
}
export default Character
