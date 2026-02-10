"use client"

import { BookOpen, CheckCircle, Clock, TrendingUp } from "lucide-react"

const stats = [
  {
    label: "Total Questions",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: BookOpen,
    iconBg: "hsl(var(--pastel-blue))",
    iconColor: "hsl(var(--primary-500))",
    blobFrom: "hsl(var(--pastel-blue))",
    blobTo: "transparent",
  },
  {
    label: "Completed",
    value: "1,234",
    change: "+8%",
    changeType: "positive" as const,
    icon: CheckCircle,
    iconBg: "hsl(var(--pastel-mint))",
    iconColor: "hsl(var(--success))",
    blobFrom: "hsl(var(--pastel-mint))",
    blobTo: "transparent",
  },
  {
    label: "Avg. Score",
    value: "78%",
    change: "+5%",
    changeType: "positive" as const,
    icon: TrendingUp,
    iconBg: "hsl(var(--pastel-yellow))",
    iconColor: "hsl(var(--warning))",
    blobFrom: "hsl(var(--pastel-yellow))",
    blobTo: "transparent",
  },
  {
    label: "Study Time",
    value: "45h",
    change: "This month",
    changeType: "neutral" as const,
    icon: Clock,
    iconBg: "hsl(var(--pastel-lavender))",
    iconColor: "hsl(var(--subject-pathology))",
    blobFrom: "hsl(var(--pastel-lavender))",
    blobTo: "transparent",
  },
]

export function StatCards() {
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
