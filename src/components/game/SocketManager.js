import socket from '../socket'

export default class SocketManager {
  constructor(scene) {
    this.scene = scene
    this.playerId = socket.id
  }

  handleSocketEvents() {
    // Emit player's initial position
    if (this.scene.mapKey !== 'houseMap') {
      socket.emit('playerCreated', {
        playerId: this.playerId,
        direction: 'down',
      })
    }

    if (this.scene.mapKey === 'houseMap') {
      socket.emit('playerCreatedInHouse', {
        playerId: this.playerId,
        direction: 'up',
      })
    }

    socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((playerId) => {
        if (playerId !== this.playerId) {
          this.scene.createOtherPlayer(players[playerId], playerId)
        }
      })
    })

    socket.on('currentPlayersInHouse', (players) => {
      Object.keys(players).forEach((playerId) => {
        if (playerId !== this.playerId) {
          this.scene.createOtherPlayer(players[playerId], playerId)
        }
      })
    })

    socket.on('playerJoined', (playerInfo) => {
      this.scene.createOtherPlayer(playerInfo, playerInfo.playerId)
    })

    socket.on('playerDisconnected', (playerId) => {
      this.scene.removeOtherPlayer(playerId)
    })

    socket.on('chatMessage', (messageData) => {
      this.scene.handleChatMessage(messageData)
    })

    socket.on('playerRemovedFromMap', (playerInfo) => {
      this.scene.removeOtherPlayer(playerInfo.playerId)
    })

    socket.on('playerMoved', (playerInfo) => {
      if (playerInfo.playerId === this.playerId || playerInfo.map !== this.scene.mapKey) {
        return
      }

      const otherPlayer = this.scene.otherPlayers[playerInfo.playerId]

      // Check if otherPlayer is defined before accessing its properties
      if (otherPlayer) {
        // Create a tween for the smooth movement
        this.scene.tweens.add({
          targets: [
            otherPlayer.sprite,
            otherPlayer.clothesSprite,
            otherPlayer.hairSprite,
          ],
          x: playerInfo.x,
          y: playerInfo.y,
          duration: 300, // Change this value to adjust the tween's duration
          ease: 'linear',
          onUpdate: () => {
            if (playerInfo.map === this.scene.mapKey) {
              if (this.scene.mapKey !== 'houseMap') {
                this.scene.updatePlayerDepth(otherPlayer)
              }
            }
          },
        })

        if (playerInfo.map === this.scene.mapKey) {
          otherPlayer.updateAnimation(playerInfo.direction, playerInfo.moving)
          otherPlayer.update()
        }
      }
    })
  }
}
