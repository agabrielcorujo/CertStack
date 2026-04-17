"use client"

import { CategoryBreakdown } from "@/lib/api/flashcards"

interface SubjectProgressProps {
  categoryBreakdown: CategoryBreakdown[]
}

const colorMap: Record<string, { from: string; to: string }> = {
  "Cloud Concepts": { from: "hsl(var(--subject-anatomy))", to: "hsl(223 100% 76%)" },
  "AWS Compute": { from: "hsl(var(--subject-pharma))", to: "hsl(165 75% 60%)" },
  "AWS Storage": { from: "hsl(var(--subject-biochem))", to: "hsl(38 100% 70%)" },
  "AWS Networking": { from: "hsl(var(--subject-pathology))", to: "hsl(255 80% 85%)" },
  "AWS Database": { from: "hsl(var(--subject-micro))", to: "hsl(350 100% 80%)" },
  "Security": { from: "hsl(48 96% 53%)", to: "hsl(48 91% 63%)" },
  "Compliance": { from: "hsl(216 98% 52%)", to: "hsl(217 91% 60%)" },
  "Architecture": { from: "hsl(142 72% 29%)", to: "hsl(142 71% 45%)" },
}

function getColorForCategory(category: string): { from: string; to: string } {
  return colorMap[category] || { from: "hsl(var(--primary-500))", to: "hsl(var(--primary-300))" }
}

export function SubjectProgress({ categoryBreakdown }: SubjectProgressProps) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Category Progress</h3>
        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(var(--text-secondary))]">No category data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Category Progress</h3>
      </div>
      <div className="flex flex-col gap-5">
        {categoryBreakdown.map((category) => {
          const colors = getColorForCategory(category.category)
          const accuracy = category.accuracy_percent || 0
          
          return (
            <div key={category.category} className="space-y-2">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                  {category.category}
                </span>
                <span className="text-xs text-[hsl(var(--text-secondary))]">
                  {category.due_cards} due
                </span>
              </div>
              
              {/* Progress bar - thicker with gradient */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--background-surface))]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${accuracy}%`,
                    background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
                  }}
                />
              </div>
              
              {/* Percentage - larger and colored */}
              <div className="text-right">
                <span 
                  className="text-lg font-bold"
                  style={{ color: colors.from }}
                >
                  {accuracy}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
