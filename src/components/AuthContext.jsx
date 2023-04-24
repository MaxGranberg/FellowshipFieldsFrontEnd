import React, {
  createContext, useState, useMemo,
} from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include', // Make sure to include credentials in the request
      })
    } catch (error) {
      return
    }

    setIsAuthenticated(false)
    setAccessToken(null)
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      accessToken,
      logout,
    }),
    [isAuthenticated, accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthContext
