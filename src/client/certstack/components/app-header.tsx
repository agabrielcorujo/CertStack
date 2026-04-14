"use client"

import { Bell, Search } from "lucide-react"

interface AppHeaderProps {
  title: string
  subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] px-8">
      <div>
        <h1 className="text-xl font-semibold text-[hsl(var(--text-primary))]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[hsl(var(--text-secondary))]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-64 rounded-xl border border-transparent bg-[hsl(var(--surface))] pl-10 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[hsl(var(--border))] focus:bg-[hsl(var(--surface-elevated))] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 hover:bg-[hsl(var(--surface))]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-[hsl(var(--text-secondary))]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[hsl(var(--surface-elevated))] bg-[#EF4444]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-semibold text-[#3D6EE8]">
            JD
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">John Doe</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}
