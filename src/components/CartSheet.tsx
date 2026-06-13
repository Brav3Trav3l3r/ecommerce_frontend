import * as React from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"

type OrderConfirmation = {
  total: number
  discountAmount: number
  couponGenerated?: { code: string; discountPercent: number }
}

export function CartSheet() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, refreshCart } = useCart()

  const [coupon, setCoupon] = React.useState("")
  const [couponError, setCouponError] = React.useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = React.useState<number | null>(null)
  const [validatingCoupon, setValidatingCoupon] = React.useState(false)

  const [checkingOut, setCheckingOut] = React.useState(false)
  const [orderDone, setOrderDone] = React.useState<OrderConfirmation | null>(null)

  const discountAmount = couponDiscount != null
    ? parseFloat(((cart.subtotal * couponDiscount) / 100).toFixed(2))
    : 0
  const total = parseFloat((cart.subtotal - discountAmount).toFixed(2))

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeCart()
      if (orderDone) {
        setOrderDone(null)
        setCoupon("")
        setCouponDiscount(null)
        setCouponError(null)
      }
    }
  }

  async function handleValidateCoupon() {
    const code = coupon.trim()
    if (!code) return
    setValidatingCoupon(true)
    setCouponError(null)
    setCouponDiscount(null)
    try {
      const res = await apiFetch("/api/discount/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      })
      const data = await res.json() as {
        data?: { valid: boolean; discountPercent?: number; reason?: string }
        error?: { message?: string }
      }
      if (!res.ok || !data.data?.valid) {
        const reason = data.data?.reason ?? data.error?.message ?? "Invalid code"
        setCouponError(reason === "CODE_ALREADY_USED" ? "Code already used" : "Invalid code")
      } else {
        setCouponDiscount(data.data.discountPercent ?? 0)
      }
    } catch {
      setCouponError("Could not validate code")
    } finally {
      setValidatingCoupon(false)
    }
  }

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const body: Record<string, string> = {}
      if (couponDiscount != null && coupon.trim()) body.discountCode = coupon.trim()
      const res = await apiFetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify(body),
      })
      const data = await res.json() as {
        data?: {
          total: number
          discountAmount: number
          couponGenerated?: { code: string; discountPercent: number }
        }
        error?: { message?: string }
      }
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message ?? "Checkout failed")
      }
      setOrderDone({
        total: data.data.total,
        discountAmount: data.data.discountAmount,
        couponGenerated: data.data.couponGenerated,
      })
      await refreshCart()
    } catch {
      // keep sheet open so user can retry
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="pb-0">
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>

        {orderDone ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Order placed</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                Total paid: ${orderDone.total.toFixed(2)}
              </p>
            </div>
            {orderDone.couponGenerated && (
              <div className="w-full rounded-md border border-border bg-muted/50 p-3 text-left">
                <p className="text-xs text-muted-foreground">Your reward coupon</p>
                <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                  {orderDone.couponGenerated.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {orderDone.couponGenerated.discountPercent}% off your next order
                </p>
              </div>
            )}
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {cart.items.length === 0 ? (
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Your cart is empty
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.productId, item.quantity - 1)
                              : removeItem(item.productId)
                          }
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center font-mono text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <p className="w-14 text-right font-mono text-sm font-medium tabular-nums">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <SheetFooter className="gap-3 border-t border-border">
                {/* Coupon */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value)
                      setCouponError(null)
                      if (!e.target.value.trim()) setCouponDiscount(null)
                    }}
                    aria-invalid={couponError != null || undefined}
                    className="font-mono text-sm uppercase placeholder:normal-case placeholder:not-italic"
                  />
                  <Button
                    variant="outline"
                    onClick={handleValidateCoupon}
                    disabled={!coupon.trim() || validatingCoupon || couponDiscount != null}
                  >
                    {couponDiscount != null ? "Applied" : validatingCoupon ? "Checking…" : "Apply"}
                  </Button>
                </div>
                {couponError && (
                  <p className="font-mono text-xs text-destructive">{couponError}</p>
                )}

                <Separator />

                {/* Totals */}
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({couponDiscount}%)</span>
                      <span className="font-mono">−${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-foreground">
                    <span>Total</span>
                    <span className="font-mono">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={checkingOut}
                  onClick={handleCheckout}
                >
                  {checkingOut ? "Placing order…" : "Pay now"}
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
