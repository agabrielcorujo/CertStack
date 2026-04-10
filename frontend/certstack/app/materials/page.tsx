"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"
import { useCertificationFocus } from "@/lib/certification-focus"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

const categories = [
  { id: "all", label: "All Topics", count: 48 },
  { id: "frontend", label: "Frontend", count: 18 },
  { id: "backend", label: "Backend", count: 12 },
  { id: "databases", label: "Databases", count: 8 },
  { id: "devops", label: "DevOps", count: 6 },
  { id: "system-design", label: "System Design", count: 4 },
]

const materials = [
  {
    id: 1,
    title: "React Hooks Deep Dive",
    description: "Master useState, useEffect, useContext and custom hooks with practical examples.",
    category: "frontend",
    questions: 45,
    progress: 78,
    difficulty: "Intermediate",
    tags: ["React", "Hooks", "State Management"],
    updated: "2 days ago",
    color: "bg-primary",
  },
  {
    id: 2,
    title: "TypeScript Generics",
    description: "Learn to write flexible, reusable code with TypeScript generic types and constraints.",
    category: "frontend",
    questions: 32,
    progress: 65,
    difficulty: "Advanced",
    tags: ["TypeScript", "Generics", "Types"],
    updated: "1 week ago",
    color: "bg-accent",
  },
  {
    id: 3,
    title: "SQL Query Optimization",
    description: "Improve database performance with indexing, query planning, and execution analysis.",
    category: "databases",
    questions: 28,
    progress: 90,
    difficulty: "Advanced",
    tags: ["SQL", "PostgreSQL", "Performance"],
    updated: "3 days ago",
    color: "bg-chart-3",
  },
  {
    id: 4,
    title: "REST API Design",
    description: "Best practices for designing scalable and maintainable RESTful APIs.",
    category: "backend",
    questions: 36,
    progress: 42,
    difficulty: "Intermediate",
    tags: ["REST", "API", "HTTP"],
    updated: "5 days ago",
    color: "bg-chart-4",
  },
  {
    id: 5,
    title: "Docker Fundamentals",
    description: "Containerize applications, manage images, and orchestrate with Docker Compose.",
    category: "devops",
    questions: 24,
    progress: 30,
    difficulty: "Beginner",
    tags: ["Docker", "Containers", "DevOps"],
    updated: "1 day ago",
    color: "bg-chart-5",
  },
  {
    id: 6,
    title: "System Design Patterns",
    description: "Learn scalability patterns, caching strategies, and distributed system concepts.",
    category: "system-design",
    questions: 20,
    progress: 15,
    difficulty: "Advanced",
    tags: ["Architecture", "Scalability", "Patterns"],
    updated: "2 weeks ago",
    color: "bg-primary",
  },
  {
    id: 7,
    title: "Node.js Event Loop",
    description: "Understand asynchronous programming, callbacks, promises, and async/await.",
    category: "backend",
    questions: 22,
    progress: 55,
    difficulty: "Intermediate",
    tags: ["Node.js", "Async", "JavaScript"],
    updated: "4 days ago",
    color: "bg-accent",
  },
  {
    id: 8,
    title: "CSS Grid & Flexbox",
    description: "Master modern CSS layout techniques for responsive web design.",
    category: "frontend",
    questions: 30,
    progress: 88,
    difficulty: "Beginner",
    tags: ["CSS", "Layout", "Responsive"],
    updated: "6 days ago",
    color: "bg-chart-3",
  },
]

// ============================================================================
// MATERIALS PAGE
// ============================================================================

export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const { primaryCertification } = useCertificationFocus()

  const filteredMaterials = materials.filter((material) => {
    const matchesCategory = activeCategory === "all" || material.category === activeCategory
    const matchesSearch =
      searchQuery === "" ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

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
                <Icons.materials className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Materials Library
                </h1>
              </div>
              <p className="text-muted-foreground">
                {primaryCertification
                  ? `Focused for ${primaryCertification.label}: explore topics and track your progress`
                  : "Explore topics and track your learning progress"}
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icons.search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search topics, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 rounded-xl bg-secondary/50 border-border focus:bg-background transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-11 w-11 rounded-xl"
              >
                <Icons.grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-11 w-11 rounded-xl"
              >
                <Icons.list className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {category.label}
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    activeCategory === category.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {category.count}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Materials Grid/List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${viewMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}
            >
              {filteredMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {viewMode === "grid" ? (
                    <Link href={`/practice?topic=${material.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="group h-full rounded-2xl border border-border bg-card p-6 elevation-1 hover:elevation-2 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                      >
                        {/* Color accent bar */}
                        <div className={cn("h-1 w-12 rounded-full mb-4", material.color)} />
                        
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {material.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 text-xs",
                              material.difficulty === "Beginner" && "border-chart-3/30 text-chart-3",
                              material.difficulty === "Intermediate" && "border-chart-4/30 text-chart-4",
                              material.difficulty === "Advanced" && "border-accent/30 text-accent"
                            )}
                          >
                            {material.difficulty}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {material.description}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {material.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{material.questions} questions</span>
                            <span className="font-medium text-foreground">{material.progress}%</span>
                          </div>
                          <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${material.progress}%` }}
                              transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                              className={cn("absolute inset-y-0 left-0 rounded-full", material.color)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ) : (
                    <Link href={`/practice?topic=${material.id}`}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 elevation-1 hover:elevation-2 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                      >
                        {/* Color indicator */}
                        <div className={cn("h-12 w-1 rounded-full shrink-0", material.color)} />
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {material.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 text-xs",
                                material.difficulty === "Beginner" && "border-chart-3/30 text-chart-3",
                                material.difficulty === "Intermediate" && "border-chart-4/30 text-chart-4",
                                material.difficulty === "Advanced" && "border-accent/30 text-accent"
                              )}
                            >
                              {material.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {material.questions} questions · Updated {material.updated}
                          </p>
                        </div>
                        
                        {/* Progress */}
                        <div className="hidden sm:flex items-center gap-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{material.progress}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={cn("h-full rounded-full transition-all", material.color)}
                                style={{ width: `${material.progress}%` }}
                              />
                            </div>
                          </div>
                          <Icons.chevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredMaterials.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
                <Icons.search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No materials found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("all")
                }}
                className="mt-4 rounded-xl"
              >
                <Icons.reset className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  )
}
