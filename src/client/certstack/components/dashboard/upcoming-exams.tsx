"use client"

import { Calendar, ArrowRight } from "lucide-react"

const exams = [
  {
    id: 1,
    name: "Anatomy Midterm",
    date: "Feb 15, 2026",
    daysLeft: 8,
    questions: 100,
    duration: "2 hours",
  },
  {
    id: 2,
    name: "Pharmacology Final",
    date: "Feb 22, 2026",
    daysLeft: 15,
    questions: 150,
    duration: "3 hours",
  },
  {
    id: 3,
    name: "Biochemistry Quiz",
    date: "Mar 1, 2026",
    daysLeft: 22,
    questions: 50,
    duration: "1 hour",
  },
]

function getDaysLeftColor(days: number) {
  if (days <= 7) return { bg: "hsl(var(--error-light))", text: "hsl(var(--error))" }
  if (days <= 14) return { bg: "hsl(var(--warning-light))", text: "hsl(var(--warning))" }
  return { bg: "hsl(var(--success-light))", text: "hsl(var(--success))" }
}

export function UpcomingExams() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Upcoming Exams</h3>
        <button className="text-sm font-medium text-[hsl(var(--primary-500))] transition-colors hover:text-[hsl(var(--primary-600))]">
          See All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {exams.map((exam) => {
          const daysColor = getDaysLeftColor(exam.daysLeft)
          return (
            <div
              key={exam.id}
              className="group flex cursor-pointer items-center gap-4 rounded-xl border border-[hsl(var(--border-light))] p-4 transition-all duration-200 hover:border-[hsl(var(--primary-200))] hover:shadow-md"
            >
              {/* Calendar icon */}
              <div 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "hsl(var(--pastel-blue))" }}
              >
                <Calendar 
                  className="h-5 w-5" 
                  style={{ color: "hsl(var(--primary-500))" }}
                  strokeWidth={2}
                />
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{exam.name}</p>
                <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))]">
                  {exam.questions} questions / {exam.duration}
                </p>
              </div>
              
              {/* Days left badge and arrow */}
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: daysColor.bg, color: daysColor.text }}
                >
                  {exam.daysLeft}d left
                </span>
                <ArrowRight className="h-4 w-4 text-[hsl(var(--text-tertiary))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
