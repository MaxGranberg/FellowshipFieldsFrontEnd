import React, { useState } from 'react'
import PropTypes from 'prop-types'

function RegisterForm({ onRegister, onBackToLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    // Auth service will take care of this, will remove later
    if (password !== confirmPassword) {
      return
    }

    // Perform registration logic here
    // If registration is successful, call the onRegister function
    onRegister()
  }

  return (
    <form onSubmit={handleSubmit}>
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
  onRegister: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
}

export default RegisterForm
