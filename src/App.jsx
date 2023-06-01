import React, {
  useState, useEffect, useContext, useRef,
} from 'react'
import Game from './components/game/PhaserComponent'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import AuthContext from './components/AuthContext'
import socket from './components/socket'
import Chat from './components/chat/Chat'

function App() {
  const gameRef = useRef()
  const [isRegistering, setIsRegistering] = useState(false)
  const [flashMessage, setFlashMessage] = useState(null)

  const {
    isAuthenticated, setIsAuthenticated, logout, username,
  } = useContext(AuthContext)

  useEffect(() => {
    // Anslut till servern när komponenten monteras
    socket.connect()

    socket.on('playerMoved', (playerData) => {
      if (gameRef.current) {
        gameRef.current.handlePlayerMoved(playerData)
      }
    })

    // Stäng anslutningen när komponenten demonteras
    return () => {
      socket.disconnect()
    }
  }, [])

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
        <div className="game-and-chat-wrapper">
          <div className="game-container">
            <Game ref={gameRef} username={username} />
          </div>
          <Chat />
          <div className="hint-container">Press ALT and T to start a mini-game of Tic Tac Toe.</div>
        </div>
      ) : (
        <div className="login-container">
          {!isRegistering ? (
            <LoginForm
              onLogin={handleLogin}
              onRegister={handleRegister}
              setGlobalFlashMessage={setFlashMessage}
            />
          ) : (
            <RegisterForm
              onRegister={switchToLogin}
              onBackToLogin={switchToLogin}
              setGlobalFlashMessage={setFlashMessage}
            />
          )}
        </div>
      )}
    </>
  )
}

export default App
