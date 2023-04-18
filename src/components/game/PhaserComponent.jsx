import React, { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GridEngine } from 'grid-engine'
import GameScene from './GameScene.js'

function PhaserGame() {
  const gameRef = useRef()

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
          gravity: { y: 0 },
          debug: false,
        },
      },
      render: {
        pixelArt: true,
        roundPixels: true,
      },
    }

    const game = new Phaser.Game(config)
    return () => game.destroy()
  }, [])

  return <div ref={gameRef} />
}

export default PhaserGame
