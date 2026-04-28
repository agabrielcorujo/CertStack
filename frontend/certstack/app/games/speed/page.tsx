"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"
import { playCorrect, playWrong, playVictory } from "@/components/sfx"
import { Confetti } from "@/components/confetti"

// Speed round questions (simplified for fast gameplay)
const speedQuestions = [
  { id: "s1", text: "Which AWS service provides serverless compute?", options: ["EC2", "Lambda", "ECS", "Fargate"], correct: 1 },
  { id: "s2", text: "What is the maximum size of an S3 object?", options: ["5TB", "1TB", "500GB", "5GB"], correct: 0 },
  { id: "s3", text: "Which database is fully managed NoSQL?", options: ["RDS", "Aurora", "DynamoDB", "Redshift"], correct: 2 },
  { id: "s4", text: "What does IAM stand for?", options: ["Identity Access Management", "Internet Access Module", "Integrated App Management", "Instance Access Manager"], correct: 0 },
  { id: "s5", text: "Which service provides CDN capabilities?", options: ["Route 53", "CloudFront", "API Gateway", "VPC"], correct: 1 },
  { id: "s6", text: "What is the default VPC CIDR block?", options: ["10.0.0.0/16", "172.31.0.0/16", "192.168.0.0/16", "10.0.0.0/8"], correct: 1 },
  { id: "s7", text: "Which storage class is for infrequent access?", options: ["S3 Standard", "S3 IA", "S3 Glacier", "S3 One Zone"], correct: 1 },
  { id: "s8", text: "What is the maximum bending moment for a simply supported beam?", options: ["wL/4", "wL²/8", "wL²/2", "wL/8"], correct: 1 },
  { id: "s9", text: "Young's modulus measures?", options: ["Strength", "Stiffness", "Ductility", "Hardness"], correct: 1 },
  { id: "s10", text: "The factor of safety is defined as?", options: ["Stress/Strain", "Ultimate/Allowable", "Load/Area", "Force/Mass"], correct: 1 },
]

type GameState = "ready" | "playing" | "finished"

export default function SpeedRoundPage() {
  const [gameState, setGameState] = React.useState<GameState>("ready")
  const [timeLeft, setTimeLeft] = React.useState(60)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [score, setScore] = React.useState(0)
  const [streak, setStreak] = React.useState(0)
  const [bestStreak, setBestStreak] = React.useState(0)
  const [correctCount, setCorrectCount] = React.useState(0)
  const [wrongCount, setWrongCount] = React.useState(0)
  const [showFeedback, setShowFeedback] = React.useState<"correct" | "wrong" | null>(null)
  const [questionStart, setQuestionStart] = React.useState<number>(() => Date.now())

  const question = speedQuestions[currentIndex % speedQuestions.length]

  // Timer
  React.useEffect(() => {
    if (gameState !== "playing") return
    
    if (timeLeft <= 0) {
      setGameState("finished")
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  React.useEffect(() => {
    if (gameState === "playing") setQuestionStart(Date.now())
  }, [currentIndex, gameState])

  const startGame = () => {
    setGameState("playing")
    setTimeLeft(60)
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setCorrectCount(0)
    setWrongCount(0)
  }

  const handleAnswer = (index: number) => {
    if (gameState !== "playing" || showFeedback) return

    const isCorrect = index === question.correct
    
    if (isCorrect) {
      const newStreak = streak + 1
      const multiplier = Math.min(1 + Math.floor(newStreak / 3) * 0.5, 3) // 1x, 1.5x, 2x, 2.5x, 3x
      const points = Math.round(100 * multiplier)
      
      setScore((s) => s + points)
      setStreak(newStreak)
      setBestStreak((b) => Math.max(b, newStreak))
      setCorrectCount((c) => c + 1)
      setShowFeedback("correct")
    } else {
      setStreak(0)
      setWrongCount((w) => w + 1)
      setShowFeedback("wrong")
    }

    // play sfx and spark for quick answers
    const responseMs = Date.now() - questionStart
    const quickThreshold = 2000
    if (isCorrect) playCorrect()
    else playWrong()
    // quick-answer visual effects removed at question time
    
    // Quick feedback then next question
    setTimeout(() => {
      setShowFeedback(null)
      setCurrentIndex((i) => i + 1)
    }, 300)
  }

  const getMultiplier = () => {
    return Math.min(1 + Math.floor(streak / 3) * 0.5, 3)
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] lg:min-h-screen flex flex-col">
        {/* Confetti on great accuracy */}
        {gameState === "finished" && correctCount >= 8 && (
          <Confetti />
        )}
        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Ready State */}
            {gameState === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center max-w-md"
              >
                <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-3xl bg-accent">
                  <Icons.zap className="h-10 w-10 text-accent-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Speed Round</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Answer as many questions as you can in 60 seconds. Build streaks for bonus multipliers!
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">60s</p>
                    <p className="text-xs text-muted-foreground">Time Limit</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">3x</p>
                    <p className="text-xs text-muted-foreground">Max Multiplier</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">100</p>
                    <p className="text-xs text-muted-foreground">Base Points</p>
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="rounded-xl px-8 glow-accent">
                  <Icons.play className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
                
                <div className="mt-6">
                  <Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Icons.arrowLeft className="inline-block mr-1 h-4 w-4" />
                    Back to Games
                  </Link>
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
                className="w-full max-w-2xl"
              >
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">{score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent">{streak}</p>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                    {streak >= 3 && (
                      <div className="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent">
                        {getMultiplier()}x
                      </div>
                    )}
                  </div>
                  
                  {/* Timer */}
                  <div className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2",
                    timeLeft <= 10 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                  )}>
                    <Icons.clock className="h-5 w-5" />
                    <span className="text-2xl font-bold tabular-nums">{timeLeft}</span>
                  </div>
                </div>

                {/* Question Card */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-2xl border bg-card p-6 elevation-2",
                    showFeedback === "correct" && "border-chart-3 bg-chart-3/5",
                    showFeedback === "wrong" && "border-destructive bg-destructive/5",
                    !showFeedback && "border-border"
                  )}
                >
                  {/* per-question confetti removed; keep end-of-game confetti only */}
                  <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                    {question.text}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {question.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={showFeedback !== null}
                        className={cn(
                          "rounded-xl border p-4 text-left font-medium transition-all duration-150",
                          "border-border hover:border-primary hover:bg-primary/5",
                          showFeedback && index === question.correct && "border-chart-3 bg-chart-3/10 text-chart-3",
                          showFeedback === "wrong" && index !== question.correct && "opacity-50"
                        )}
                      >
                        <span className="mr-2 text-muted-foreground">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Progress indicator */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Question {(currentIndex % speedQuestions.length) + 1}
                </div>
              </motion.div>
            )}

            {/* Finished State */}
            {gameState === "finished" && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-3xl bg-primary"
                >
                  <Icons.trophy className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-foreground mb-2">{"Time's Up!"}</h1>
                <p className="text-muted-foreground mb-8">Great effort! Here are your results:</p>
                
                {/* Score Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border bg-card p-6 mb-6"
                >
                  <p className="text-5xl font-bold text-foreground mb-2">{score}</p>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </motion.div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="rounded-xl bg-chart-3/10 p-4 text-center">
                    <p className="text-2xl font-bold text-chart-3">{correctCount}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="rounded-xl bg-destructive/10 p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">{wrongCount}</p>
                    <p className="text-xs text-muted-foreground">Wrong</p>
                  </div>
                  <div className="rounded-xl bg-accent/10 p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{bestStreak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                </div>

                {/* Accuracy */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-medium text-foreground">
                      {correctCount + wrongCount > 0
                        ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${correctCount + wrongCount > 0
                          ? (correctCount / (correctCount + wrongCount)) * 100
                          : 0}%`
                      }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={startGame} className="flex-1 rounded-xl glow-primary">
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Play Again
                  </Button>
                  <Link href="/games" className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl">
                      <Icons.arrowLeft className="mr-2 h-4 w-4" />
                      Back to Games
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  )
}
