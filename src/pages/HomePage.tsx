import * as React from "react"
import { ShoppingCart, Check } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import type { Product } from "@/types/product"

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [status, setStatus] = React.useState<"idle" | "loading" | "added">("idle")

  async function handleAddToCart() {
    setStatus("loading")
    try {
      await addToCart(product.id)
      setStatus("added")
      setTimeout(() => setStatus("idle"), 1500)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
          <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
            {product.id}
          </p>
          <Button
            size="sm"
            variant={status === "added" ? "secondary" : "default"}
            disabled={status !== "idle"}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {status === "added" ? (
              <>
                <Check />
                Added
              </>
            ) : (
              <>
                <ShoppingCart />
                {status === "loading" ? "Adding…" : "Add"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function HomePage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    apiFetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json() as Promise<{ products: Product[] }>
      })
      .then((data) => {
        if (!cancelled) setProducts(data.products)
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load products")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          02-B. Collection
        </p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight text-foreground">
          All Products
        </h2>
      </div>

      {error && (
        <p className="font-mono text-sm text-destructive">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </main>
  )
}
