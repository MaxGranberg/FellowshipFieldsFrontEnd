import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
} from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext()

/**
 * Provides an authentication context for child components.
 *
 * @component
 * @param {Object} props The props object.
 * @param {ReactNode} props.children The child nodes to be rendered within the provider.
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  const logout = async () => {
    const response = await fetch('https://fellowshipfields-auth-service.herokuapp.com/logout', {
      method: 'POST',
      credentials: 'include', // Make sure to include credentials in the request
    })

    if (response.ok) {
      setIsAuthenticated(false)
      // Force a page reload, not best solution but for now i cant solve it any other way.
      window.location.reload()
    }
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await fetch('https://fellowshipfields-auth-service.herokuapp.com/check-auth', {
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
      username,
      setUsername,
    }),
    [isAuthenticated, username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthContext
