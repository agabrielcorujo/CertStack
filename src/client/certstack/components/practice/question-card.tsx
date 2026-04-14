"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Lightbulb } from "lucide-react"

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
  onAnswered?: (payload: {
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }) => void
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctAnswer,
  explanation,
  onAnswered,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const isCorrect = selectedAnswer === correctAnswer

  function handleSelect(optionId: string) {
    if (showResult) return
    setSelectedAnswer(optionId)
  }

  function handleSubmit() {
    if (!selectedAnswer) return
    setShowResult(true)
    onAnswered?.({
      selectedAnswer,
      correctAnswer,
      isCorrect: selectedAnswer === correctAnswer,
    })
  }

  function handleShowExplanation() {
    setShowExplanation(!showExplanation)
  }

  function getOptionStyle(optionId: string) {
    if (!showResult) {
      return optionId === selectedAnswer
        ? "border-[#4A7FFF] bg-[#EFF6FF] ring-2 ring-[#DBEAFE]"
        : "border-[hsl(var(--border))] hover:border-[#BFDBFE] hover:bg-[hsl(var(--surface))]"
    }
    if (optionId === correctAnswer) {
      return "border-[#10B981] bg-[#ECFDF5]"
    }
    if (optionId === selectedAnswer && !isCorrect) {
      return "border-[#EF4444] bg-[#FEF2F2]"
    }
    return "border-[hsl(var(--border))] opacity-50"
  }

  // Reset local answer state when navigating between questions.
  useEffect(() => {
    setSelectedAnswer(null)
    setShowResult(false)
    setShowExplanation(false)
  }, [questionNumber, question])

  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-[hsl(var(--text-secondary))]">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full bg-[#4A7FFF] transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-xs text-[hsl(var(--text-tertiary))]">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-6 text-lg font-semibold leading-relaxed text-[hsl(var(--text-primary))]">
        {question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={showResult}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-sm transition-all duration-200",
              getOptionStyle(option.id)
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--surface))] text-xs font-semibold text-[hsl(var(--text-secondary))]">
              {option.id.toUpperCase()}
            </span>
            <span className="flex-1 text-[hsl(var(--text-primary))]">{option.text}</span>
            {showResult && option.id === correctAnswer && (
              <CheckCircle className="h-5 w-5 shrink-0 text-[#10B981]" />
            )}
            {showResult && option.id === selectedAnswer && !isCorrect && (
              <XCircle className="h-5 w-5 shrink-0 text-[#EF4444]" />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={cn(
              "h-12 rounded-full px-8 text-sm font-medium transition-all duration-200",
              selectedAnswer
                ? "bg-[#4A7FFF] text-[#FFFFFF] hover:bg-[#3D6EE8] hover:-translate-y-px hover:shadow-lg"
                : "bg-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed"
            )}
          >
            Submit Answer
          </button>
        ) : (
          <>
            <button
              onClick={handleShowExplanation}
              className="flex h-12 items-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-6 text-sm font-medium text-[#4A7FFF] transition-all duration-200 hover:border-[#4A7FFF] hover:bg-[#EFF6FF]"
            >
              <Lightbulb className="h-4 w-4" />
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
            isCorrect ? "bg-[#ECFDF5]" : "bg-[#FEF2F2]"
          )}
        >
          {isCorrect ? (
            <>
              <CheckCircle className="h-5 w-5 text-[#10B981]" />
              <span className="text-sm font-medium text-[#047857]">Correct! Well done.</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-[#EF4444]" />
              <span className="text-sm font-medium text-[#B91C1C]">
                {"Incorrect. The correct answer is "}{options.find(o => o.id === correctAnswer)?.text}.
              </span>
            </>
          )}
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-4 rounded-xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface))] p-5">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">Explanation</span>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">{explanation}</p>
        </div>
      )}
    </div>
  )
}
