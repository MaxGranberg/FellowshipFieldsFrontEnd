import React, { useState, useMemo, useEffect } from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AuthContext from './components/AuthContext'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [token, setToken] = useState(null)
  const [flashMessage, setFlashMessage] = useState(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFlashMessage(null)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [flashMessage])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    setIsLoggedIn(false)
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
        {isLoggedIn && (
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      {flashMessage && <div className="flash-message-success">{flashMessage}</div>}
      {isLoggedIn ? (
        <div className="game-container">
          <Game />
        </div>
      ) : (
        <div className="login-container">
          {flashMessage && <div className="flash-message">{flashMessage}</div>}
          {!isRegistering ? (
            <LoginForm
              onLogin={handleLogin}
              onRegister={handleRegister}
              setGlobalFlashMessage={setFlashMessage}
            />
          ) : (
            <RegisterForm onRegister={switchToLogin} onBackToLogin={switchToLogin} />
          )}
        </div>
      )}
    </AuthContext.Provider>
  )
}

export default App
