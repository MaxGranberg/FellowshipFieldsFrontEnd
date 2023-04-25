import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
} from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const logout = async () => {
    const response = await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include', // Make sure to include credentials in the request
    })

    if (response.ok) {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await fetch('http://localhost:8080/check-auth', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        setIsAuthenticated(true)
      }
    }

    checkAuthStatus()
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      logout,
    }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthContext
