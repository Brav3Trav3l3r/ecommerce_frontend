import * as React from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type Cart = {
  items: CartItem[]
  subtotal: number
}

type CartContextType = {
  cart: Cart
  cartCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  refreshCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
}

const CartContext = React.createContext<CartContextType | null>(null)

const EMPTY_CART: Cart = { items: [], subtotal: 0 }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const [cart, setCart] = React.useState<Cart>(EMPTY_CART)
  const [isOpen, setIsOpen] = React.useState(false)

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  async function refreshCart() {
    try {
      const res = await apiFetch("/api/cart")
      if (!res.ok) return
      const data = await res.json() as { data: Cart }
      setCart(data.data)
    } catch {
      // leave cart as-is on network error
    }
  }

  React.useEffect(() => {
    if (userId) {
      refreshCart()
    } else {
      setCart(EMPTY_CART)
    }
  }, [userId])

  async function addToCart(productId: string, quantity = 1) {
    const res = await apiFetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    })
    if (!res.ok) {
      const data = await res.json() as { error?: { message?: string } }
      throw new Error(data.error?.message ?? "Failed to add to cart")
    }
    await refreshCart()
  }

  async function updateQuantity(productId: string, quantity: number) {
    const res = await apiFetch(`/api/cart/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) {
      const data = await res.json() as { error?: { message?: string } }
      throw new Error(data.error?.message ?? "Failed to update quantity")
    }
    await refreshCart()
  }

  async function removeItem(productId: string) {
    const res = await apiFetch(`/api/cart/items/${productId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const data = await res.json() as { error?: { message?: string } }
      throw new Error(data.error?.message ?? "Failed to remove item")
    }
    await refreshCart()
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
