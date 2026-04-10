"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

// Available exams
const exams = [
  { id: "aws-saa", name: "AWS Solutions Architect", icon: "cloud", questions: 150, color: "bg-chart-4" },
  { id: "aws-dev", name: "AWS Developer Associate", icon: "code", questions: 120, color: "bg-chart-4" },
  { id: "fe-civil", name: "FE Civil Engineering", icon: "building", questions: 200, color: "bg-primary" },
  { id: "fe-mechanical", name: "FE Mechanical", icon: "cog", questions: 180, color: "bg-primary" },
  { id: "pe-mechanical", name: "PE Mechanical", icon: "award", questions: 250, color: "bg-accent" },
  { id: "pe-civil", name: "PE Civil", icon: "building", questions: 220, color: "bg-accent" },
]

// Topics per exam (simplified)
const topicsByExam: Record<string, { id: string; name: string; questions: number }[]> = {
  "aws-saa": [
    { id: "compute", name: "Compute Services", questions: 25 },
    { id: "storage", name: "Storage Solutions", questions: 20 },
    { id: "networking", name: "Networking & CDN", questions: 22 },
    { id: "database", name: "Database Services", questions: 18 },
    { id: "security", name: "Security & IAM", questions: 30 },
    { id: "architecture", name: "Architecture Design", questions: 35 },
  ],
  "aws-dev": [
    { id: "deployment", name: "Deployment", questions: 20 },
    { id: "serverless", name: "Serverless", questions: 25 },
    { id: "debugging", name: "Debugging", questions: 15 },
    { id: "apis", name: "APIs & Integration", questions: 30 },
  ],
  "fe-civil": [
    { id: "statics", name: "Statics", questions: 35 },
    { id: "dynamics", name: "Dynamics", questions: 25 },
    { id: "mechanics", name: "Mechanics of Materials", questions: 40 },
    { id: "hydraulics", name: "Hydraulics", questions: 30 },
    { id: "geotechnical", name: "Geotechnical", questions: 35 },
    { id: "structures", name: "Structural Analysis", questions: 35 },
  ],
  "fe-mechanical": [
    { id: "thermodynamics", name: "Thermodynamics", questions: 40 },
    { id: "fluids", name: "Fluid Mechanics", questions: 35 },
    { id: "heat-transfer", name: "Heat Transfer", questions: 30 },
    { id: "materials", name: "Materials Science", questions: 25 },
  ],
  "pe-mechanical": [
    { id: "hvac", name: "HVAC & Refrigeration", questions: 50 },
    { id: "machine-design", name: "Machine Design", questions: 60 },
    { id: "thermal", name: "Thermal & Fluids", questions: 70 },
  ],
  "pe-civil": [
    { id: "structural", name: "Structural Engineering", questions: 55 },
    { id: "transportation", name: "Transportation", questions: 50 },
    { id: "water", name: "Water Resources", questions: 60 },
    { id: "construction", name: "Construction", questions: 55 },
  ],
}

// Practice modes
const modes = [
  { 
    id: "practice", 
    name: "Practice Mode", 
    description: "Standard practice with AI hints available",
    icon: Icons.practice,
    color: "bg-primary",
  },
  { 
    id: "timed", 
    name: "Timed Mode", 
    description: "Simulated exam timing (90 seconds/question)",
    icon: Icons.clock,
    color: "bg-accent",
  },
  { 
    id: "review", 
    name: "Review Mode", 
    description: "Focus on previously incorrect answers",
    icon: Icons.refresh,
    color: "bg-chart-3",
  },
]

export default function PracticeSetupPage() {
  const router = useRouter()
  const [selectedExam, setSelectedExam] = React.useState<string | null>(null)
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([])
  const [selectedMode, setSelectedMode] = React.useState("practice")
  const [questionCount, setQuestionCount] = React.useState(20)

  const availableTopics = selectedExam ? topicsByExam[selectedExam] || [] : []
  const totalAvailable = selectedTopics.length > 0
    ? availableTopics.filter(t => selectedTopics.includes(t.id)).reduce((sum, t) => sum + t.questions, 0)
    : availableTopics.reduce((sum, t) => sum + t.questions, 0)

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([])
    } else {
      setSelectedTopics(availableTopics.map(t => t.id))
    }
  }

  const handleStartPractice = () => {
    // Build query params
    const params = new URLSearchParams({
      exam: selectedExam || "",
      mode: selectedMode,
      count: questionCount.toString(),
    })
    if (selectedTopics.length > 0) {
      params.set("topics", selectedTopics.join(","))
    }
    router.push(`/practice?${params.toString()}`)
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Icons.arrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to dashboard</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Practice Setup
              </h1>
              <p className="mt-1 text-muted-foreground">
                Configure your practice session
              </p>
            </div>
          </motion.div>

          {/* Step 1: Select Exam */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </div>
              <h2 className="text-lg font-semibold text-foreground">Select Exam</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <motion.button
                  key={exam.id}
                  onClick={() => {
                    setSelectedExam(exam.id)
                    setSelectedTopics([])
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                    selectedExam === exam.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", exam.color)}>
                    <Icons.fileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{exam.name}</p>
                    <p className="text-sm text-muted-foreground">{exam.questions} questions</p>
                  </div>
                  {selectedExam === exam.id && (
                    <Icons.checkCircle className="h-5 w-5 text-primary shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Step 2: Select Topics (if exam selected) */}
          {selectedExam && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Select Topics</h2>
                  <span className="text-sm text-muted-foreground">(optional)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllTopics}
                  className="text-sm"
                >
                  {selectedTopics.length === availableTopics.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableTopics.map((topic) => (
                  <motion.button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200",
                      selectedTopics.includes(topic.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        selectedTopics.includes(topic.id)
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}>
                        {selectedTopics.includes(topic.id) && (
                          <Icons.check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{topic.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{topic.questions} Q</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Mode */}
          {selectedExam && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  3
                </div>
                <h2 className="text-lg font-semibold text-foreground">Select Mode</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {modes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200",
                      selectedMode === mode.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", mode.color)}>
                      <mode.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{mode.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                    {selectedMode === mode.id && (
                      <Icons.checkCircle className="h-5 w-5 text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Question Count */}
          {selectedExam && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  4
                </div>
                <h2 className="text-lg font-semibold text-foreground">Number of Questions</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 50, 100].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={count > totalAvailable}
                    className={cn(
                      "rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200",
                      questionCount === count
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-foreground hover:bg-secondary/80",
                      count > totalAvailable && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {count}
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalAvailable} questions available
                {selectedTopics.length > 0 && ` from ${selectedTopics.length} selected topic${selectedTopics.length > 1 ? "s" : ""}`}
              </p>
            </motion.div>
          )}

          {/* Start Button */}
          {selectedExam && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={handleStartPractice}
                size="lg"
                className="rounded-xl px-8 glow-primary"
              >
                Start Practice Session
                <Icons.arrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  )
}
