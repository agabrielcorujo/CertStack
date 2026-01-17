"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { reviewApi, type Question } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Flag, CheckCircle2, XCircle, ChevronRight, Filter, BookOpen } from "lucide-react"
import Link from "next/link"
import { StudySession } from "@/components/study/study-session"

// Mock review questions
const mockReviewQuestions: Question[] = [
  {
    id: "r1",
    prompt: "Which AWS service provides managed Kubernetes?",
    choices: [
      { id: "a", text: "Amazon ECS" },
      { id: "b", text: "Amazon EKS" },
      { id: "c", text: "AWS Fargate" },
      { id: "d", text: "Amazon EC2" },
    ],
    section: "Compute",
    flagged: true,
    last_correct: false,
    confidence: 2,
  },
  {
    id: "r2",
    prompt: "What is the maximum size of an S3 object?",
    choices: [
      { id: "a", text: "5 GB" },
      { id: "b", text: "5 TB" },
      { id: "c", text: "50 TB" },
      { id: "d", text: "500 GB" },
    ],
    section: "Storage Solutions",
    flagged: false,
    last_correct: false,
    confidence: 1,
  },
  {
    id: "r3",
    prompt: "Which service provides DDoS protection?",
    choices: [
      { id: "a", text: "AWS WAF" },
      { id: "b", text: "AWS Shield" },
      { id: "c", text: "Amazon GuardDuty" },
      { id: "d", text: "AWS Inspector" },
    ],
    section: "Security & IAM",
    flagged: true,
    last_correct: false,
    confidence: 3,
  },
  {
    id: "r4",
    prompt: "What does VPC stand for?",
    choices: [
      { id: "a", text: "Virtual Private Cloud" },
      { id: "b", text: "Virtual Public Cloud" },
      { id: "c", text: "Virtual Protected Cloud" },
      { id: "d", text: "Verified Private Cloud" },
    ],
    section: "Networking & VPC",
    flagged: false,
    last_correct: true,
    confidence: 4,
  },
]

type FilterType = "all" | "flagged" | "incorrect" | "low-confidence"

export function ReviewContent() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [isStudying, setIsStudying] = useState(false)

  const { data: questions, isLoading } = useSWR<Question[]>("review-questions", async () => {
    try {
      return await reviewApi.getReviewQuestions()
    } catch {
      return mockReviewQuestions
    }
  })

  const filteredQuestions =
    questions?.filter((q) => {
      switch (filter) {
        case "flagged":
          return q.flagged
        case "incorrect":
          return q.last_correct === false
        case "low-confidence":
          return (q.confidence || 0) <= 2
        default:
          return true
      }
    }) || []

  const filterCounts = {
    all: questions?.length || 0,
    flagged: questions?.filter((q) => q.flagged).length || 0,
    incorrect: questions?.filter((q) => q.last_correct === false).length || 0,
    "low-confidence": questions?.filter((q) => (q.confidence || 0) <= 2).length || 0,
  }

  if (isLoading) {
    return <ReviewSkeleton />
  }

  if (isStudying) {
    return <StudySession mode="review" />
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Review Questions</h1>
          <p className="text-muted-foreground">Focus on questions that need more practice</p>
        </div>
        {filteredQuestions.length > 0 && (
          <Button onClick={() => setIsStudying(true)} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Start Review Session
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          icon={<Filter className="h-4 w-4" />}
          label="All"
          count={filterCounts.all}
        />
        <FilterButton
          active={filter === "flagged"}
          onClick={() => setFilter("flagged")}
          icon={<Flag className="h-4 w-4" />}
          label="Flagged"
          count={filterCounts.flagged}
          color="warning"
        />
        <FilterButton
          active={filter === "incorrect"}
          onClick={() => setFilter("incorrect")}
          icon={<XCircle className="h-4 w-4" />}
          label="Incorrect"
          count={filterCounts.incorrect}
          color="destructive"
        />
        <FilterButton
          active={filter === "low-confidence"}
          onClick={() => setFilter("low-confidence")}
          icon={<ChevronRight className="h-4 w-4" />}
          label="Low Confidence"
          count={filterCounts["low-confidence"]}
          color="warning"
        />
      </div>

      {/* Question List */}
      {filteredQuestions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No questions to review</h3>
            <p className="text-muted-foreground mb-6">
              {filter === "all"
                ? "Complete some practice questions to build your review list."
                : `No ${filter.replace("-", " ")} questions found.`}
            </p>
            <Link href="/study">
              <Button>Start Practicing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => (
            <QuestionListItem key={question.id} question={question} />
          ))}
        </div>
      )}
    </main>
  )
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
  color,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
  color?: "warning" | "destructive"
}) {
  return (
    <Button
      variant={active ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn("gap-2", !active && "bg-transparent")}
    >
      <span className={cn(color === "warning" && "text-warning", color === "destructive" && "text-destructive")}>
        {icon}
      </span>
      {label}
      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
        {count}
      </Badge>
    </Button>
  )
}

function QuestionListItem({ question }: { question: Question }) {
  return (
    <Link href={`/question/${question.id}`}>
      <Card className="border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {question.section}
                </Badge>
                {question.flagged && (
                  <Flag className="h-3.5 w-3.5 text-warning fill-warning" aria-label="Flagged question" />
                )}
                {question.last_correct === false && (
                  <XCircle className="h-3.5 w-3.5 text-destructive" aria-label="Previously incorrect" />
                )}
                {question.last_correct === true && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-label="Previously correct" />
                )}
              </div>
              <p className="text-sm line-clamp-2">{question.prompt}</p>
              {question.confidence !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "w-4 h-1.5 rounded-full",
                          question.confidence && level <= question.confidence
                            ? question.confidence <= 2
                              ? "bg-destructive"
                              : question.confidence <= 3
                                ? "bg-warning"
                                : "bg-success"
                            : "bg-secondary",
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ReviewSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </main>
  )
}
