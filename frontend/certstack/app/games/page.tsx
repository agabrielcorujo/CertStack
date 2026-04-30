"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"
import { useCertificationFocus } from "@/lib/certification-focus"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// Game modes
const games = [
  {
    id: "speed",
    name: "Speed Round",
    description: "Race against the clock! Answer as many questions as you can in 60 seconds. Build streaks for bonus points.",
    icon: Icons.zap,
    color: "bg-accent",
    href: "/games/speed",
    stats: { bestScore: 1250, totalPlays: 47 },
    features: ["60 second rounds", "Streak multipliers", "Quick feedback"],
  },
  {
    id: "sprint",
    name: "Exam Sprint",
    description: "Simulate real exam conditions with a timed mini-exam. No hints, no retries - pure exam practice.",
    icon: Icons.timer,
    color: "bg-primary",
    href: "/games/sprint",
    stats: { bestScore: 85, totalPlays: 23 },
    features: ["15 question sets", "Exam-like timing", "Detailed results"],
  },
  {
    id: "ladder",
    name: "Topic Ladder",
    description: "Climb through difficulty levels. Master each tier to unlock the next and prove your expertise.",
    icon: Icons.trendingUp,
    color: "bg-chart-3",
    href: "/games/ladder",
    stats: { currentLevel: 4, maxLevel: 10 },
    features: ["Progressive difficulty", "Unlock system", "Topic mastery"],
  },
]

// Leaderboard data (mock)
const leaderboard = [
  { rank: 1, name: "Alex C.", score: 2450, game: "Speed Round" },
  { rank: 2, name: "Jordan M.", score: 2280, game: "Speed Round" },
  { rank: 3, name: "Sam K.", score: 2150, game: "Speed Round" },
]

export default function GamesPage() {
  const { primaryCertification } = useCertificationFocus()

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
              <div className="flex items-center gap-2 mb-1">
                <Icons.gamepad className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Study Games
                </h1>
              </div>
              <p className="text-muted-foreground">
                {primaryCertification
                  ? `Train for ${primaryCertification.label} with competitive game modes`
                  : "Make learning fun with competitive game modes"}
              </p>
            </div>
          </motion.div>

          {/* Game Cards */}
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 elevation-1 hover:elevation-3 transition-all duration-300">
                  {/* Gradient background decoration */}
                  <div className={cn(
                    "absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30",
                    game.color
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl mb-5",
                    game.color
                  )}>
                    <game.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-foreground mb-2">{game.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {game.description}
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {game.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-5 text-sm">
                      {"bestScore" in game.stats && (
                        <div>
                          <span className="text-muted-foreground">Best: </span>
                          <span className="font-semibold text-foreground">{game.stats.bestScore}</span>
                        </div>
                      )}
                      {"currentLevel" in game.stats && (
                        <div>
                          <span className="text-muted-foreground">Level: </span>
                          <span className="font-semibold text-foreground">{game.stats.currentLevel}/{game.stats.maxLevel}</span>
                        </div>
                      )}
                      {"totalPlays" in game.stats && (
                        <div>
                          <span className="text-muted-foreground">Plays: </span>
                          <span className="font-semibold text-foreground">{game.stats.totalPlays}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Play Button */}
                    <Link href={game.href}>
                      <Button className="w-full rounded-xl glow-primary group-hover:shadow-lg transition-shadow">
                        <Icons.play className="mr-2 h-4 w-4" />
                        Play Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Section: Leaderboard & Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Leaderboard */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-border bg-card p-6 elevation-1">
                  <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Icons.trophy className="h-5 w-5 text-chart-4" />
                    <h3 className="text-lg font-semibold text-foreground">Top Players</h3>
                  </div>
                  <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="text-sm text-primary">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-4 rounded-xl bg-secondary/50 p-3"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        player.rank === 1 && "bg-chart-4 text-primary-foreground",
                        player.rank === 2 && "bg-muted text-foreground",
                        player.rank === 3 && "bg-accent/50 text-accent-foreground"
                      )}>
                        {player.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.game}</p>
                      </div>
                      <p className="font-semibold text-foreground">{player.score.toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Personal Stats */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-border bg-card p-6 elevation-1">
                <div className="flex items-center gap-2 mb-5">
                  <Icons.barChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Your Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">73</p>
                    <p className="text-sm text-muted-foreground">Total Games</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">2,450</p>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">78%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Goal</span>
                    <span className="font-medium text-foreground">4/5 games</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
