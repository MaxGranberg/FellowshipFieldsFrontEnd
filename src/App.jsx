import React, { useState, useMemo, useEffect } from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AuthContext from './components/AuthContext'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [flashMessage, setFlashMessage] = useState(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFlashMessage(null)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [flashMessage])

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await fetch('http://localhost:8080/check-auth', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        setIsLoggedIn(true)
      }
    }

    checkAuthStatus()
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsLoggedIn(false)
      } else {
        setFlashMessage('An error occurred. Please try again later.')
      }
    } catch (error) {
      setFlashMessage('An error occurred. Please try again later.')
    }
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
  }), [isLoggedIn])

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
