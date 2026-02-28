"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  Settings,
  BookOpen,
  LogOut,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/practice", icon: FileText },
  { label: "Mock Exams", href: "/exams", icon: ClipboardList },
  { label: "Resources", href: "/materials", icon: BookOpen },
]

const bottomNavItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    // Clear auth cookies/tokens here
    router.push("/")
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] px-4 py-6">
      {/* Logo with gradient */}
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-3 transition-opacity hover:opacity-80">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
          style={{
            background: "linear-gradient(to bottom right, hsl(var(--primary-500)), hsl(var(--primary-600)))"
          }}
        >
          <BookOpen className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <span className="text-lg font-bold text-[hsl(var(--text-primary))]">CertStack</span>
      </Link>

      {/* Main Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[hsl(var(--pastel-blue))] text-[hsl(var(--primary-600))] font-semibold"
                  : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--background-hover))] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="flex flex-col gap-1 border-t border-[hsl(var(--border-light))] pt-4">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[hsl(var(--pastel-blue))] text-[hsl(var(--primary-600))] font-semibold"
                  : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--background-hover))] hover:text-[hsl(var(--text-primary))]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-150 hover:bg-[hsl(var(--background-hover))] hover:text-[hsl(var(--text-primary))]"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          Log Out
        </button>
      </div>
    </aside>
  )
}
