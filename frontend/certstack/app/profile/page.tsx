"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CERTIFICATION_OPTIONS, useCertificationFocus } from "@/lib/certification-focus"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

// ============================================================================
// MOCK DATA
// ============================================================================

const stats = [
  { label: "Questions Answered", value: "1,247" },
  { label: "Accuracy Rate", value: "84%" },
  { label: "Current Streak", value: "12 days" },
  { label: "Total Study Time", value: "48h 32m" },
]

const achievements = [
  { id: 1, name: "First Steps", description: "Complete your first practice session", icon: Icons.sparkles, earned: true, date: "Mar 15, 2024" },
  { id: 2, name: "Week Warrior", description: "Practice for 7 consecutive days", icon: Icons.flame, earned: true, date: "Mar 22, 2024" },
  { id: 3, name: "Century Club", description: "Answer 100 questions correctly", icon: Icons.trophy, earned: true, date: "Mar 28, 2024" },
  { id: 4, name: "Speed Demon", description: "Complete a session in under 5 minutes", icon: Icons.zap, earned: true, date: "Apr 2, 2024" },
  { id: 5, name: "Perfect Score", description: "Get 100% on a 10+ question session", icon: Icons.star, earned: true, date: "Apr 5, 2024" },
  { id: 6, name: "Knowledge Master", description: "Complete all questions in a topic", icon: Icons.graduationCap, earned: false, date: null },
  { id: 7, name: "Consistency King", description: "Practice for 30 consecutive days", icon: Icons.calendar, earned: false, date: null },
  { id: 8, name: "The Scholar", description: "Answer 1000 questions correctly", icon: Icons.materials, earned: false, date: null },
]

const activityLog = [
  { date: "Today", items: [
    { type: "practice", description: "Completed React Hooks practice session", result: "8/10 correct", time: "2 hours ago" },
    { type: "achievement", description: "Earned Perfect Score badge", result: null, time: "2 hours ago" },
  ]},
  { date: "Yesterday", items: [
    { type: "practice", description: "Completed TypeScript Generics practice session", result: "7/10 correct", time: "1 day ago" },
    { type: "practice", description: "Completed SQL Queries practice session", result: "9/10 correct", time: "1 day ago" },
  ]},
  { date: "Apr 3, 2024", items: [
    { type: "practice", description: "Completed System Design practice session", result: "6/10 correct", time: "2 days ago" },
  ]},
]

const topicProgress = [
  { name: "React Hooks", progress: 78, questionsCompleted: 156, totalQuestions: 200 },
  { name: "TypeScript", progress: 65, questionsCompleted: 98, totalQuestions: 150 },
  { name: "SQL", progress: 90, questionsCompleted: 108, totalQuestions: 120 },
  { name: "System Design", progress: 42, questionsCompleted: 42, totalQuestions: 100 },
  { name: "Node.js", progress: 55, questionsCompleted: 44, totalQuestions: 80 },
]

// ============================================================================
// PROFILE PAGE
// ============================================================================

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const {
    selectedIds,
    primaryId,
    primaryCertification,
    toggleCertification,
    setPrimaryCertification,
  } = useCertificationFocus()
  const [requestedCert, setRequestedCert] = React.useState("")
  const [requestMessage, setRequestMessage] = React.useState<string | null>(null)

  const handleRequestCertification = () => {
    const trimmed = requestedCert.trim()
    if (!trimmed) {
      setRequestMessage("Enter a certification name first.")
      return
    }
    try {
      const key = "certstack.certification-requests"
      const existing = JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[]
      const next = Array.from(new Set([...existing, trimmed]))
      window.localStorage.setItem(key, JSON.stringify(next))
      setRequestMessage(`Request saved: ${trimmed}`)
      setRequestedCert("")
    } catch {
      setRequestMessage("Could not save request. Please try again.")
    }
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Profile Header */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-border bg-card elevation-1"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src="/avatar.jpg" alt="Jane Doe" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => toast({ title: 'Change avatar', description: 'Avatar change is not available in this environment.' })}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Icons.camera className="h-4 w-4" />
                    <span className="sr-only">Change avatar</span>
                  </button>
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Jane Doe
                      </h1>
                      <p className="mt-1 text-muted-foreground">jane@example.com</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <Icons.flame className="h-3 w-3" />
                          12 day streak
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                          <Icons.trophy className="h-3 w-3" />
                          5 achievements
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-3/10 px-3 py-1 text-xs font-medium text-chart-3">
                          <Icons.trendingUp className="h-3 w-3" />
                          Top 10%
                        </span>
                      </div>
                    </div>
                    {/* Inline Edit Profile modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl">
                          <Icons.edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>Update your name and email address.</DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Full name</label>
                            <Input defaultValue="Jane Doe" className="h-11 rounded-xl bg-secondary/50 border-border" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input defaultValue="jane@example.com" type="email" className="h-11 rounded-xl bg-secondary/50 border-border" />
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={() => toast({ title: 'Profile saved', description: 'Profile changes saved locally.' })}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="rounded-xl bg-secondary/50 p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Certification Study Focus */}
          <motion.div
            id="study-focus"
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-6 elevation-1"
          >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Certification Study Focus</h2>
                <p className="text-sm text-muted-foreground">
                  Select the certifications you are actively preparing for. This focus appears across all pages.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Icons.graduationCap className="h-3.5 w-3.5" />
                {primaryCertification ? `Current: ${primaryCertification.label}` : "No current certification selected"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CERTIFICATION_OPTIONS.map((option) => {
                const isSelected = selectedIds.includes(option.id)
                const isPrimary = primaryId === option.id

                return (
                  <div
                    key={option.id}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.family}</p>
                      </div>
                      {isPrimary && <Icons.star className="h-4 w-4 text-accent" />}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="h-8 rounded-lg px-3 text-xs"
                        onClick={() => toggleCertification(option.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg px-3 text-xs text-primary hover:text-primary/80"
                        onClick={() => setPrimaryCertification(option.id)}
                      >
                        Set Current
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">Certification not listed?</p>
              <p className="mt-1 text-xs text-muted-foreground">Request a certification and we can add support for it.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={requestedCert}
                  onChange={(event) => setRequestedCert(event.target.value)}
                  placeholder="e.g., AZ-104, CISSP, CompTIA Security+"
                  className="h-9"
                />
                <Button type="button" onClick={handleRequestCertification} className="h-9 rounded-lg">
                  <Icons.send className="mr-2 h-4 w-4" />
                  Request Certification
                </Button>
              </div>
              {requestMessage && <p className="mt-2 text-xs text-muted-foreground">{requestMessage}</p>}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Topic Progress */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 elevation-1 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Topic Progress</h2>
                <Link href="/materials">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View all
                  </Button>
                </Link>
              </div>
              <div className="space-y-5">
                {topicProgress.map((topic, index) => (
                  <motion.div
                    key={topic.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{topic.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {topic.questionsCompleted}/{topic.totalQuestions} questions
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 elevation-1"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {activityLog.map((day, dayIndex) => (
                  <div key={day.date}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      {day.date}
                    </p>
                    <div className="space-y-3">
                      {day.items.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + dayIndex * 0.1 + itemIndex * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              item.type === "practice" ? "bg-primary/10" : "bg-accent/10"
                            )}
                          >
                            {item.type === "practice" ? (
                              <Icons.practice className="h-4 w-4 text-primary" />
                            ) : (
                              <Icons.trophy className="h-4 w-4 text-accent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{item.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.result && (
                                <span className="text-xs font-medium text-chart-3">{item.result}</span>
                              )}
                              <span className="text-xs text-muted-foreground">{item.time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-6 elevation-1"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievements.filter(a => a.earned).length} of {achievements.length} earned
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "relative rounded-xl border p-4 transition-all duration-300",
                    achievement.earned
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-secondary/30 opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      achievement.earned ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        "h-5 w-5",
                        achievement.earned ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">{achievement.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                  {achievement.earned && achievement.date && (
                    <p className="mt-2 text-xs text-primary">{achievement.date}</p>
                  )}
                  {achievement.earned && (
                    <div className="absolute right-3 top-3">
                      <Icons.checkCircle className="h-4 w-4 text-chart-3" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
