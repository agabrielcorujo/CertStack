"use client"

import { cn } from "@/lib/utils"

interface ConfidenceRatingProps {
  value: number
  onChange: (value: number) => void
}

const levels = [
  { value: 1, label: "Guessing", color: "bg-destructive" },
  { value: 2, label: "Unsure", color: "bg-warning" },
  { value: 3, label: "Somewhat", color: "bg-warning" },
  { value: 4, label: "Confident", color: "bg-success" },
  { value: 5, label: "Very Sure", color: "bg-success" },
]

export function ConfidenceRating({ value, onChange }: ConfidenceRatingProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">How confident are you?</span>
        <span className="text-sm text-muted-foreground">{levels.find((l) => l.value === value)?.label}</span>
      </div>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            type="button"
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "flex-1 h-2 rounded-full transition-all",
              value >= level.value ? level.color : "bg-secondary",
              "hover:opacity-80",
            )}
            aria-label={`Set confidence to ${level.label}`}
          />
        ))}
      </div>
    </div>
  )
}
