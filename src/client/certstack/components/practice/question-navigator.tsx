"use client"

import { cn } from "@/lib/utils"
import { Clock, Flag } from "lucide-react"

interface QuestionNavigatorProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: number[]
  flaggedQuestions: number[]
  onSelect: (index: number) => void
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Timer */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-[hsl(var(--surface))] p-4">
        <Clock className="h-5 w-5 text-[hsl(var(--text-secondary))]" />
        <div>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Time Remaining</p>
          <p className="text-lg font-bold tabular-nums text-[hsl(var(--text-primary))]">45:32</p>
        </div>
      </div>

      {/* Question Grid */}
      <h4 className="mb-3 text-sm font-semibold text-[hsl(var(--text-primary))]">Questions</h4>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const num = i + 1
          const isCurrent = num === currentQuestion
          const isAnswered = answeredQuestions.includes(num)
          const isFlagged = flaggedQuestions.includes(num)

          return (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150",
                isCurrent
                  ? "bg-[#4A7FFF] text-[#FFFFFF] shadow-sm"
                  : isAnswered
                    ? "bg-[#ECFDF5] text-[#047857]"
                    : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border-light))]"
              )}
            >
              {num}
              {isFlagged && (
                <Flag className="absolute -right-0.5 -top-0.5 h-3 w-3 text-[#F59E0B]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#4A7FFF]" />
          <span className="text-xs text-[hsl(var(--text-secondary))]">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#ECFDF5] border border-[#10B981]" />
          <span className="text-xs text-[hsl(var(--text-secondary))]">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[hsl(var(--surface))]" />
          <span className="text-xs text-[hsl(var(--text-secondary))]">Unanswered</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 border-t border-[hsl(var(--border-light))] pt-4">
        <div className="flex justify-between text-xs">
          <span className="text-[hsl(var(--text-secondary))]">Answered</span>
          <span className="font-medium text-[hsl(var(--text-primary))]">{answeredQuestions.length}/{totalQuestions}</span>
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-[hsl(var(--text-secondary))]">Flagged</span>
          <span className="font-medium text-[hsl(var(--text-primary))]">{flaggedQuestions.length}</span>
        </div>
      </div>
    </div>
  )
}
