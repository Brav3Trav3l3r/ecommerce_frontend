import { ShoppingCart } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { LoginPage } from "@/pages/LoginPage"
import { HomePage } from "@/pages/HomePage"
import { CartSheet } from "@/components/CartSheet"
import { Button } from "@/components/ui/button"

function MainApp() {
  const { userId, logout } = useAuth()
  const { cartCount, openCart } = useCart()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-sm font-medium text-foreground">AETHER ™</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{userId}</span>
          <div className="relative">
            <Button variant="ghost" size="icon-sm" aria-label="Cart" onClick={openCart}>
              <ShoppingCart />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Switch User
          </Button>
        </div>
      </header>
      <HomePage />
      <CartSheet />
    </div>
  )
}

export function App() {
  const { userId } = useAuth()
  return userId ? <MainApp /> : <LoginPage />
}

export default App
