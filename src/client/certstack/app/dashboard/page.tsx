import { AppLayout } from "@/components/app-layout"
import { AppHeader } from "@/components/app-header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ProgressChart } from "@/components/dashboard/progress-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SubjectProgress } from "@/components/dashboard/subject-progress"
import { UpcomingExams } from "@/components/dashboard/upcoming-exams"

export default function DashboardPage() {
  return (
    <AppLayout>
      <AppHeader title="Dashboard" subtitle="Welcome back, John" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          {/* Stat Cards */}
          <StatCards />

          {/* Charts + Activity Row */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProgressChart />
            </div>
            <div>
              <SubjectProgress />
            </div>
          </div>

          {/* Activity + Upcoming Row */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity />
            <UpcomingExams />
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
