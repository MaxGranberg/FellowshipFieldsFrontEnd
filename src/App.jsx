import React, {
  useState, useEffect, useContext,
} from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AuthContext from './components/AuthContext'

function App() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [flashMessage, setFlashMessage] = useState(null)

  const { isAuthenticated, setIsAuthenticated, logout } = useContext(AuthContext)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFlashMessage(null)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [flashMessage])

  const handleLogin = () => {
    setIsAuthenticated(true)
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
        {isAuthenticated && (
          <button type="button" className="logout-button" onClick={logout}>
            Logout
          </button>
        )}
      </div>
      {flashMessage && <div className="flash-message-success">{flashMessage}</div>}
      {isAuthenticated ? (
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
    </>
  )
}

export default App
