"use client"

import * as React from "react"
import { Icons } from "@/components/icons"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Toggle between light and dark; preserve system via resolvedTheme when unmounted
    const current = resolvedTheme || theme
    if (current === "dark") setTheme("light")
    else setTheme("dark")
  }

  // Keyboard shortcut: press 't' to toggle theme
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t" && (e.ctrlKey === false && e.metaKey === false && e.altKey === false)) {
        toggleTheme()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [resolvedTheme, theme])

  const router = useRouter()
  const { toast } = useToast()

  const STORAGE_KEY = "certstack.notifications"

  const defaultNotifications = [
    { id: 1, title: "Achievement unlocked", body: "You earned Perfect Score", icon: "sparkles", ts: new Date().toISOString(), read: false },
    { id: 2, title: "New material", body: "New TypeScript practice added", icon: "materials", ts: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: false },
  ]

  const [notifications, setNotifications] = React.useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore
    }
    return defaultNotifications
  })

  const save = (next: any[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      // ignore
    }
    setNotifications(next)
  }

  const markRead = (id: number) => {
    const next = notifications.map((n: any) => n.id === id ? { ...n, read: true } : n)
    save(next)
  }

  const dismiss = (id: number) => {
    const next = notifications.filter((n: any) => n.id !== id)
    save(next)
  }

  const unreadCount = notifications.filter((n: any) => !n.read).length

  React.useEffect(() => {
    // ensure badge updates when localStorage changes elsewhere
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY)
          if (raw) setNotifications(JSON.parse(raw))
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme (press t)"
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-secondary"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Icons.moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Icons.sun className="h-5 w-5 text-muted-foreground" />
            )
          ) : (
            <Icons.sun className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        {/* Live region for assistive tech to announce theme changes */}
        <span aria-live="polite" className="sr-only">
          {mounted ? `Theme: ${resolvedTheme || theme}` : ""}
        </span>
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-xl border border-transparent bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-border focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-secondary"
              aria-label="Notifications"
            >
              <Icons.bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-card">
                  {unreadCount}
                </span>
              ) : (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-card bg-muted" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={8} align="end" className="w-96">
            <div className="px-3 py-2 flex items-center justify-between">
              <p className="text-sm font-medium">Notifications</p>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => save(notifications.map((n: any) => ({ ...n, read: true })))}
                >
                  Mark all read
                </button>
                <Link href="/settings#notifications" className="text-sm font-medium text-primary hover:underline">View all</Link>
              </div>
            </div>
            <DropdownMenuSeparator />

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((n: any) => (
                  <div key={n.id} className={"px-3 py-3 border-b last:border-b-0"}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {n.icon === 'sparkles' && <Icons.sparkles className="h-5 w-5 text-accent" />}
                        {n.icon === 'materials' && <Icons.materials className="h-5 w-5 text-primary" />}
                        {n.icon === 'trophy' && <Icons.trophy className="h-5 w-5 text-accent" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.body}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(n.ts).toLocaleString()}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          {!n.read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-xs text-primary hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => dismiss(n.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void router.push("/profile")}
            aria-label="Open profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            JD
          </button>
          <div
            role="button"
            onClick={() => void router.push("/profile")}
            className="hidden lg:block cursor-pointer"
          >
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}
