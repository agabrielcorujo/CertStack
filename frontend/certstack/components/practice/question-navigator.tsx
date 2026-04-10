"use client"

import { cn } from "@/lib/utils"

interface QuestionNavigatorProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: number[]
  correctQuestions: number[]
  flaggedQuestions: number[]
  onSelect: (index: number) => void
  compact?: boolean
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  correctQuestions,
  flaggedQuestions,
  onSelect,
  compact = false,
}: QuestionNavigatorProps) {
  return (
    <div>
      {!compact && <h4 className="mb-3 text-sm font-semibold text-foreground">Questions</h4>}
      <div className={cn("grid gap-2", compact ? "grid-cols-5 sm:grid-cols-10" : "grid-cols-5")}>
        {Array.from({ length: totalQuestions }, (_, i) => {
          const num = i + 1
          const isCurrent = num === currentQuestion
          const isAnswered = answeredQuestions.includes(num)
          const isCorrect = correctQuestions.includes(num)
          const isIncorrect = isAnswered && !isCorrect
          const isFlagged = flaggedQuestions.includes(num)

          return (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={cn(
                "relative flex w-full items-center justify-center rounded-lg font-medium transition-all duration-150",
                compact ? "h-8 text-[11px]" : "h-9 text-xs",
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isCorrect
                    ? "border border-chart-3/30 bg-chart-3/10 text-chart-3"
                    : isIncorrect
                      ? "border border-destructive/30 bg-destructive/10 text-destructive"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {num}
              {isFlagged && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", compact ? "mt-3" : "mt-5")}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-chart-3 bg-chart-3/10" />
          <span className="text-xs text-muted-foreground">Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-destructive/40 bg-destructive/15" />
          <span className="text-xs text-muted-foreground">Incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="text-xs text-muted-foreground">Flagged</span>
        </div>
      </div>
    </div>
  )
}
