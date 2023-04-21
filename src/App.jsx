import React from 'react'
import Game from './components/game/PhaserComponent'

function App() {
  return (
    <>
      <div className="header-container">
        <h1 className="game-title">Fellowship Fields</h1>
      </div>
      <div className="game-container">
        <Game />
      </div>
    </>
  )
}

export default App
