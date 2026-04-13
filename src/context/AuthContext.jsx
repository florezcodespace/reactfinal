import { useEffect, useState } from 'react'
import AuthContext from './auth-context.js'
const USER_STORAGE_KEY = 'cosmos-portal-user'
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%230b1220"/><circle cx="60" cy="45" r="24" fill="%2360a5fa"/><path d="M22 100c8-18 22-28 38-28s30 10 38 28" fill="%237c3aed"/></svg>'

function createAvatar(seed) {
  return seed
    ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=7c3aed,60a5fa`
    : DEFAULT_AVATAR
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })

  const login = ({ email, name }) => {
    const displayName = name || email.split('@')[0]
    setUser({
      name: displayName,
      email,
      avatar: createAvatar(displayName),
    })
  }

  const register = ({ name, email }) => {
    login({ name, email })
  }

  const logout = () => setUser(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(USER_STORAGE_KEY)
  }, [user])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
