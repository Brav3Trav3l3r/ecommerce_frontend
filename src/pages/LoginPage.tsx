import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const USERS = [
  { id: "user-1", name: "Shopper 1" },
  { id: "user-2", name: "Shopper 2" },
  { id: "user-3", name: "Shopper 3" },
  { id: "user-4", name: "Shopper 4" },
  { id: "user-5", name: "Shopper 5" },
]

export function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          01-A. EST. 2025
        </p>
        <h1 className="mt-3 text-5xl font-medium tracking-tight text-foreground">
          AETHER ™
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Select your account to continue
        </p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => login(user.id)}
            className={cn(
              "group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6",
              "transition-colors duration-150 hover:border-foreground/30 hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:border-foreground/30">
              <span className="font-mono text-sm font-semibold">
                {user.id.split("-")[1].toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-10 font-mono text-[10px] tracking-widest text-muted-foreground/40 uppercase">
        // PIXEL PERFECT · 5K+ · EST. 2025
      </p>
    </div>
  )
}
