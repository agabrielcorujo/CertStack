"use client"

import { CheckCircle, Clock } from "lucide-react"
import { SessionStats } from "@/lib/api/flashcards"

interface RecentActivityProps {
  sessions: SessionStats | null
}

export function RecentActivity({ sessions }: RecentActivityProps) {
  if (!sessions) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Session Statistics</h3>
        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(var(--text-secondary))]">No session data available</p>
        </div>
      </div>
    )
  }

  const formattedLastSession = sessions.last_session_at
    ? new Date(sessions.last_session_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No sessions yet"

  const stats = [
    {
      label: "Total Sessions",
      value: sessions.session_count.toString(),
      icon: CheckCircle,
      color: "hsl(var(--success))",
      bg: "hsl(var(--success-light))",
    },
    {
      label: "Cards Reviewed",
      value: sessions.cards_reviewed.toString(),
      icon: Clock,
      color: "hsl(var(--warning))",
      bg: "hsl(var(--warning-light))",
    },
  ]

  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Session Statistics</h3>
      </div>
      <div className="flex flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="flex items-start gap-4">
              {/* Icon circle */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon 
                  className="h-5 w-5" 
                  style={{ color: stat.color }}
                  strokeWidth={2}
                />
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))]">
                  Overall statistics
                </p>
              </div>
              
              {/* Value */}
              <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-[hsl(var(--text-primary))]">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}

        {/* Last session info */}
        <div className="mt-4 border-t border-[hsl(var(--border-light))] pt-4">
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            Last session: <span className="font-semibold text-[hsl(var(--text-primary))]">{formattedLastSession}</span>
          </p>
          <p className="mt-2 text-xs text-[hsl(var(--text-secondary))]">
            Session accuracy: <span className="font-semibold text-[hsl(var(--text-primary))]">{sessions.session_accuracy_percent}%</span>
          </p>
        </div>
      </div>
    </div>
  )
}
