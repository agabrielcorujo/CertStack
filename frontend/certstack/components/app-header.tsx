"use client"

import * as React from "react"
import { Icons } from "@/components/icons"
import { useTheme } from "next-themes"

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
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-secondary"
          aria-label="Notifications"
        >
          <Icons.bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-card bg-destructive" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            JD
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}
