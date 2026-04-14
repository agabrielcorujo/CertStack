"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { AppHeader } from "@/components/app-header"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionNavigator } from "@/components/practice/question-navigator"
import { Flag, ChevronLeft, ChevronRight } from "lucide-react"
import {
  fetchPracticeFlashcards,
  getOrStartStudySession,
  recordFlashcardReview,
  type PracticeFlashcard,
} from "@/lib/api/flashcards"

const DEFAULT_EXAM = "cloud practitioner"
const DEFAULT_CATEGORY = "Cloud Concepts"

export default function PracticePage() {
  const [questions, setQuestions] = useState<PracticeFlashcard[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([])

  useEffect(() => {
    let isCancelled = false

    async function loadPracticeData() {
      try {
        setIsLoading(true)
        setLoadError(null)

        const [fetchedQuestions, activeSessionId] = await Promise.all([
          fetchPracticeFlashcards({
            exam: DEFAULT_EXAM,
            category: DEFAULT_CATEGORY,
            limit: 20,
          }),
          getOrStartStudySession({
            exam: DEFAULT_EXAM,
            category: DEFAULT_CATEGORY,
          }),
        ])

        if (isCancelled) return

        setQuestions(fetchedQuestions)
        setSessionId(activeSessionId)
        setCurrentQuestion(1)
      } catch (error) {
        if (isCancelled) return
        setLoadError(error instanceof Error ? error.message : "Failed to load flashcards")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadPracticeData()
    return () => {
      isCancelled = true
    }
  }, [])

  const currentQ = questions[currentQuestion - 1]

  function handlePrev() {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1)
  }

  function handleNext() {
    if (currentQuestion < questions.length) {
      if (!answeredQuestions.includes(currentQuestion)) {
        setAnsweredQuestions([...answeredQuestions, currentQuestion])
      }
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

  async function handleQuestionAnswered(payload: { isCorrect: boolean }) {
    if (!currentQ) return

    try {
      await recordFlashcardReview({
        questionId: currentQ.questionId,
        wasCorrect: payload.isCorrect,
        confidence: payload.isCorrect ? 4 : 2,
        sessionId,
      })
    } catch (error) {
      // Keep practice flow responsive even if telemetry fails.
      console.error("Failed to record review", error)
    }
  }

  const hasQuestions = questions.length > 0

  return (
    <AppLayout>
      <AppHeader title="Practice" subtitle={`${DEFAULT_EXAM} - ${DEFAULT_CATEGORY}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          {isLoading && <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">Loading flashcards...</p>}
          {loadError && <p className="mb-4 text-sm text-[#B91C1C]">{loadError}</p>}
          {!isLoading && !loadError && !hasQuestions && (
            <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">No flashcards available for this selection yet.</p>
          )}

          {hasQuestions && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            {/* Main Question Area */}
            <div>
              <QuestionCard
                questionNumber={currentQuestion}
                totalQuestions={questions.length}
                question={currentQ.question}
                options={currentQ.options}
                correctAnswer={currentQ.correctAnswer}
                explanation={currentQ.explanation}
                onAnswered={handleQuestionAnswered}
              />

              {/* Navigation Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 1}
                  className="flex h-10 items-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-5 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 hover:border-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--surface))] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={handleFlag}
                  className={`flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 ${
                    flaggedQuestions.includes(currentQuestion)
                      ? "bg-[#FEF3C7] text-[#B45309]"
                      : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {flaggedQuestions.includes(currentQuestion) ? "Flagged" : "Flag"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length}
                  className="flex h-10 items-center gap-2 rounded-full bg-[#4A7FFF] px-5 text-sm font-medium text-[#FFFFFF] transition-all duration-200 hover:bg-[#3D6EE8] hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigator */}
            <div className="hidden lg:block">
              <QuestionNavigator
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answeredQuestions={answeredQuestions}
                flaggedQuestions={flaggedQuestions}
                onSelect={setCurrentQuestion}
              />
            </div>
          </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
