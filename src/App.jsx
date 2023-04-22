import React, { useState, useMemo } from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AuthContext from './components/AuthContext'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [token, setToken] = useState(null)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleRegister = () => {
    setIsRegistering(true)
  }

  const switchToLogin = () => {
    setIsRegistering(false)
  }

  const contextValue = useMemo(() => ({
    isAuthenticated: isLoggedIn,
    setIsAuthenticated: setIsLoggedIn,
    token,
    setToken,
  }), [isLoggedIn, token])

  return (
    <AuthContext.Provider value={contextValue}>
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
    </AuthContext.Provider>
  )
}

export default App
