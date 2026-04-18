"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"

// Sprint questions (15 questions simulating exam conditions)
const sprintQuestions = [
  { id: "sp1", text: "A company needs to store 100TB of data with infrequent access but requires millisecond retrieval. Which storage class is most cost-effective?", options: ["S3 Standard", "S3 Standard-IA", "S3 Glacier Instant Retrieval", "S3 One Zone-IA"], correct: 2 },
  { id: "sp2", text: "Which AWS service provides a managed message queue that supports both standard and FIFO queues?", options: ["Amazon SNS", "Amazon SQS", "Amazon MQ", "Amazon Kinesis"], correct: 1 },
  { id: "sp3", text: "What is the maximum number of VPCs per region by default?", options: ["3", "5", "10", "20"], correct: 1 },
  { id: "sp4", text: "A simply supported beam has a span of 10m and carries a point load of 50kN at midspan. What is the maximum bending moment?", options: ["125 kN-m", "250 kN-m", "500 kN-m", "62.5 kN-m"], correct: 0 },
  { id: "sp5", text: "The Poisson's ratio for steel is approximately:", options: ["0.15", "0.25", "0.30", "0.45"], correct: 2 },
  { id: "sp6", text: "In the elastic range, the relationship between stress and strain is:", options: ["Parabolic", "Linear", "Hyperbolic", "Exponential"], correct: 1 },
  { id: "sp7", text: "Which AWS service is best for real-time streaming data ingestion?", options: ["Amazon SQS", "Amazon Kinesis Data Streams", "Amazon EMR", "AWS Glue"], correct: 1 },
  { id: "sp8", text: "What is the purpose of a NAT Gateway in a VPC?", options: ["Route traffic between VPCs", "Allow private subnet instances to access the internet", "Filter incoming traffic", "Load balance traffic"], correct: 1 },
  { id: "sp9", text: "The moment of inertia of a rectangular section b x d about its centroidal axis parallel to b is:", options: ["bd³/12", "db³/12", "bd³/6", "bd²/12"], correct: 0 },
  { id: "sp10", text: "Which load balancer operates at Layer 7?", options: ["Network Load Balancer", "Classic Load Balancer", "Application Load Balancer", "Gateway Load Balancer"], correct: 2 },
  { id: "sp11", text: "Reynolds number is used to determine:", options: ["Fluid viscosity", "Flow regime (laminar/turbulent)", "Fluid density", "Pressure drop"], correct: 1 },
  { id: "sp12", text: "What is the maximum size of an item in DynamoDB?", options: ["4KB", "16KB", "400KB", "1MB"], correct: 2 },
  { id: "sp13", text: "The hydraulic radius is defined as:", options: ["Area/Wetted Perimeter", "Perimeter/Area", "Depth/Width", "Width/Depth"], correct: 0 },
  { id: "sp14", text: "Which service provides managed Kubernetes?", options: ["Amazon ECS", "Amazon EKS", "AWS Fargate", "Amazon ECR"], correct: 1 },
  { id: "sp15", text: "The critical path in project management is:", options: ["The shortest path", "The longest path", "The most expensive path", "The path with most resources"], correct: 1 },
]

const TOTAL_TIME = 15 * 90 // 15 questions x 90 seconds each = 22.5 minutes

type GameState = "ready" | "playing" | "reviewing" | "finished"

export default function ExamSprintPage() {
  const [gameState, setGameState] = React.useState<GameState>("ready")
  const [timeLeft, setTimeLeft] = React.useState(TOTAL_TIME)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<(number | null)[]>(new Array(sprintQuestions.length).fill(null))
  const [flagged, setFlagged] = React.useState<boolean[]>(new Array(sprintQuestions.length).fill(false))

  const question = sprintQuestions[currentIndex]
  const answeredCount = answers.filter((a) => a !== null).length
  const progress = (answeredCount / sprintQuestions.length) * 100

  // Timer
  React.useEffect(() => {
    if (gameState !== "playing") return
    
    if (timeLeft <= 0) {
      setGameState("reviewing")
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  const startGame = () => {
    setGameState("playing")
    setTimeLeft(TOTAL_TIME)
    setCurrentIndex(0)
    setAnswers(new Array(sprintQuestions.length).fill(null))
    setFlagged(new Array(sprintQuestions.length).fill(false))
  }

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = index
    setAnswers(newAnswers)
  }

  const handleFlag = () => {
    const newFlagged = [...flagged]
    newFlagged[currentIndex] = !newFlagged[currentIndex]
    setFlagged(newFlagged)
  }

  const handleSubmit = () => {
    setGameState("reviewing")
  }

  const handleFinishReview = () => {
    setGameState("finished")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calculateScore = () => {
    let correct = 0
    sprintQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++
    })
    return correct
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] lg:min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {/* Ready State */}
          {gameState === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex items-center justify-center px-4 py-8"
            >
              <div className="text-center max-w-md">
                <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-3xl bg-primary">
                  <Icons.timer className="h-10 w-10 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Exam Sprint</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Simulate real exam conditions with 15 timed questions. No hints, just pure exam practice.
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">15</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">90s</p>
                    <p className="text-xs text-muted-foreground">Per Question</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">22m</p>
                    <p className="text-xs text-muted-foreground">Total Time</p>
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="rounded-xl px-8 glow-primary">
                  <Icons.play className="mr-2 h-5 w-5" />
                  Start Sprint
                </Button>
                
                <div className="mt-6">
                  <Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icons.arrowLeft className="inline-block mr-1 h-4 w-4" />
                    Back to Games
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Top Bar */}
              <div className="border-b border-border bg-card px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground">
                      Question {currentIndex + 1} of {sprintQuestions.length}
                    </span>
                    <Progress value={progress} className="w-32 h-2" />
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    timeLeft <= 120 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                  )}>
                    <Icons.clock className="h-4 w-4" />
                    <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Question Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-border bg-card p-6 elevation-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Question {currentIndex + 1}</span>
                      <button
                        onClick={handleFlag}
                        className={cn(
                          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
                          flagged[currentIndex]
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icons.flag className="h-4 w-4" />
                        {flagged[currentIndex] ? "Flagged" : "Flag"}
                      </button>
                    </div>
                    
                    <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                      {question.text}
                    </p>
                    
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                            answers[currentIndex] === index
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
                            answers[currentIndex] === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          )}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-sm leading-relaxed text-foreground">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="border-t border-border bg-card px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="rounded-xl"
                    >
                      <Icons.chevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(Math.min(sprintQuestions.length - 1, currentIndex + 1))}
                      disabled={currentIndex === sprintQuestions.length - 1}
                      className="rounded-xl"
                    >
                      Next
                      <Icons.chevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Navigator */}
                  <div className="hidden sm:flex items-center gap-1">
                    {sprintQuestions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-medium transition-colors",
                          currentIndex === i && "ring-2 ring-primary",
                          answers[i] !== null ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                          flagged[i] && "ring-2 ring-accent"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button onClick={handleSubmit} className="rounded-xl glow-primary">
                    Submit Exam
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Review/Finished State */}
          {(gameState === "reviewing" || gameState === "finished") && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 px-4 py-8"
            >
              <div className="max-w-3xl mx-auto">
                {/* Results Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="flex h-20 w-20 mx-auto mb-4 items-center justify-center rounded-3xl bg-primary"
                  >
                    <Icons.checkCircle className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Exam Complete</h1>
                  <p className="text-muted-foreground">
                    {gameState === "reviewing" ? "Review your answers before seeing results" : "Here are your final results"}
                  </p>
                </div>

                {/* Score Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border bg-card p-6 mb-6 text-center"
                >
                  <p className="text-5xl font-bold text-foreground mb-1">
                    {calculateScore()}/{sprintQuestions.length}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {Math.round((calculateScore() / sprintQuestions.length) * 100)}% Correct
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  {gameState === "reviewing" && (
                    <Button onClick={handleFinishReview} className="flex-1 rounded-xl glow-primary">
                      <Icons.check className="mr-2 h-4 w-4" />
                      See Detailed Results
                    </Button>
                  )}
                  <Button onClick={startGame} variant={gameState === "finished" ? "default" : "outline"} className="flex-1 rounded-xl">
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Link href="/games" className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl">
                      <Icons.arrowLeft className="mr-2 h-4 w-4" />
                      Back to Games
                    </Button>
                  </Link>
                </div>

                {/* Question Review (only in finished state) */}
                {gameState === "finished" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Question Review</h2>
                    {sprintQuestions.map((q, i) => {
                      const isCorrect = answers[i] === q.correct
                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "rounded-xl border p-4",
                            isCorrect ? "border-chart-3/30 bg-chart-3/5" : "border-destructive/30 bg-destructive/5"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {isCorrect ? (
                              <Icons.checkCircle className="h-5 w-5 text-chart-3 shrink-0 mt-0.5" />
                            ) : (
                              <Icons.xCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground mb-2">{q.text}</p>
                              <p className="text-xs text-muted-foreground">
                                Your answer: {answers[i] !== null ? q.options[answers[i]] : "Not answered"}
                              </p>
                              {!isCorrect && (
                                <p className="text-xs text-chart-3 mt-1">
                                  Correct: {q.options[q.correct]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
