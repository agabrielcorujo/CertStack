"use client"

import { CheckCircle, Clock, XCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "Anatomy - Chapter 5 Quiz",
    status: "completed" as const,
    score: "92%",
    time: "2 hours ago",
    questions: 25,
  },
  {
    id: 2,
    title: "Pharmacology Practice Set",
    status: "in-progress" as const,
    score: "15/30",
    time: "5 hours ago",
    questions: 30,
  },
  {
    id: 3,
    title: "Biochemistry Final Mock",
    status: "completed" as const,
    score: "78%",
    time: "1 day ago",
    questions: 50,
  },
  {
    id: 4,
    title: "Pathology - Unit 3 Review",
    status: "failed" as const,
    score: "45%",
    time: "2 days ago",
    questions: 40,
  },
  {
    id: 5,
    title: "Microbiology Quick Test",
    status: "completed" as const,
    score: "88%",
    time: "3 days ago",
    questions: 20,
  },
]

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "hsl(var(--success))",
    bg: "hsl(var(--success-light))",
    label: "Completed",
  },
  "in-progress": {
    icon: Clock,
    color: "hsl(var(--warning))",
    bg: "hsl(var(--warning-light))",
    label: "In Progress",
  },
  failed: {
    icon: XCircle,
    color: "hsl(var(--error))",
    bg: "hsl(var(--error-light))",
    label: "Needs Review",
  },
}

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Recent Activity</h3>
        <button className="text-sm font-medium text-[hsl(var(--primary-500))] transition-colors hover:text-[hsl(var(--primary-600))]">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {activities.map((activity) => {
          const config = statusConfig[activity.status]
          const StatusIcon = config.icon
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4"
            >
              {/* Icon circle - larger with better styling */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: config.bg }}
              >
                <StatusIcon 
                  className="h-5 w-5" 
                  style={{ color: config.color }}
                  strokeWidth={2}
                />
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[hsl(var(--text-primary))]">
                  {activity.title}
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))]">
                  {activity.questions} questions
                </p>
              </div>
              
              {/* Score - larger and bolder */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-[hsl(var(--text-primary))]">
                  {activity.score}
                </p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
