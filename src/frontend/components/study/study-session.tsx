"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { questionsApi, type Question, type AnswerResponse } from "@/lib/api-client"
import { QuestionCard } from "./question-card"
import { SessionComplete } from "./session-complete"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"

// Mock questions for development
const mockQuestions: Question[] = [
  {
    id: "1",
    prompt:
      "A company wants to migrate their on-premises application to AWS. The application requires a relational database with high availability across multiple Availability Zones. Which AWS service should they use?",
    choices: [
      { id: "a", text: "Amazon DynamoDB" },
      { id: "b", text: "Amazon RDS with Multi-AZ deployment" },
      { id: "c", text: "Amazon ElastiCache" },
      { id: "d", text: "Amazon Redshift" },
    ],
    section: "Database Services",
  },
  {
    id: "2",
    prompt:
      "Which AWS service provides a fully managed message queuing service that enables you to decouple and scale microservices?",
    choices: [
      { id: "a", text: "Amazon SNS" },
      { id: "b", text: "Amazon SQS" },
      { id: "c", text: "Amazon Kinesis" },
      { id: "d", text: "AWS Step Functions" },
    ],
    section: "Application Integration",
  },
  {
    id: "3",
    prompt:
      "A solutions architect needs to design a solution that provides the lowest latency for accessing frequently used data. Which AWS service should be used?",
    choices: [
      { id: "a", text: "Amazon S3" },
      { id: "b", text: "Amazon EBS" },
      { id: "c", text: "Amazon ElastiCache" },
      { id: "d", text: "Amazon Glacier" },
    ],
    section: "Storage Solutions",
  },
  {
    id: "4",
    prompt:
      "Which AWS service allows you to run code without provisioning or managing servers, and you only pay for the compute time you consume?",
    choices: [
      { id: "a", text: "Amazon EC2" },
      { id: "b", text: "AWS Lambda" },
      { id: "c", text: "Amazon ECS" },
      { id: "d", text: "AWS Elastic Beanstalk" },
    ],
    section: "Compute",
  },
  {
    id: "5",
    prompt:
      "A company needs to ensure that their S3 bucket is not publicly accessible. Which feature should they enable?",
    choices: [
      { id: "a", text: "S3 Versioning" },
      { id: "b", text: "S3 Block Public Access" },
      { id: "c", text: "S3 Transfer Acceleration" },
      { id: "d", text: "S3 Lifecycle Policies" },
    ],
    section: "Security & IAM",
  },
]

interface StudySessionProps {
  mode: "practice" | "review"
}

export function StudySession({ mode }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState<
    Array<{
      questionId: string
      correct: boolean
      timeSpent: number
    }>
  >([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  const { data: questions, isLoading } = useSWR<Question[]>(`questions-${mode}`, async () => {
    try {
      return await questionsApi.getQuestions(mode)
    } catch {
      return mockQuestions
    }
  })

  const currentQuestion = questions?.[currentIndex]
  const progress = questions ? ((currentIndex + 1) / questions.length) * 100 : 0

  // Reset timer when question changes
  useEffect(() => {
    setStartTime(Date.now())
  }, [currentIndex])

  const handleAnswer = useCallback(
    async (choiceId: string, confidence: number): Promise<AnswerResponse> => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      try {
        const response = await questionsApi.submitAnswer(currentQuestion!.id, {
          choice_id: choiceId,
          confidence,
          time_spent_seconds: timeSpent,
        })

        setSessionResults((prev) => [
          ...prev,
          {
            questionId: currentQuestion!.id,
            correct: response.correct,
            timeSpent,
          },
        ])

        return response
      } catch {
        // Mock response for development
        const isCorrect = choiceId === "b" // Mock: 'b' is always correct
        const mockResponse: AnswerResponse = {
          correct: isCorrect,
          correct_choice_id: "b",
          explanation: `This is the correct answer because it best addresses the requirement. ${
            isCorrect ? "Great job!" : "Review this topic for better understanding."
          }`,
        }

        setSessionResults((prev) => [
          ...prev,
          {
            questionId: currentQuestion!.id,
            correct: isCorrect,
            timeSpent,
          },
        ])

        return mockResponse
      }
    },
    [currentQuestion, startTime],
  )

  const handleNext = useCallback(() => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsComplete(true)
    }
  }, [questions, currentIndex])

  const handleFlagQuestion = useCallback(
    async (flagged: boolean) => {
      if (currentQuestion) {
        try {
          await questionsApi.flagQuestion(currentQuestion.id, flagged)
        } catch {
          // Silently fail for flag
        }
      }
    },
    [currentQuestion],
  )

  if (isLoading) {
    return <StudySessionSkeleton />
  }

  if (!questions || questions.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="text-muted-foreground mb-6">
            {mode === "review"
              ? "You don't have any questions to review yet. Complete some practice questions first."
              : "No questions are available at the moment."}
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </main>
    )
  }

  if (isComplete) {
    return (
      <SessionComplete
        results={sessionResults}
        totalQuestions={questions.length}
        onRestart={() => {
          setCurrentIndex(0)
          setSessionResults([])
          setIsComplete(false)
        }}
      />
    )
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Exit Session
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-transparent">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onFlag={handleFlagQuestion}
          isLast={currentIndex === questions.length - 1}
        />
      )}
    </main>
  )
}

function StudySessionSkeleton() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </main>
  )
}
