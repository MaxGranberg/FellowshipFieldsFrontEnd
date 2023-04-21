import React, { useState } from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleRegister = () => {
    setIsRegistering(true)
  }

  const switchToLogin = () => {
    setIsRegistering(false)
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
          {!isRegistering ? (
            <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
          ) : (
            <RegisterForm onRegister={switchToLogin} onBackToLogin={switchToLogin} />
          )}
        </div>
      )}
    </>
  )
}

export default App
