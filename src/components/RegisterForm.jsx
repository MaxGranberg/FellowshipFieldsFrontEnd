import React, { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * A form that allows users to register a new account.
 *
 * @component
 * @param {Object} props The props object.
 * @param {Function} props.onBackToLogin Callback to go back to login form.
 * @param {Function} props.setGlobalFlashMessage Callback to set global flash message.
 */
function RegisterForm({ onBackToLogin, setGlobalFlashMessage }) {
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

    if (password.length < 10) {
      setFlashMessage('Password needs to be 10 characters or more.')
      return
    }

    if (username.length < 3) {
      setFlashMessage('Username needs to be 3 characters or more')
      return
    }

    if (/^\d/.test(username)) {
      setFlashMessage('Username cant have a number as the first character')
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
        // Handle registration error, error most likely to be not a unique username.
        // My custom errors from server is not being sent after deploying on Heroku.
        setFlashMessage('Registration failed. Try another username.')
        return
      }

      // Registration was successful, navigate back to login form
      onBackToLogin()
      setGlobalFlashMessage('Registration successful, you can now login!')
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
        required
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        required
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
  setGlobalFlashMessage: PropTypes.func.isRequired,
}

export default RegisterForm
