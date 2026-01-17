"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Clock, ArrowRight, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

interface SessionCompleteProps {
  results: Array<{
    questionId: string
    correct: boolean
    timeSpent: number
  }>
  totalQuestions: number
  onRestart: () => void
}

export function SessionComplete({ results, totalQuestions, onRestart }: SessionCompleteProps) {
  const correctCount = results.filter((r) => r.correct).length
  const accuracy = Math.round((correctCount / totalQuestions) * 100)
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0)
  const avgTime = Math.round(totalTime / totalQuestions)

  const getMessage = () => {
    if (accuracy >= 90) return "Outstanding! You're exam-ready!"
    if (accuracy >= 70) return "Great job! Keep practicing!"
    if (accuracy >= 50) return "Good effort! Focus on weak areas."
    return "Keep studying! You'll improve!"
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <p className="text-muted-foreground mt-2">{getMessage()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Trophy className="h-5 w-5 mx-auto mb-2 text-success" />
                <p className="text-2xl font-bold">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{avgTime}s</p>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={onRestart} variant="outline" className="flex-1 gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Study Again
              </Button>
              <Link href="/review" className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Target className="h-4 w-4" />
                  Review Mistakes
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
