"use client"

import useSWR from "swr"
import { questionsApi, type Question, type QuestionStats } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ArrowLeft, Flag, Clock, Target, BarChart3, Sparkles } from "lucide-react"
import Link from "next/link"

// Mock data
const mockQuestion: Question = {
  id: "r1",
  prompt: "Which AWS service provides managed Kubernetes?",
  choices: [
    { id: "a", text: "Amazon ECS" },
    { id: "b", text: "Amazon EKS" },
    { id: "c", text: "AWS Fargate" },
    { id: "d", text: "Amazon EC2" },
  ],
  section: "Compute",
  explanation:
    "Amazon EKS (Elastic Kubernetes Service) is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install and operate your own Kubernetes control plane or nodes.",
  flagged: true,
  last_correct: false,
  confidence: 2,
}

const mockStats: QuestionStats = {
  attempts: 5,
  correct_count: 2,
  average_time: 45,
  last_confidence: 2,
}

interface QuestionDetailProps {
  questionId: string
}

export function QuestionDetail({ questionId }: QuestionDetailProps) {
  const { data: question, isLoading: questionLoading } = useSWR<Question>(`question-${questionId}`, async () => {
    try {
      return await questionsApi.getQuestion(questionId)
    } catch {
      return mockQuestion
    }
  })

  const { data: stats, isLoading: statsLoading } = useSWR<QuestionStats>(`question-stats-${questionId}`, async () => {
    try {
      return await questionsApi.getStats(questionId)
    } catch {
      return mockStats
    }
  })

  if (questionLoading || statsLoading) {
    return <QuestionDetailSkeleton />
  }

  if (!question) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Question Not Found</h2>
          <Link href="/review">
            <Button>Back to Review</Button>
          </Link>
        </div>
      </main>
    )
  }

  const accuracy = stats ? Math.round((stats.correct_count / stats.attempts) * 100) : 0

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/review">
        <Button variant="ghost" size="sm" className="gap-2 mb-6 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Back to Review
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Question Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">{question.section}</Badge>
                {question.flagged && <Flag className="h-4 w-4 text-warning fill-warning" />}
              </div>

              <p className="text-lg font-medium mb-6 leading-relaxed">{question.prompt}</p>

              <div className="space-y-3">
                {question.choices.map((choice, index) => (
                  <div
                    key={choice.id}
                    className={cn("p-4 rounded-lg border flex items-start gap-3", "bg-secondary/30 border-border/50")}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          {question.explanation && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Attempts</span>
                <span className="font-medium">{stats?.attempts || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <span
                  className={cn(
                    "font-medium",
                    accuracy >= 70 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive",
                  )}
                >
                  {accuracy}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Avg. Time
                </span>
                <span className="font-medium">{stats?.average_time || 0}s</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Last Confidence
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "w-4 h-1.5 rounded-full",
                        stats?.last_confidence && level <= stats.last_confidence
                          ? stats.last_confidence <= 2
                            ? "bg-destructive"
                            : stats.last_confidence <= 3
                              ? "bg-warning"
                              : "bg-success"
                          : "bg-secondary",
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-3">
              <Link href="/study" className="block">
                <Button className="w-full">Practice This Question</Button>
              </Link>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Sparkles className="h-4 w-4" />
                Get AI Explanation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function QuestionDetailSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Skeleton className="h-9 w-32 mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </main>
  )
}
