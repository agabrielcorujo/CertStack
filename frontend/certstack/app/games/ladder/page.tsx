"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { Icons } from "@/components/icons"
import { getErrorMessage, getJson, postJson } from "@/lib/api"

// Ladder levels with progressive difficulty
const ladderLevels = [
  { level: 1, name: "Foundation", required: 0, questionsToPass: 3, difficulty: "Easy" },
  { level: 2, name: "Basic", required: 3, questionsToPass: 3, difficulty: "Easy" },
  { level: 3, name: "Intermediate I", required: 6, questionsToPass: 4, difficulty: "Medium" },
  { level: 4, name: "Intermediate II", required: 10, questionsToPass: 4, difficulty: "Medium" },
  { level: 5, name: "Advanced I", required: 14, questionsToPass: 5, difficulty: "Hard" },
  { level: 6, name: "Advanced II", required: 19, questionsToPass: 5, difficulty: "Hard" },
  { level: 7, name: "Expert I", required: 24, questionsToPass: 5, difficulty: "Expert" },
  { level: 8, name: "Expert II", required: 29, questionsToPass: 5, difficulty: "Expert" },
  { level: 9, name: "Master", required: 34, questionsToPass: 5, difficulty: "Expert" },
  { level: 10, name: "Grand Master", required: 39, questionsToPass: 5, difficulty: "Expert" },
]

// Questions by difficulty
const questionsByDifficulty = {
  Easy: [
    { id: "e1", text: "In the FE exam, which unit is force measured in?", options: ["Newton", "Pascal", "Joule", "Watt"], correct: 0 },
    { id: "e2", text: "In AWS, which service is object storage?", options: ["EC2", "S3", "RDS", "Lambda"], correct: 1 },
    { id: "e3", text: "For a simply supported beam with a centered load, the maximum bending moment occurs at", options: ["the support", "midspan", "the quarter point", "everywhere equally"], correct: 1 },
    { id: "e4", text: "Which AWS principle means you only grant the permissions required?", options: ["High availability", "Least privilege", "Fault tolerance", "Elastic scaling"], correct: 1 },
  ],
  Medium: [
    { id: "m1", text: "In FE statics, a positive shear force on the left face is usually considered", options: ["downward", "upward", "clockwise", "counterclockwise"], correct: 1 },
    { id: "m2", text: "In AWS, DynamoDB defaults to which consistency model for reads?", options: ["Strong", "Eventual", "Causal", "Sequential"], correct: 1 },
    { id: "m3", text: "What is the maximum timeout for AWS Lambda?", options: ["5 minutes", "10 minutes", "15 minutes", "30 minutes"], correct: 2 },
    { id: "m4", text: "Which FE concept is used to describe the ratio of stress to strain in the linear region?", options: ["Young's modulus", "Poisson ratio", "Shear force", "Yield strength"], correct: 0 },
  ],
  Hard: [
    { id: "h1", text: "Which AWS service provides DNS and health checks?", options: ["CloudFront", "Route 53", "VPC", "Direct Connect"], correct: 1 },
    { id: "h2", text: "A PE ethics question: when public safety conflicts with client preference, the engineer should prioritize", options: ["the schedule", "the public welfare", "the lowest cost", "the client's request"], correct: 1 },
    { id: "h3", text: "In FE thermodynamics, an isothermal process means", options: ["constant pressure", "constant volume", "constant temperature", "constant entropy"], correct: 2 },
    { id: "h4", text: "Which AWS feature isolates resources into a logically isolated section of the cloud?", options: ["Subnet", "VPC", "Security Group", "Route Table"], correct: 1 },
    { id: "h5", text: "For a simply supported beam, the location of maximum deflection is usually", options: ["at one support", "midspan", "at the load only", "at the quarter point"], correct: 1 },
  ],
  Expert: [
    { id: "x1", text: "Which AWS service lets you orchestrate serverless workflows with state machines?", options: ["Step Functions", "CloudWatch", "SQS", "Kinesis"], correct: 0 },
    { id: "x2", text: "In PE practice, an engineer discovers a design issue that affects safety. The first action should be to", options: ["hide the issue", "document and escalate it", "wait for approval", "continue working silently"], correct: 1 },
    { id: "x3", text: "Which FE subject most directly uses the section modulus relation M/S?", options: ["Dynamics", "Strength of materials", "Ethics", "Probability"], correct: 1 },
    { id: "x4", text: "Which AWS service enables cross-account resource sharing?", options: ["RAM", "IAM", "Organizations", "Control Tower"], correct: 0 },
    { id: "x5", text: "A cantilever beam with an end point load has its maximum bending moment at", options: ["the free end", "the fixed support", "midspan", "the load point only"], correct: 1 },
  ],
}

type GameState = "ladder" | "playing" | "levelComplete" | "levelFailed"

interface LadderQuestion {
  id: string
  text: string
  options: string[]
  correct: number
}

interface ApiQuestion {
  id: string
  question_text: string
  choices: string[]
  correct_index: number
}

interface SubmitResponse {
  correct: boolean
  correct_index: number
  explanation: string
}

function mapApiToLadderQuestion(question: ApiQuestion): LadderQuestion {
  return {
    id: question.id,
    text: question.question_text,
    options: question.choices,
    correct: question.correct_index,
  }
}

export default function TopicLadderPage() {
  const [gameState, setGameState] = React.useState<GameState>("ladder")
  const [totalCorrect, setTotalCorrect] = React.useState(4) // Start at level 2 unlocked
  const [currentLevel, setCurrentLevel] = React.useState<number | null>(null)
  const [levelQuestions, setLevelQuestions] = React.useState<LadderQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [levelCorrect, setLevelCorrect] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [isLoadingLevel, setIsLoadingLevel] = React.useState(false)
  const [levelLoadError, setLevelLoadError] = React.useState<string | null>(null)
  const [isChecking, setIsChecking] = React.useState(false)
  const [resolvedCorrectIndex, setResolvedCorrectIndex] = React.useState<number | null>(null)

  const getCurrentLevelInfo = (level: number) => ladderLevels.find(l => l.level === level)!
  const getUnlockedLevel = () => {
    for (let i = ladderLevels.length - 1; i >= 0; i--) {
      if (totalCorrect >= ladderLevels[i].required) {
        return ladderLevels[i].level
      }
    }
    return 1
  }

  const startLevel = async (level: number) => {
    const levelInfo = getCurrentLevelInfo(level)
    setIsLoadingLevel(true)
    setLevelLoadError(null)

    try {
      const apiQuestions = await getJson<ApiQuestion[]>("/questions", {
        difficulty: levelInfo.difficulty,
        limit: levelInfo.questionsToPass + 2,
      })

      const questions =
        apiQuestions.length > 0
          ? apiQuestions.map(mapApiToLadderQuestion)
          : [...questionsByDifficulty[levelInfo.difficulty as keyof typeof questionsByDifficulty]]

      const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, levelInfo.questionsToPass + 2)

      setCurrentLevel(level)
      setLevelQuestions(shuffled)
      setCurrentQuestionIndex(0)
      setLevelCorrect(0)
      setSelectedAnswer(null)
      setResolvedCorrectIndex(null)
      setShowFeedback(false)
      setGameState("playing")
    } catch (error) {
      const fallbackQuestions = [...questionsByDifficulty[levelInfo.difficulty as keyof typeof questionsByDifficulty]]
      const shuffled = [...fallbackQuestions].sort(() => Math.random() - 0.5).slice(0, levelInfo.questionsToPass + 2)

      setCurrentLevel(level)
      setLevelQuestions(shuffled)
      setCurrentQuestionIndex(0)
      setLevelCorrect(0)
      setSelectedAnswer(null)
      setResolvedCorrectIndex(null)
      setShowFeedback(false)
      setLevelLoadError(getErrorMessage(error))
      setGameState("playing")
    } finally {
      setIsLoadingLevel(false)
    }
  }

  const handleAnswer = (index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
  }

  const handleSubmit = async () => {
    if (selectedAnswer === null) return

    setIsChecking(true)
    try {
      const result = await postJson<SubmitResponse>("/submit", {
        question_id: levelQuestions[currentQuestionIndex].id,
        selected_index: selectedAnswer,
      })

      setResolvedCorrectIndex(result.correct_index)
      setShowFeedback(true)
      if (result.correct) {
        setLevelCorrect((c: number) => c + 1)
      }
    } catch {
      const isCorrect = selectedAnswer === levelQuestions[currentQuestionIndex].correct
      setResolvedCorrectIndex(levelQuestions[currentQuestionIndex].correct)
      setShowFeedback(true)
      if (isCorrect) {
        setLevelCorrect((c: number) => c + 1)
      }
    } finally {
      setIsChecking(false)
    }
  }

  const handleNext = () => {
    const levelInfo = getCurrentLevelInfo(currentLevel!)
    const isLastQuestion = currentQuestionIndex === levelQuestions.length - 1
    const correctIndex = resolvedCorrectIndex ?? levelQuestions[currentQuestionIndex].correct
    const currentAnswerIsCorrect = selectedAnswer === correctIndex
    const passedLevel = levelCorrect + (currentAnswerIsCorrect ? 1 : 0) >= levelInfo.questionsToPass

    if (isLastQuestion || passedLevel) {
      if (passedLevel) {
        setTotalCorrect((t: number) => t + levelCorrect + (selectedAnswer === levelQuestions[currentQuestionIndex].correct ? 1 : 0))
        setGameState("levelComplete")
      } else {
        setGameState("levelFailed")
      }
    } else {
      setCurrentQuestionIndex((i: number) => i + 1)
      setSelectedAnswer(null)
      setResolvedCorrectIndex(null)
      setShowFeedback(false)
    }
  }

  const unlockedLevel = getUnlockedLevel()

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] lg:min-h-screen">
        <AnimatePresence mode="wait">
          {/* Ladder View */}
          {gameState === "ladder" && (
            <motion.div
              key="ladder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            >
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <Link href="/games">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Icons.chevronLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">CertStack Ladder</h1>
                    <p className="text-sm text-muted-foreground">Climb through FE, PE, and AWS topics</p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="rounded-2xl border border-border bg-card p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Level</p>
                      <p className="text-2xl font-bold text-foreground">Level {unlockedLevel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Correct</p>
                      <p className="text-2xl font-bold text-primary">{totalCorrect}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress to Level {Math.min(unlockedLevel + 1, 10)}</span>
                      {unlockedLevel < 10 && (
                        <span className="font-medium text-foreground">
                          {totalCorrect - ladderLevels[unlockedLevel - 1].required}/{ladderLevels[unlockedLevel].required - ladderLevels[unlockedLevel - 1].required}
                        </span>
                      )}
                    </div>
                    <Progress
                      value={unlockedLevel >= 10 ? 100 : ((totalCorrect - ladderLevels[unlockedLevel - 1].required) / (ladderLevels[unlockedLevel].required - ladderLevels[unlockedLevel - 1].required)) * 100}
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Ladder */}
                <div className="space-y-3">
                  {[...ladderLevels].reverse().map((level, i) => {
                    const isUnlocked = totalCorrect >= level.required
                    const isCompleted = unlockedLevel > level.level
                    const isCurrent = unlockedLevel === level.level

                    return (
                      <motion.div
                        key={level.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <button
                          onClick={() => {
                            if (isUnlocked && !isLoadingLevel) {
                              void startLevel(level.level)
                            }
                          }}
                          disabled={!isUnlocked || isLoadingLevel}
                          className={cn(
                            "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                            isCompleted && "border-chart-3/30 bg-chart-3/5",
                            isCurrent && "border-primary bg-primary/5 shadow-sm",
                            !isUnlocked && "border-border bg-secondary/30 opacity-50",
                            isUnlocked && !isCompleted && !isCurrent && "border-border hover:border-primary/50 hover:bg-secondary/50"
                          )}
                        >
                          {/* Level Number */}
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                            isCompleted && "bg-chart-3 text-primary-foreground",
                            isCurrent && "bg-primary text-primary-foreground",
                            !isUnlocked && "bg-muted text-muted-foreground",
                            isUnlocked && !isCompleted && !isCurrent && "bg-secondary text-foreground"
                          )}>
                            {isCompleted ? <Icons.check className="h-6 w-6" /> : level.level}
                          </div>

                          {/* Level Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{level.name}</p>
                              <span className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                level.difficulty === "Easy" && "bg-chart-3/20 text-chart-3",
                                level.difficulty === "Medium" && "bg-chart-4/20 text-chart-4",
                                level.difficulty === "Hard" && "bg-accent/20 text-accent",
                                level.difficulty === "Expert" && "bg-destructive/20 text-destructive"
                              )}>
                                {level.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isUnlocked
                                ? `Pass ${level.questionsToPass} questions to advance`
                                : `Requires ${level.required} correct answers`}
                            </p>
                          </div>

                          {/* Play Button */}
                          {isUnlocked && (
                            isLoadingLevel ? (
                              <Icons.refresh className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                              <Icons.play className="h-5 w-5 text-muted-foreground" />
                            )
                          )}
                          {!isUnlocked && (
                            <Icons.lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {levelLoadError && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    Backend fetch failed, using fallback questions: {levelLoadError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && currentLevel !== null && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-[calc(100vh-64px)] lg:min-h-screen"
            >
              {/* Header */}
              <div className="border-b border-border bg-card px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Level {currentLevel}</p>
                    <p className="font-semibold text-foreground">{getCurrentLevelInfo(currentLevel).name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Correct</p>
                      <p className="font-semibold text-chart-3">{levelCorrect}/{getCurrentLevelInfo(currentLevel).questionsToPass} needed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="flex-1 px-4 py-6">
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-border bg-card p-6 elevation-1"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Question {currentQuestionIndex + 1} of {levelQuestions.length}
                    </p>
                    <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                      {levelQuestions[currentQuestionIndex]?.text}
                    </p>

                    <div className="space-y-3">
                      {levelQuestions[currentQuestionIndex]?.options.map((option, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrectAnswer = index === (resolvedCorrectIndex ?? levelQuestions[currentQuestionIndex].correct)
                        const showCorrect = showFeedback && isCorrectAnswer
                        const showWrong = showFeedback && isSelected && !isCorrectAnswer

                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={showFeedback || isChecking}
                            whileHover={!showFeedback ? { scale: 1.01 } : {}}
                            whileTap={!showFeedback ? { scale: 0.99 } : {}}
                            className={cn(
                              "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
                              isSelected && !showFeedback && "border-primary bg-primary/5",
                              !isSelected && !showFeedback && "border-border hover:border-primary/50",
                              showCorrect && "border-chart-3 bg-chart-3/10",
                              showWrong && "border-destructive bg-destructive/10",
                              showFeedback && !showCorrect && !showWrong && "opacity-50"
                            )}
                          >
                            <div className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-medium",
                              isSelected && !showFeedback && "bg-primary text-primary-foreground",
                              !isSelected && !showFeedback && "bg-secondary text-muted-foreground",
                              showCorrect && "bg-chart-3 text-primary-foreground",
                              showWrong && "bg-destructive text-primary-foreground"
                            )}>
                              {showCorrect ? <Icons.check className="h-4 w-4" /> : showWrong ? <Icons.close className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-sm leading-relaxed text-foreground">{option}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border bg-card px-4 py-3">
                <div className="max-w-3xl mx-auto flex justify-end">
                  {!showFeedback ? (
                    <Button
                      onClick={() => void handleSubmit()}
                      disabled={selectedAnswer === null || isChecking}
                      className="rounded-xl glow-primary"
                    >
                      {isChecking ? "Checking..." : "Submit"}
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="rounded-xl glow-primary">
                      {currentQuestionIndex === levelQuestions.length - 1 ? "See Results" : "Next Question"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Level Complete */}
          {gameState === "levelComplete" && currentLevel !== null && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center px-4 py-8"
            >
              <div className="text-center max-w-md">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-3xl bg-chart-3"
                >
                  <Icons.trophy className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Level Complete!</h1>
                <p className="text-muted-foreground mb-8">
                  You passed Level {currentLevel}: {getCurrentLevelInfo(currentLevel).name}
                </p>

                <div className="flex flex-col gap-3">
                  {currentLevel < 10 && (
                    <Button onClick={() => startLevel(currentLevel + 1)} className="rounded-xl glow-primary">
                      <Icons.trendingUp className="mr-2 h-4 w-4" />
                      Continue to Level {currentLevel + 1}
                    </Button>
                  )}
                  <Button onClick={() => setGameState("ladder")} variant="outline" className="rounded-xl">
                    <Icons.chevronLeft className="mr-2 h-4 w-4" />
                    Back to Ladder
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Level Failed */}
          {gameState === "levelFailed" && currentLevel !== null && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center px-4 py-8"
            >
              <div className="text-center max-w-md">
                <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-3xl bg-destructive/20">
                  <Icons.xCircle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Not Quite</h1>
                <p className="text-muted-foreground mb-8">
                  You needed {getCurrentLevelInfo(currentLevel).questionsToPass} correct answers. Try again!
                </p>

                <div className="flex flex-col gap-3">
                  <Button onClick={() => startLevel(currentLevel)} className="rounded-xl glow-primary">
                    <Icons.refresh className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button onClick={() => setGameState("ladder")} variant="outline" className="rounded-xl">
                    <Icons.chevronLeft className="mr-2 h-4 w-4" />
                    Back to Ladder
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
