"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { StudySession } from "@/components/study/study-session"

export default function StudyPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppHeader />
        <StudySession mode="practice" />
      </div>
    </ProtectedRoute>
  )
}
