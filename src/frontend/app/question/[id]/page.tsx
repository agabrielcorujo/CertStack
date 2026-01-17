"use client"

import { use } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { QuestionDetail } from "@/components/question/question-detail"

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppHeader />
        <QuestionDetail questionId={id} />
      </div>
    </ProtectedRoute>
  )
}
