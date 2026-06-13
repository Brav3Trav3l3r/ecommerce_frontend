import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/contexts/AuthContext.tsx"
import { CartProvider } from "@/contexts/CartContext.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider defaultTheme="system">
          <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
)
