import React, { useState } from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }
  return (
    <>
      <div className="header-container">
        <h1 className="game-title">Fellowship Fields</h1>
      </div>
      {isLoggedIn ? (
        <div className="game-container">
          <Game />
        </div>
      ) : (
        <div className="login-container">
          {/* Your LoginForm component */}
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </>
  )
}

export default App
