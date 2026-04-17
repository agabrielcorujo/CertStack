"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Clock3, Flag, Target } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { AppHeader } from "@/components/app-header"

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return "N/A"

  const start = new Date(startedAt).getTime()
  const end = new Date(endedAt).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "N/A"

  const totalSeconds = Math.floor((end - start) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

export default function PracticeSummaryPage() {
  const searchParams = useSearchParams()

  const exam = searchParams.get("exam") || "cloud practitioner"
  const category = searchParams.get("category") || "General"
  const cardsReviewed = Number(searchParams.get("cardsReviewed") || 0)
  const correctAnswers = Number(searchParams.get("correctAnswers") || 0)
  const flaggedCount = Number(searchParams.get("flaggedCount") || 0)
  const totalQuestions = Number(searchParams.get("totalQuestions") || 0)
  const accuracyPercent = Number(searchParams.get("accuracyPercent") || 0)
  const startedAt = searchParams.get("startedAt")
  const endedAt = searchParams.get("endedAt")

  const incorrectAnswers = Math.max(cardsReviewed - correctAnswers, 0)
  const completionPercent = totalQuestions > 0 ? Math.round((cardsReviewed / totalQuestions) * 100) : 0
  const sessionDuration = formatDuration(startedAt, endedAt)

  return (
    <AppLayout>
      <AppHeader title="Session Summary" subtitle={`${exam} - ${category}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-[hsl(var(--success-light))] p-2">
                <CheckCircle2 className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Session Complete</h2>
                <p className="text-sm text-[hsl(var(--text-secondary))]">Great work. Your latest flashcard session is now saved.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-[hsl(var(--background-surface))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-tertiary))]">Accuracy</p>
                <p className="mt-2 text-3xl font-bold text-[hsl(var(--success))]">{accuracyPercent}%</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--background-surface))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-tertiary))]">Reviewed</p>
                <p className="mt-2 text-3xl font-bold text-[hsl(var(--text-primary))]">{cardsReviewed}</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--background-surface))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-tertiary))]">Correct</p>
                <p className="mt-2 text-3xl font-bold text-[hsl(var(--success))]">{correctAnswers}</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--background-surface))] p-4">
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--text-tertiary))]">Needs Review</p>
                <p className="mt-2 text-3xl font-bold text-[hsl(var(--warning))]">{incorrectAnswers}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[hsl(var(--primary-500))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Completion</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-[hsl(var(--text-primary))]">{completionPercent}%</p>
              <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">{cardsReviewed}/{totalQuestions || cardsReviewed} cards reviewed</p>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[hsl(var(--primary-500))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Session Time</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-[hsl(var(--text-primary))]">{sessionDuration}</p>
              <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">From start to finish</p>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-[hsl(var(--primary-500))]" />
                <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Flagged</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-[hsl(var(--text-primary))]">{flaggedCount}</p>
              <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">Cards marked for revisit</p>
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="rounded-full bg-[#4A7FFF] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3D6EE8]"
            >
              Start New Session
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-[hsl(var(--border))] px-5 py-2 text-sm font-semibold text-[hsl(var(--text-secondary))] transition-colors hover:bg-[hsl(var(--background-surface))]"
            >
              Back to Dashboard
            </Link>
          </section>
        </div>
      </main>
    </AppLayout>
  )
}
