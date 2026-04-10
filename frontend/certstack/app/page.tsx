"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Icons } from "@/components/icons"

const SparklesIcon = Icons.sparkles
const TargetIcon = Icons.practice
const BookOpenIcon = Icons.materials
const TrophyIcon = Icons.trophy
const CheckIcon = Icons.check

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const floatVariants = {
  initial: { y: 0 },
  animate: { 
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
}

// ============================================================================
// FEATURE CARDS
// ============================================================================

const features = [
  {
    icon: TargetIcon,
    title: "Adaptive Practice",
    description: "Questions that evolve with your skill level for optimal learning retention.",
    color: "primary"
  },
  {
    icon: BookOpenIcon,
    title: "Curated Library",
    description: "Expert-crafted content spanning FE, PE, and AWS exam prep.",
    color: "accent"
  },
  {
    icon: TrophyIcon,
    title: "Track Progress",
    description: "Visual insights into your learning journey with detailed analytics.",
    color: "chart-3"
  }
]

// ============================================================================
// STATS
// ============================================================================

const stats = [
  { value: "500+", label: "Questions" },
  { value: "12", label: "Topics" },
  { value: "98%", label: "Accuracy Rate" },
]

// ============================================================================
// MAIN HOME PAGE
// ============================================================================

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <SparklesIcon className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-foreground">
                  CertStack
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/practice">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 glow-primary hover:shadow-lg"
              >
                Start Practice
              </motion.button>
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <motion.div 
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Elevate Your Technical Skills</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
          >
                Master FE, PE, and AWS exams with{" "}
                <span className="text-gradient-brand">guided practice</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty"
          >
                Practice real exam-style questions, get step-by-step tutor guidance, and track your progress by topic.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/practice">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 glow-primary hover:shadow-xl"
              >
                <TargetIcon className="h-5 w-5" />
                    Start Practice Session
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-12 items-center gap-2 rounded-xl border-2 border-border px-8 text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted-foreground/40 hover:bg-secondary"
            >
              <BookOpenIcon className="h-5 w-5" />
              Explore Library
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="relative z-10 border-y border-border bg-card/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Designed for Mastery
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every interaction is crafted to optimize your learning experience.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="group h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 elevation-1 hover:elevation-2"
              >
                <motion.div 
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}/10`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                </motion.div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                      FE, PE, and AWS-aligned practice built for exam readiness.
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-primary p-8 text-center sm:p-12 lg:p-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Level Up?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
                  Build exam confidence through guided problem solving, not answer dumping.
            </p>
            <Link href="/practice">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-background px-8 text-sm font-semibold text-foreground shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <CheckIcon className="h-5 w-5" />
                Start Your Journey
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <SparklesIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">CertStack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Crafted with care for developers who demand excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
