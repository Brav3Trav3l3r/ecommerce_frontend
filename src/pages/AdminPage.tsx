import * as React from "react"
import { RefreshCw, Tag, AlertCircle } from "lucide-react"
import { adminFetch } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type DiscountCode = {
  code: string
  userId: string
  discountPercent: number
  used: boolean
}

type Stats = {
  totalOrders: number
  totalItemsPurchased: number
  totalRevenue: number
  totalDiscountGiven: number
  discountCodes: {
    total: number
    used: number
    unused: number
    codes: DiscountCode[]
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

export function AdminPage() {
  const { logoutAdmin } = useAuth()
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState<string | null>(null)
  const [genError, setGenError] = React.useState<string | null>(null)
  const [genSuccess, setGenSuccess] = React.useState<string | null>(null)
  const [genUserId, setGenUserId] = React.useState("")

  const fetchStats = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch("/api/admin/stats")
      if (res.status === 401) {
        setError("Invalid admin key — please log in again")
        return
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json() as { data: Stats }
      setStats(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  async function handleGenerate() {
    const uid = genUserId.trim()
    if (!uid) return
    setGenerating(uid)
    setGenError(null)
    setGenSuccess(null)
    try {
      const res = await adminFetch("/api/admin/discount/generate", {
        method: "POST",
        body: JSON.stringify({ userId: uid }),
      })
      const data = await res.json() as {
        data?: { code: string; discountPercent: number }
        error?: { code?: string; message?: string }
      }
      if (!res.ok) {
        const code = data.error?.code
        setGenError(
          code === "CONDITION_NOT_MET"
            ? "Condition not met — total orders must be a non-zero multiple of N"
            : code === "CODE_ALREADY_EXISTS"
            ? "User already has an unused coupon"
            : data.error?.message ?? "Failed to generate"
        )
      } else if (data.data) {
        setGenSuccess(`${data.data.code} (${data.data.discountPercent}% off)`)
        setGenUserId("")
        void fetchStats()
      }
    } catch {
      setGenError("Request failed")
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">AETHER ™</span>
          <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Admin
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logoutAdmin}>
          Sign out
        </Button>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10 space-y-10">
        {/* Stats section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Store overview
              </p>
              <h2 className="mt-1 text-2xl font-medium tracking-tight text-foreground">
                Stats
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
              aria-label="Refresh stats"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="font-mono text-sm text-destructive">{error}</p>
            </div>
          )}

          {loading && !stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-muted" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total orders" value={String(stats.totalOrders)} />
              <StatCard label="Items sold" value={String(stats.totalItemsPurchased)} />
              <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
              <StatCard label="Discounts given" value={`$${stats.totalDiscountGiven.toFixed(2)}`} />
            </div>
          ) : null}
        </section>

        <Separator />

        {/* Coupons section */}
        {stats && (
          <section>
            <div className="mb-6">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Discount codes
              </p>
              <h2 className="mt-1 text-2xl font-medium tracking-tight text-foreground">
                Coupons
              </h2>
            </div>

            {/* Summary pills */}
            <div className="mb-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                Total: {stats.discountCodes.total}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-green-600 dark:text-green-400">
                Unused: {stats.discountCodes.unused}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground/60">
                Used: {stats.discountCodes.used}
              </span>
            </div>

            {/* Generate form */}
            <div className="mb-6 rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-sm font-medium text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Generate coupon for user
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="User ID (e.g. user-1)"
                  value={genUserId}
                  onChange={(e) => {
                    setGenUserId(e.target.value)
                    setGenError(null)
                    setGenSuccess(null)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 font-mono text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="User ID for coupon generation"
                />
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={!genUserId.trim() || generating !== null}
                >
                  {generating ? "Generating…" : "Generate"}
                </Button>
              </div>
              {genError && (
                <p className="mt-2 font-mono text-xs text-destructive">{genError}</p>
              )}
              {genSuccess && (
                <p className="mt-2 font-mono text-xs text-green-600 dark:text-green-400">
                  Generated: {genSuccess}
                </p>
              )}
            </div>

            {/* Codes table */}
            {stats.discountCodes.codes.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.discountCodes.codes.map((c) => (
                      <tr key={c.code} className="bg-card">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {c.code}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {c.userId}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {c.discountPercent}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              c.used
                                ? "font-mono text-xs text-muted-foreground/50"
                                : "font-mono text-xs text-green-600 dark:text-green-400"
                            }
                          >
                            {c.used ? "used" : "active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No coupons generated yet.</p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
