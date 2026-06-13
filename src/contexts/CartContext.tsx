import * as React from "react"
import { apiFetch } from "@/lib/api"

type CartItem = { productId: string; quantity: number }

type CartContextType = {
  cartCount: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
}

const CartContext = React.createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = React.useState(0)

  async function fetchCartCount() {
    try {
      const res = await apiFetch("/api/cart")
      if (!res.ok) return
      const data = await res.json() as { cart: { items: CartItem[] } }
      const count = data.cart.items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch {
      // leave count as-is on network error
    }
  }

  React.useEffect(() => {
    fetchCartCount()
  }, [])

  async function addToCart(productId: string, quantity = 1) {
    const res = await apiFetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) {
      const data = await res.json() as { error?: { message?: string } }
      throw new Error(data.error?.message ?? "Failed to add to cart")
    }
    setCartCount((n) => n + quantity)
  }

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
