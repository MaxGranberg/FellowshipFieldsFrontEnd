import React, { useState } from 'react'
import PropTypes from 'prop-types'

function RegisterForm({ onBackToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [flashMessageType, setFlashMessageType] = useState('')
  const [flashMessageContent, setFlashMessageContent] = useState('')

  const setFlashMessage = (message, type = 'error') => {
    setFlashMessageType(type)
    setFlashMessageContent(message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if passwords match
    if (password !== confirmPassword) {
      setFlashMessage('Passwords do not match.', 'error')
      return
    }

    try {
      const response = await fetch('https://fellowshipfields-auth-service.herokuapp.com/register', {
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

        setFlashMessage(extractedMessage, 'error')
        return
      }

      // Registration was successful, navigate back to login form
      onBackToLogin()
      setFlashMessage('Registration successful, you can now login!', 'success')
    } catch (error) {
      // Handle request error
      setFlashMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {flashMessageContent && (
        <div
          className={`flash-message${flashMessageType === 'success' ? '-success' : ''}`}
        >
          {flashMessageContent}
        </div>
      )}
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
