"use client"



import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"
import { getErrorMessage, getJson } from "@/lib/api"
import { useCertificationFocus } from "@/lib/certification-focus"

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

const mockStats = [
  {
    label: "Current Streak",
    value: "12",
    unit: "days",
    icon: Icons.flame,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Questions Practiced",
    value: "247",
    unit: "total",
    icon: Icons.practice,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Accuracy Rate",
    value: "84",
    unit: "%",
    icon: Icons.trendingUp,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    label: "Time Practiced",
    value: "18.5",
    unit: "hrs",
    icon: Icons.clock,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

const mockRecentTopics = [
  { name: "React Hooks", progress: 78, questions: 24, color: "bg-primary" },
  { name: "TypeScript Generics", progress: 65, questions: 18, color: "bg-accent" },
  { name: "System Design", progress: 42, questions: 12, color: "bg-chart-3" },
  { name: "SQL Queries", progress: 90, questions: 30, color: "bg-chart-4" },
]

const upcomingReviews = [
  { topic: "React useEffect", dueIn: "Today", questions: 5, urgency: "high" },
  { topic: "Promise.all patterns", dueIn: "Tomorrow", questions: 3, urgency: "medium" },
  { topic: "CSS Grid layouts", dueIn: "In 3 days", questions: 8, urgency: "low" },
]

const achievements = [
  { name: "First Steps", description: "Complete your first practice session", earned: true, icon: Icons.sparkles },
  { name: "Week Warrior", description: "Practice for 7 consecutive days", earned: true, icon: Icons.flame },
  { name: "Century Club", description: "Answer 100 questions correctly", earned: true, icon: Icons.trophy },
  { name: "Speed Demon", description: "Complete a session in under 5 minutes", earned: false, icon: Icons.zap },
]

interface ProfileCertification {
  cert: string
  correctqnum: number
  incorrectqnum: number
  accuracy: number
  attempts: number
}

interface ProfileResponse {
  name: string
  certs: ProfileCertification[]
  totals: {
    correct: number
    incorrect: number
    attempts: number
    accuracy: number
  }
}

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const { primaryCertification } = useCertificationFocus()
  const [profile, setProfile] = React.useState<ProfileResponse | null>(null)
  const [profileError, setProfileError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const token = window.localStorage.getItem("certstack_access_token")
    if (!token) {
      setProfileError("Sign in to load your live dashboard data.")
      return
    }

    let active = true

    async function loadProfile() {
      try {
        const result = await getJson<ProfileResponse>("/profile", undefined, token)
        if (!active) return
        setProfile(result)
        setProfileError(null)
      } catch (error) {
        if (!active) return
        setProfile(null)
        setProfileError(getErrorMessage(error))
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])

  const dashboardStats = profile
    ? [
        {
          label: "Questions Practiced",
          value: String(profile.totals.attempts),
          unit: "total",
          icon: Icons.practice,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          label: "Accuracy Rate",
          value: String(profile.totals.accuracy),
          unit: "%",
          icon: Icons.trendingUp,
          color: "text-chart-3",
          bgColor: "bg-chart-3/10",
        },
        {
          label: "Certifications",
          value: String(profile.certs.length),
          unit: "active",
          icon: Icons.graduationCap,
          color: "text-accent",
          bgColor: "bg-accent/10",
        },
        {
          label: "Correct Answers",
          value: String(profile.totals.correct),
          unit: "total",
          icon: Icons.checkCircle,
          color: "text-chart-4",
          bgColor: "bg-chart-4/10",
        },
      ]
    : mockStats

  const dashboardRecentTopics = profile
    ? profile.certs.slice(0, 4).map((cert, index) => ({
        name: cert.cert.toUpperCase(),
        progress: cert.accuracy,
        questions: cert.attempts,
        color: ["bg-primary", "bg-accent", "bg-chart-3", "bg-chart-4"][index % 4],
      }))
    : mockRecentTopics

  const dashboardName = profile?.name ?? "Jane"
  const dashboardMessage = profile
    ? `You have ${profile.totals.attempts} answered questions across ${profile.certs.length} certification areas.`
    : primaryCertification
      ? `You are focused on ${primaryCertification.label}. Keep your momentum going.`
      : "Set your certification focus from Profile to personalize your study plan."

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {dashboardName}
              </h1>
              <p className="mt-1 text-muted-foreground">{dashboardMessage}</p>
            </div>
            <Link href="/practice">
              <Button className="h-11 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-200">
                <Icons.play className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            </Link>
          </motion.div>

          {profileError && (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground elevation-1"
            >
              {profileError}
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-border bg-card p-6 elevation-1 hover:elevation-2 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.unit}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Topics */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 elevation-1 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Topics</h2>
                <Link href="/materials" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  View all
                </Link>
              </div>
              <div className="space-y-5">
                {dashboardRecentTopics.map((topic, index) => (
                  <motion.div
                    key={topic.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {topic.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topic.questions} questions
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] as const }}
                        className={cn("absolute inset-y-0 left-0 rounded-full", topic.color)}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{topic.progress}% complete</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Reviews */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 elevation-1"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Due for Review</h2>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                  {upcomingReviews.length}
                </div>
              </div>
              <div className="space-y-3">
                {upcomingReviews.map((review, index) => (
                  <motion.div
                    key={review.topic}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="group cursor-pointer rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {review.topic}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {review.questions} questions
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          review.urgency === "high" && "bg-destructive/10 text-destructive",
                          review.urgency === "medium" && "bg-chart-4/10 text-chart-4",
                          review.urgency === "low" && "bg-chart-3/10 text-chart-3"
                        )}
                      >
                        {review.dueIn}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full rounded-xl border-border hover:bg-secondary/50"
              >
                Start Review Session
              </Button>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-6 elevation-1"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
              <Link href="/profile" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
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
                  <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.earned && (
                    <div className="absolute right-3 top-3">
                      <Icons.checkCircle className="h-4 w-4 text-chart-3" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
            <Link href="/practice">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 elevation-1 hover:border-primary/20 hover:glow-primary transition-all duration-300 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icons.practice className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Quick Practice
                  </p>
                  <p className="text-xs text-muted-foreground">10 random questions</p>
                </div>
                <Icons.chevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>
            <Link href="/materials">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 elevation-1 hover:border-accent/20 hover:glow-accent transition-all duration-300 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Icons.materials className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    Browse Materials
                  </p>
                  <p className="text-xs text-muted-foreground">Explore new topics</p>
                </div>
                <Icons.chevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>
            <Link href="/profile">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 elevation-1 hover:border-chart-3/20 transition-all duration-300 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <Icons.barChart className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-chart-3 transition-colors">
                    View Progress
                  </p>
                  <p className="text-xs text-muted-foreground">Track your growth</p>
                </div>
                <Icons.chevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-chart-3 group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
