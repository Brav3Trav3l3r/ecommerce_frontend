import * as React from "react"

const STORAGE_KEY = "userId"
const ADMIN_KEY_STORAGE = "adminKey"

type AuthContextValue = {
  userId: string | null
  adminKey: string | null
  login: (userId: string) => void
  logout: () => void
  loginAdmin: (key: string) => void
  logoutAdmin: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  )
  const [adminKey, setAdminKey] = React.useState<string | null>(() =>
    localStorage.getItem(ADMIN_KEY_STORAGE)
  )

  const login = React.useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setUserId(id)
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUserId(null)
  }, [])

  const loginAdmin = React.useCallback((key: string) => {
    localStorage.setItem(ADMIN_KEY_STORAGE, key)
    setAdminKey(key)
  }, [])

  const logoutAdmin = React.useCallback(() => {
    localStorage.removeItem(ADMIN_KEY_STORAGE)
    setAdminKey(null)
  }, [])

  const value = React.useMemo(
    () => ({ userId, adminKey, login, logout, loginAdmin, logoutAdmin }),
    [userId, adminKey, login, logout, loginAdmin, logoutAdmin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
