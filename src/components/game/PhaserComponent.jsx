import React, {
  useEffect,
  useRef,
  useState, forwardRef, useImperativeHandle, useCallback,
} from 'react'
import Phaser from 'phaser'
import { GridEngine } from 'grid-engine'
import GameScene from './GameScene'
import socket from '../socket'

const PhaserGame = forwardRef((props, ref) => {
  const gameRef = useRef()
  const [game, setGame] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [players, setPlayers] = useState({})

  const handlePlayerMoved = (playerData) => {
    // Check if game is not null
    if (game) {
      // Update the game scene with the new player position
      const gameScene = game.scene.getScene('GameScene')
      gameScene.handlePlayerMoved(playerData)
    }
  }

  const handleChatMessage = useCallback((message) => {
    // Update the game scene with the new chat message
    if (game) {
      const gameScene = game.scene.getScene('GameScene')
      gameScene.handleChatMessage(message)
    }
  }, [game])

  useImperativeHandle(ref, () => ({
    handlePlayerMoved,
    handleChatMessage,
  }))

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 640,
      parent: gameRef.current,
      scene: [GameScene],
      plugins: {
        scene: [
          { key: 'gridEngine', plugin: GridEngine, mapping: 'gridEngine' },
        ],
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      render: {
        pixelArt: true,
        roundPixels: true,
      },
    }

    // Update the game state variable when the game is created
    const createdGame = new Phaser.Game(config)
    setGame(createdGame)
    return () => createdGame.destroy()
  }, [])

  useEffect(() => {
    socket.on('players', (initialPlayers) => {
      setPlayers(initialPlayers)
    })

    socket.on('playerMoved', (playerData) => {
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [playerData.id]: playerData,
      }))
    })

    socket.on('playerDisconnected', (playerId) => {
      setPlayers((prevPlayers) => {
        const updatedPlayers = { ...prevPlayers }
        delete updatedPlayers[playerId]
        return updatedPlayers
      })
    })

    socket.on('chatMessage', (message) => {
      handleChatMessage(message)
    })
    return () => {
      socket.off('players')
      socket.off('playerMoved')
      socket.off('playerDisconnected')
      socket.off('chatMessage')
    }
  }, [handleChatMessage])

  return <div ref={gameRef} />
})

export default PhaserGame
