import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'potholewatch_local_session'

const USERS = {
  admin: {
    id: 'local-admin',
    email: 'admin@potholewatch.local',
    role: 'admin',
    full_name: 'Local Admin',
  },
  user: {
    id: 'local-user',
    email: 'user@potholewatch.local',
    role: 'user',
    full_name: 'Local User',
  },
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.role && USERS[parsed.role] ? USERS[parsed.role] : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(readSession())
    setLoading(false)
  }, [])

  const login = async (_email, _password, role = 'user') => {
    const nextUser = USERS[role] || USERS.user
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: nextUser.role }))
    setUser(nextUser)
    return nextUser
  }

  const signup = async () => USERS.user

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
