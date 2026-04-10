"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface Option {
  id: string
  text: string
}

interface QuestionCardProps {
  questionNumber: number
  totalQuestions: number
  question: string
  options: Option[]
  correctAnswer: string
  explanation: string
  onSubmit?: (selectedAnswer: string) => Promise<void>
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctAnswer,
  explanation,
  onSubmit,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setSelectedAnswer(null)
    setShowResult(false)
    setShowExplanation(false)
    setIsSubmitting(false)
  }, [questionNumber, question])

  const isCorrect = selectedAnswer === correctAnswer

  function handleSelect(optionId: string) {
    if (showResult) return
    setSelectedAnswer(optionId)
  }

  async function handleSubmit() {
    if (!selectedAnswer) return
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(selectedAnswer)
      }
      setShowResult(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleShowExplanation() {
    setShowExplanation(!showExplanation)
  }

  function getOptionStyle(optionId: string) {
    if (!showResult) {
      return optionId === selectedAnswer
        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
        : "border-border hover:border-primary/50 hover:bg-secondary/50"
    }
    if (optionId === correctAnswer) {
      return "border-chart-3 bg-chart-3/10"
    }
    if (optionId === selectedAnswer && !isCorrect) {
      return "border-destructive bg-destructive/10"
    }
    return "border-border opacity-50"
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 elevation-1">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-6 text-lg font-semibold leading-relaxed text-foreground">
        {question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={showResult || isSubmitting}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-sm transition-all duration-200",
              getOptionStyle(option.id)
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1 text-foreground">{option.text}</span>
            {showResult && option.id === correctAnswer && (
              <Icons.checkCircle className="h-5 w-5 shrink-0 text-chart-3" />
            )}
            {showResult && option.id === selectedAnswer && !isCorrect && (
              <Icons.xCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className={cn(
              "h-12 rounded-full px-8 text-sm font-medium transition-all duration-200",
              selectedAnswer && !isSubmitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg glow-primary"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Checking..." : "Submit Answer"}
          </button>
        ) : (
          <>
            <button
              onClick={handleShowExplanation}
              className="flex h-12 items-center gap-2 rounded-full border-2 border-border px-6 text-sm font-medium text-primary transition-all duration-200 hover:border-primary hover:bg-primary/10"
            >
              <Icons.lightbulb className="h-4 w-4" />
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>
          </>
        )}
      </div>

      {/* Result Banner */}
      {showResult && (
        <div
          className={cn(
            "mt-6 flex items-center gap-3 rounded-xl p-4",
            isCorrect ? "bg-chart-3/10" : "bg-destructive/10"
          )}
        >
          {isCorrect ? (
            <>
              <Icons.checkCircle className="h-5 w-5 text-chart-3" />
              <span className="text-sm font-medium text-chart-3">Correct! Well done.</span>
            </>
          ) : (
            <>
              <Icons.xCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Incorrect. The correct answer is {options.find((o) => o.id === correctAnswer)?.text}.
              </span>
            </>
          )}
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Icons.lightbulb className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Explanation</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{explanation}</p>
        </div>
      )}
    </div>
  )
}
