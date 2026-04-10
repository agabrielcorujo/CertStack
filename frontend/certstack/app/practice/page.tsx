"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionNavigator } from "@/components/practice/question-navigator"
import { ChatPanel, ChatDrawer, ChatTriggerButton } from "@/components/chat"
import { ChatProvider, useChat } from "@/lib/chat-context"
import { useCertificationFocus } from "@/lib/certification-focus"
import { Icons } from "@/components/icons"
import { getErrorMessage, getJson, postJson } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  id: string
  text: string
}

interface Question {
  id: number
  apiId: string
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
}

interface ApiQuestion {
  id: string
  question_text: string
  choices: string[]
  correct_index: number
  explanation: string
}

interface SubmitResponse {
  correct: boolean
  correct_index: number
  explanation: string
}

const fallbackQuestions: Question[] = [
  {
    id: 1,
    apiId: "local-q1",
    question: "A beam is subjected to bending. Which quantity is used to determine flexural stress at the outer fiber?",
    options: [
      { id: "a", text: "Shear modulus" },
      { id: "b", text: "Section modulus" },
      { id: "c", text: "Moment of inertia only" },
      { id: "d", text: "Poisson's ratio" },
    ],
    correctAnswer: "b",
    explanation: "For bending, the maximum stress at the outer fiber is sigma = M / S, where S is the section modulus.",
  },
  {
    id: 2,
    apiId: "local-q2",
    question: "In AWS IAM, which principle grants only the permissions needed for a task?",
    options: [
      { id: "a", text: "Least privilege" },
      { id: "b", text: "Shared credentials" },
      { id: "c", text: "Cross-region replication" },
      { id: "d", text: "Implicit deny override" },
    ],
    correctAnswer: "a",
    explanation: "Least privilege means granting the minimum permissions necessary to perform a function.",
  },
  {
    id: 3,
    apiId: "local-q3",
    question: "For a simply supported beam with a centered point load, where is the maximum bending moment?",
    options: [
      { id: "a", text: "At either support" },
      { id: "b", text: "At midspan" },
      { id: "c", text: "At quarter points" },
      { id: "d", text: "Uniform everywhere" },
    ],
    correctAnswer: "b",
    explanation: "With a centered point load on a simply supported beam, the bending moment peaks at midspan.",
  },
]

function toOptionId(index: number): string {
  return String.fromCharCode(97 + index)
}

function mapApiQuestion(question: ApiQuestion, idx: number): Question {
  return {
    id: idx + 1,
    apiId: question.id,
    question: question.question_text,
    options: question.choices.map((choice, choiceIdx) => ({ id: toOptionId(choiceIdx), text: choice })),
    correctAnswer: toOptionId(question.correct_index),
    explanation: question.explanation,
  }
}

function PracticeContent() {
  const { setCurrentQuestionId, messages } = useChat()
  const { primaryCertification } = useCertificationFocus()
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [correctQuestions, setCorrectQuestions] = useState<number[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([])
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function loadQuestions() {
      try {
        setIsLoading(true)
        setLoadingError(null)
        const apiQuestions = await getJson<ApiQuestion[]>("/questions", { limit: 10 })
        if (!active) return
        if (apiQuestions.length > 0) {
          setQuestions(apiQuestions.map(mapApiQuestion))
        }
      } catch (error) {
        if (!active) return
        setLoadingError(getErrorMessage(error))
        setQuestions(fallbackQuestions)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadQuestions()
    return () => {
      active = false
    }
  }, [])

  const currentQ = questions[currentQuestion - 1]
  useEffect(() => {
    if (currentQ) setCurrentQuestionId(currentQ.apiId)
  }, [currentQ, setCurrentQuestionId])

  async function handleSubmitAnswer(questionId: string, selectedIndex: number): Promise<void> {
    try {
      const result = await postJson<SubmitResponse>("/submit", { question_id: questionId, selected_index: selectedIndex })
      if (!answeredQuestions.includes(currentQuestion)) {
        setAnsweredQuestions((prev) => [...prev, currentQuestion])
      }
      if (result.correct) {
        setCorrectQuestions((prev) => (prev.includes(currentQuestion) ? prev : [...prev, currentQuestion]))
      } else {
        setCorrectQuestions((prev) => prev.filter((q) => q !== currentQuestion))
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
    }
  }

  function handlePrev() {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1)
  }

  function handleNext() {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  function handleFlag() {
    if (flaggedQuestions.includes(currentQuestion)) {
      setFlaggedQuestions(flaggedQuestions.filter((q) => q !== currentQuestion))
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion])
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icons.refresh className="h-4 w-4 animate-spin" />
          Loading questions...
        </div>
      </div>
    )
  }

  if (!currentQ) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">No questions available.</div>
      </div>
    )
  }

  return (
    <>
      <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <Icons.practice className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Practice</h1>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {primaryCertification
                  ? `${primaryCertification.label} question training with AI tutoring`
                  : "Exam-focused questions with AI tutoring"}
              </p>
            </div>
            <button
              onClick={handleFlag}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium transition-all duration-200 sm:h-10 sm:px-5 sm:text-sm",
                flaggedQuestions.includes(currentQuestion)
                  ? "bg-accent/10 text-accent"
                  : "border border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icons.flag className="h-4 w-4" />
              {flaggedQuestions.includes(currentQuestion) ? "Flagged" : "Flag Question"}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
            {loadingError && (
              <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                Backend question service unavailable. Showing fallback questions.
              </div>
            )}
            <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-foreground">Question {currentQuestion} of {questions.length}</span>
              <span className="text-muted-foreground">{answeredQuestions.length} answered</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(currentQuestion / Math.max(questions.length, 1)) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Answered: <span className="font-semibold text-foreground">{answeredQuestions.length}/{questions.length}</span></span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Remaining: <span className="font-semibold text-foreground">{Math.max(questions.length - answeredQuestions.length, 0)}</span></span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">Flagged: <span className="font-semibold text-foreground">{flaggedQuestions.length}</span></span>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-foreground sm:text-sm">Question Navigator</p>
              <QuestionNavigator
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answeredQuestions={answeredQuestions}
                correctQuestions={correctQuestions}
                flaggedQuestions={flaggedQuestions}
                onSelect={setCurrentQuestion}
                compact
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <div>
              <QuestionCard
                questionNumber={currentQuestion}
                totalQuestions={questions.length}
                question={currentQ.question}
                options={currentQ.options}
                correctAnswer={currentQ.correctAnswer}
                explanation={currentQ.explanation}
                onSubmit={(selectedAnswer) => {
                  const selectedIndex = selectedAnswer.charCodeAt(0) - 97
                  return handleSubmitAnswer(currentQ.apiId, selectedIndex)
                }}
              />

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 1}
                  className="flex h-10 items-center gap-2 rounded-full border-2 border-border px-5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length}
                  className="flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-border bg-card xl:flex">
              <ChatPanel className="w-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Chat Trigger & Drawer */}
      <ChatTriggerButton onClick={() => setChatDrawerOpen(true)} hasMessages={messages.length > 0} />
      <ChatDrawer isOpen={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} />
    </>
  )
}

export default function PracticePage() {
  return (
    <AppLayout>
      <ChatProvider>
        <PracticeContent />
      </ChatProvider>
    </AppLayout>
  )
}
