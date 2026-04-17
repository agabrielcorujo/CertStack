"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { AppHeader } from "@/components/app-header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SubjectProgress } from "@/components/dashboard/subject-progress"
import { UpcomingExams } from "@/components/dashboard/upcoming-exams"
import { getFlashcardProgress, FlashcardProgress, SessionStats, CategoryBreakdown } from "@/lib/api/flashcards"

const DEFAULT_EXAM = "cloud practitioner"

export default function DashboardPage() {
  const [progress, setProgress] = useState<FlashcardProgress | null>(null)
  const [sessions, setSessions] = useState<SessionStats | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        setLoadError(null)
        const data = await getFlashcardProgress({ exam: DEFAULT_EXAM })
        if (data) {
          setProgress(data.progress)
          setSessions(data.sessions)
          setCategoryBreakdown(data.categoryBreakdown)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <AppLayout>
      <AppHeader title="Dashboard" subtitle="Welcome back, John" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-[hsl(var(--text-secondary))]">Loading dashboard data...</p>
            </div>
          )}

          {loadError && (
            <div className="mb-6 rounded-lg border border-[hsl(var(--error-light))] bg-[hsl(var(--error))]/5 p-4">
              <p className="text-sm text-[hsl(var(--error))]">{loadError}</p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Stat Cards */}
              <StatCards progress={progress} sessions={sessions} />

              {/* Charts + Activity Row */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ProgressChart categoryBreakdown={categoryBreakdown} />
                </div>
                <div>
                  <SubjectProgress categoryBreakdown={categoryBreakdown} />
                </div>
              </div>

              {/* Activity + Upcoming Row */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RecentActivity sessions={sessions} />
                <UpcomingExams />
              </div>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
