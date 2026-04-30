"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { useCertificationFocus } from "@/lib/certification-focus"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppHeader } from "@/components/app-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Navigation items with Games added
const navItems = [
  { icon: Icons.dashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Icons.materials, label: "Materials", href: "/materials" },
  { icon: Icons.practice, label: "Practice", href: "/practice" },
  { icon: Icons.gamepad, label: "Games", href: "/games" },
  { icon: Icons.profile, label: "Profile", href: "/profile" },
]

// Sidebar Component
function Sidebar({ className, pathname, isCollapsed, onToggle }: { className?: string; pathname: string; isCollapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <motion.div 
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shrink-0"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icons.sparkles className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold tracking-tight text-sidebar-foreground"
          >
            CertStack
          </motion.span>
        )}
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Icons.chevronRight className="h-4 w-4" />
          ) : (
            <Icons.chevronLeft className="h-4 w-4" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1.5" role="navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.label}>
                <Link href={item.href} title={isCollapsed ? item.label : ""}>
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && item.label}
                    {!isCollapsed && isActive && (
                      <motion.div 
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                        layoutId="nav-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings Link */}
      <div className="border-t border-sidebar-border p-4">
        <Link href="/settings" title={isCollapsed ? "Settings" : ""}>
          <motion.div
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Icons.settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && "Settings"}
          </motion.div>
        </Link>
      </div>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              title={isCollapsed ? "User menu" : ""}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="/avatar.jpg" alt="User" />
                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                  AC
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-sidebar-foreground">Alex Chen</p>
                    <p className="text-xs text-muted-foreground truncate">alex@example.com</p>
                  </div>
                  <Icons.chevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <Icons.profile className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Icons.settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center gap-2 text-destructive">
                <Icons.logout className="h-4 w-4" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

function StudyFocusBanner() {
  const { primaryCertification, selectedCertifications } = useCertificationFocus()

  return (
    <div className="border-b border-border bg-card/70 px-4 py-2 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
          <Icons.graduationCap className="h-3.5 w-3.5" />
          Study Focus
        </span>
        <span className="text-muted-foreground">{primaryCertification ? `Current: ${primaryCertification.label}` : "No certification selected yet"}</span>
        <span className="text-muted-foreground/80">{selectedCertifications.length} track{selectedCertifications.length === 1 ? "" : "s"} selected</span>
        <Link href="/profile#study-focus" className="ml-auto inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
          Manage
          <Icons.chevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

// Mobile Header
function MobileHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden">
      <div className="flex items-center gap-3">
        <motion.div 
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"
          whileHover={{ scale: 1.05 }}
        >
          <Icons.sparkles className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          CertStack
        </span>
      </div>
      <motion.button
        onClick={onMenuToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
        aria-label="Toggle menu"
      >
        <Icons.menu className="h-5 w-5" />
      </motion.button>
    </header>
  )
}

// Mobile Menu
function MobileMenu({ 
  isOpen, 
  onClose,
  pathname
}: { 
  isOpen: boolean
  onClose: () => void
  pathname: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <Icons.sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                  CertStack
                </span>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent"
                aria-label="Close menu"
              >
                <Icons.close className="h-5 w-5" />
              </motion.button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-1.5">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <motion.li 
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </motion.li>
                  )
                })}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                >
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      pathname === "/settings"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icons.settings className="h-5 w-5" />
                    Settings
                  </Link>
                </motion.li>
              </ul>
            </nav>

            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                    AC
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium text-sidebar-foreground">Alex Chen</p>
                  <p className="text-xs text-muted-foreground truncate">alex@example.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main App Layout
function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <AppHeader title="CertStack" />
      </div>
      {/* Desktop Sidebar */}
      <Sidebar 
        className="fixed inset-y-0 left-0 z-30 hidden lg:flex" 
        pathname={pathname}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Mobile Header */}
      <MobileHeader onMenuToggle={() => setMobileMenuOpen(true)} />
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
      />
      
      {/* Main Content */}
      <main className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <StudyFocusBanner />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>
}
