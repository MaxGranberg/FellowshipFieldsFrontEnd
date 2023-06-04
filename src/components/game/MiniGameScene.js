import Phaser from 'phaser'

const GAME_WIDTH = 960
const GAME_HEIGHT = 640

// Define the size of each square and the grid
const SQUARE_SIZE = 200 // Square size
const GRID_SIZE = 3 // 3x3 grid for tic tac toe

// Calculate the starting position for the grid (centered in the game)
const GRID_X = (GAME_WIDTH - GRID_SIZE * SQUARE_SIZE) / 2
const GRID_Y = (GAME_HEIGHT - GRID_SIZE * SQUARE_SIZE) / 2

/**
 * MiniGameScene class extends Phaser.Scene
 *
 * @extends Phaser.Scene
 */
export default class MiniGameScene extends Phaser.Scene {
  constructor() {
    super('MiniGameScene')
    this.board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    this.turn = 1
    this.gameOver = false
  }

  /**
   * Preloads necessary game assets.
   */
  preload() {
    this.load.image('x', 'assets/x.png')
    this.load.image('o', 'assets/o.png')
  }

  /**
   * Initializes the game and starts a new game.
   */
  create() {
    this.resetGame()
    // Create a new Graphics object
    const graphics = this.add.graphics()

    // Set the line style (color, width)
    graphics.lineStyle(5, 0xffffff)

    // Draw the 9 squares
    for (let i = 0; i < GRID_SIZE; i += 1) {
      for (let j = 0; j < GRID_SIZE; j += 1) {
        graphics.strokeRect(
          GRID_X + i * SQUARE_SIZE,
          GRID_Y + j * SQUARE_SIZE,
          SQUARE_SIZE,
          SQUARE_SIZE,
        )
      }
    }
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const rect = this.add.rectangle(
          GRID_X + i * SQUARE_SIZE + SQUARE_SIZE / 2,
          GRID_Y + j * SQUARE_SIZE + SQUARE_SIZE / 2,
          SQUARE_SIZE,
          SQUARE_SIZE,
          0x000000,
          0,
        )
        rect.setInteractive()

        rect.on('pointerdown', () => {
          // Check if the game is not over and the clicked square is empty
          if (!this.gameOver && this.board[i][j] === 0) {
            this.board[i][j] = this.turn
            this.add.image(
              GRID_X + i * SQUARE_SIZE + SQUARE_SIZE / 2,
              GRID_Y + j * SQUARE_SIZE + SQUARE_SIZE / 2,
              this.turn === 1 ? 'x' : 'o',
            ).setOrigin(0.5).setScale(0.15)
            this.turn = 3 - this.turn

            const result = this.checkGame()
            if (result !== 0) {
              this.gameOver = true
              this.showGameResult(result)
              this.time.delayedCall(2000, () => {
                this.scene.start('GameScene')
                this.resetGame()
              }, [], this)
            } else if (this.turn === 2) {
              this.makeAIMove()
            }
          }
        })
      }
    }

    // Create the game result text and initialize it as an empty string
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '48px Courier',
      fill: '#2c3e50',
      align: 'center',
    }).setOrigin(0.5)
  }

  /**
   * Checks the current game state and returns the winner if one exists.
   *
   * @return {number} 0 if game is not over, -1 for draw, 1 if player wins, 2 if AI wins.
   */
  checkGame() {
    // Iterate through each row and column to check if any player has 3 same marks in a line.
    for (let i = 0; i < 3; i += 1) {
      // Check each row for a win
      if (this.board[i][0] === this.board[i][1]
         && this.board[i][1] === this.board[i][2] && this.board[i][0] !== 0) {
        return this.board[i][0]
      }
      // Check each column for a win
      if (this.board[0][i] === this.board[1][i]
         && this.board[1][i] === this.board[2][i] && this.board[0][i] !== 0) {
        return this.board[0][i]
      }
    }
    // Check the main diagonal for a win
    if (this.board[0][0] === this.board[1][1]
         && this.board[1][1] === this.board[2][2] && this.board[0][0] !== 0) {
      return this.board[0][0]
    }
    // Check the secondary diagonal for a win
    if (this.board[0][2] === this.board[1][1]
         && this.board[1][1] === this.board[2][0] && this.board[0][2] !== 0) {
      return this.board[0][2]
    }
    // Check if there are any empty cells left; if not, it's a draw
    let empty = 0
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        if (this.board[i][j] === 0) {
          empty += 1
        }
      }
    }
    if (empty === 0) {
      return -1
    }
    // If none of the above conditions are met, the game is still ongoing
    return 0
  }

  /**
   * AI logic to find the best move in the current game state.
   *
   * @return {number} The index of the best move for AI.
   */
  findBestMove() {
    // Flatten the board for easier manipulation
    const board = this.board.flat()

    // All possible winning configurations
    const winningMoves = [
      [0, 1, 2], // rows
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6], // columns
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8], // diagonals
      [2, 4, 6],
    ]

    // Try to find a winning move for the AI
    for (let i = 0; i < winningMoves.length; i += 1) {
      const [a, b, c] = winningMoves[i]
      if (board[a] && board[a] === board[b] && !board[c]) {
        return c
      }
      if (board[a] && board[a] === board[c] && !board[b]) {
        return b
      }
      if (board[b] && board[b] === board[c] && !board[a]) {
        return a
      }
    }

    // If there's no winning move, try to block the player from winning
    for (let i = 0; i < winningMoves.length; i += 1) {
      const [a, b, c] = winningMoves[i]
      if (board[a] && board[a] !== 'O' && board[a] === board[b] && !board[c]) {
        return c
      }
      if (board[a] && board[a] !== 'O' && board[a] === board[c] && !board[b]) {
        return b
      }
      if (board[b] && board[b] !== 'O' && board[b] === board[c] && !board[a]) {
        return a
      }
    }

    // If no strategic move, make a random move
    let randMove
    do {
      randMove = Math.floor(Math.random() * 9)
    } while (board[randMove])
    return randMove
  }

  /**
   * Makes the AI's move on the game board.
   */
  makeAIMove() {
    // Iterate through each cell to find an empty spot for making a move
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        if (this.board[i][j] === 0) {
          // Find the best move and apply it to the game board
          const move = this.findBestMove(this.board)
          this.board[Math.floor(move / 3)][move % 3] = this.turn
          // Display the move on the game interface
          this.add.image(
            GRID_X + Math.floor(move / 3) * SQUARE_SIZE + SQUARE_SIZE / 2,
            GRID_Y + (move % 3) * SQUARE_SIZE + SQUARE_SIZE / 2,
            this.turn === 1 ? 'x' : 'o',
          ).setOrigin(0.5).setScale(0.15)
          // Switch the turn to the other player
          this.turn = 3 - this.turn

          // Check if the game is over and show the result if it is
          const result = this.checkGame()
          if (result !== 0) {
            this.gameOver = true
            this.showGameResult(result)
            this.time.delayedCall(2000, () => {
              this.scene.start('GameScene')
              this.resetGame()
            }, [], this)
          }
          return
        }
      }
    }
  }

  /**
   * Display the game result to the player.
   *
   * @param {number} result The result of the game.
   */
  showGameResult(result) {
    const rect = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      350, // width of the rectangle
      60, // height of the rectangle
      Phaser.Display.Color.HexStringToColor('#f5deb3').color,
      0.7, // transparency
    )
    rect.setDepth(1)

    switch (result) {
      case 1:
        this.messageText.setText('You win!')
        break
      case 2:
        this.messageText.setText('You lose!')
        break
      case -1:
        this.messageText.setText('It\'s a draw')
        break
      default:
        this.messageText.setText('')
    }

    this.messageText.setDepth(2)
  }

  /**
   * Resets the game state to start a new game.
   */
  resetGame() {
    this.board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    this.turn = 1
    this.gameOver = false

    // Remove all 'x' and 'o' images from the scene
    this.children.each((child) => {
      if (child.texture && (child.texture.key === 'x' || child.texture.key === 'o')) {
        child.destroy()
      }
    })

    // Clear the game result text
    if (this.messageText) {
      this.messageText.setText('')
    }
  }
}
