import React, { useState } from 'react'
import PropTypes from 'prop-types'

function RegisterForm({ onBackToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [flashMessage, setFlashMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if passwords match
    if (password !== confirmPassword) {
      setFlashMessage('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        // Handle registration error
        const errorData = await response.json()
        const errorMessage = (errorData.cause && errorData.cause.message) ? errorData.cause.message.replace(', password:', '') : 'Registration failed. An unknown error occurred.'

        // Extract the relevant part of the error message
        const messageMatch = errorMessage.match(/User validation failed: .*?:\s*(.*)/)
        const extractedMessage = messageMatch ? messageMatch[1] : errorMessage

        setFlashMessage(extractedMessage)
        return
      }

      // Registration was successful, navigate back to login form
      onBackToLogin()
    } catch (error) {
      // Handle request error
      setFlashMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button type="submit">Register</button>
      <button type="button" onClick={onBackToLogin}>Back to Login</button>
    </form>
  )
}

RegisterForm.propTypes = {
  onBackToLogin: PropTypes.func.isRequired,
}

export default RegisterForm
