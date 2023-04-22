import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import AuthContext from './AuthContext'

function LoginForm({ onRegister }) {
  const { setIsAuthenticated, setToken } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [flashMessage, setFlashMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        // Handle authentication error
        setFlashMessage('Login failed. Please check your username and password.')
        return
      }

      const { token } = await response.json()
      setToken(token)
      setIsAuthenticated(true)
    } catch (error) {
      // Handle request error
      setFlashMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {flashMessage && <div className="flash-message">{flashMessage}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="buttons-container">
        <button type="submit">Login</button>
        <button type="button" onClick={onRegister}>Register</button>
      </div>
    </form>
  )
}

LoginForm.propTypes = {
  onRegister: PropTypes.func.isRequired,
}

export default LoginForm
