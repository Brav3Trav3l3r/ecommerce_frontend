import { useAuth } from "@/contexts/AuthContext"
import { LoginPage } from "@/pages/LoginPage"
import { Button } from "@/components/ui/button"

function MainApp() {
  const { userId, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-sm font-medium text-foreground">AETHER ™</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{userId}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Switch User
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>Logged in as <span className="font-mono text-foreground">{userId}</span></p>
          <p className="mt-1">Start building your store here.</p>
        </div>
      </main>
    </div>
  )
}

export function App() {
  const { userId } = useAuth()
  return userId ? <MainApp /> : <LoginPage />
}

export default App
