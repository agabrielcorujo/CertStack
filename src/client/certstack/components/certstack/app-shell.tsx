"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { BookOpen, ChartColumnBig, ClipboardCheck, LogOut, Sparkles } from "lucide-react"

import { buildDisplayName, buildInitials, clearStoredSession, getStoredSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumnBig },
  { href: "/flashcards", label: "Flashcards", icon: Sparkles },
  { href: "/exams", label: "Full Exams", icon: ClipboardCheck },
]

type AppShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  actions?: ReactNode
}

export function AppShell({ title, subtitle, children, actions }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("Learner")

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      return
    }

    setDisplayName(buildDisplayName(session))
  }, [])

  const initials = buildInitials(displayName)

  return (
    <div className="shell-grid min-h-screen">
      <aside className="shell-nav">
        <div className="space-y-8">
          <Link href="/dashboard" className="brand-lockup">
            <div className="brand-icon">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">CertStack</p>
              <h1 className="brand-title">Study with real momentum</h1>
            </div>
          </Link>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-link", active && "nav-link-active")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="user-badge">
            <div className="avatar-pill">{initials || "CS"}</div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--ink))]">{displayName}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--ink-soft))]">Cloud track</p>
            </div>
          </div>

          <button
            type="button"
            className="ghost-button w-full justify-center"
            onClick={() => {
              clearStoredSession()
              router.replace("/login")
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="shell-header">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h2 className="page-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        </header>

        <main className="shell-main">{children}</main>
      </div>
    </div>
  )
}
