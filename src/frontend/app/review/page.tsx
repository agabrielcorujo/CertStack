"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { ReviewContent } from "@/components/review/review-content"

export default function ReviewPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppHeader />
        <ReviewContent />
      </div>
    </ProtectedRoute>
  )
}
