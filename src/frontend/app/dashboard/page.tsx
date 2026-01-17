"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AppHeader } from "@/components/app-header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppHeader />
        <DashboardContent />
      </div>
    </ProtectedRoute>
  )
}
