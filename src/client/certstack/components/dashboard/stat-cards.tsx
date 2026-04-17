"use client"

import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { FlashcardProgress, SessionStats } from "@/lib/api/flashcards"

interface StatCardsProps {
  progress: FlashcardProgress | null
  sessions: SessionStats | null
}

export function StatCards({ progress, sessions }: StatCardsProps) {
  const stats = [
    {
      label: "Tracked Cards",
      value: progress?.tracked_cards.toLocaleString() ?? "0",
      change: `${progress?.due_cards ?? 0} due`,
      changeType: "neutral" as const,
      icon: BookOpen,
      iconBg: "hsl(var(--pastel-blue))",
      iconColor: "hsl(var(--primary-500))",
      blobFrom: "hsl(var(--pastel-blue))",
      blobTo: "transparent",
    },
    {
      label: "Accuracy",
      value: `${progress?.overall_accuracy_percent ?? 0}%`,
      change: progress ? "+2%" : "Starting",
      changeType: progress ? "positive" : "neutral",
      icon: CheckCircle,
      iconBg: "hsl(var(--pastel-mint))",
      iconColor: "hsl(var(--success))",
      blobFrom: "hsl(var(--pastel-mint))",
      blobTo: "transparent",
    },
    {
      label: "Total Reviews",
      value: progress?.total_reviews.toLocaleString() ?? "0",
      change: `${sessions?.session_count ?? 0} sessions`,
      changeType: "neutral" as const,
      icon: TrendingUp,
      iconBg: "hsl(var(--pastel-yellow))",
      iconColor: "hsl(var(--warning))",
      blobFrom: "hsl(var(--pastel-yellow))",
      blobTo: "transparent",
    },
    {
      label: "Session Accuracy",
      value: `${sessions?.session_accuracy_percent ?? 0}%`,
      change: sessions?.cards_reviewed ? `${sessions.cards_reviewed} reviewed` : "No sessions",
      changeType: "neutral" as const,
      icon: Clock,
      iconBg: "hsl(var(--pastel-lavender))",
      iconColor: "hsl(var(--subject-pathology))",
      blobFrom: "hsl(var(--pastel-lavender))",
      blobTo: "transparent",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          {/* Decorative gradient blob */}
          <div 
            className="absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-30 blur-2xl"
            style={{
              background: `linear-gradient(to bottom right, ${stat.blobFrom}, ${stat.blobTo})`
            }}
          />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              {/* Icon circle - larger and softer */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: stat.iconBg }}
              >
                <stat.icon 
                  className="h-6 w-6" 
                  style={{ color: stat.iconColor }}
                  strokeWidth={2}
                />
              </div>
              
              {/* Change badge - softer style */}
              {stat.changeType === "positive" && (
                <span className="rounded-full bg-[hsl(var(--success-light))] px-3 py-1 text-xs font-semibold text-[hsl(var(--success))]">
                  {stat.change}
                </span>
              )}
              {stat.changeType === "neutral" && (
                <span className="text-xs font-medium text-[hsl(var(--text-tertiary))]">
                  {stat.change}
                </span>
              )}
            </div>
            
            {/* Value and label - improved hierarchy */}
            <div className="mt-4">
              <p className="text-4xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-[hsl(var(--text-secondary))]">
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
