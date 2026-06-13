import * as React from "react"

const STORAGE_KEY = "userId"

type AuthContextValue = {
  userId: string | null
  login: (userId: string) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  )

  const login = React.useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setUserId(id)
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUserId(null)
  }, [])

  const value = React.useMemo(
    () => ({ userId, login, logout }),
    [userId, login, logout]
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
