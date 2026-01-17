"use client"

import type React from "react"

import useSWR from "swr"
import { progressApi, type Progress } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress as ProgressBar } from "@/components/ui/progress"
import { BookOpen, Target, TrendingUp, AlertTriangle, ArrowRight, Flame } from "lucide-react"
import Link from "next/link"

// Mock data for development when API is not available
const mockProgress: Progress = {
  exam_name: "AWS Solutions Architect",
  total_questions: 250,
  completed_questions: 127,
  accuracy: 73.5,
  weak_sections: [
    { name: "Networking & VPC", accuracy: 45, questions_count: 32 },
    { name: "Security & IAM", accuracy: 58, questions_count: 28 },
    { name: "Storage Solutions", accuracy: 62, questions_count: 24 },
  ],
  study_streak: 7,
}

export function DashboardContent() {
  const { user } = useAuth()

  // Try to fetch from API, fallback to mock data
  const { data: progress, isLoading } = useSWR<Progress>("progress", async () => {
    try {
      return await progressApi.getProgress()
    } catch {
      // Return mock data if API fails
      return mockProgress
    }
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const data = progress || mockProgress
  const completionPercent = Math.round((data.completed_questions / data.total_questions) * 100)

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || "Student"}</h1>
        <p className="text-muted-foreground">Continue your journey to master {data.exam_name}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link href="/study">
          <Button size="lg" className="gap-2">
            <BookOpen className="h-5 w-5" />
            Start Studying
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/review">
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <Target className="h-5 w-5" />
            Review Weak Areas
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Progress"
          value={`${completionPercent}%`}
          subtitle={`${data.completed_questions} of ${data.total_questions} questions`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Accuracy"
          value={`${data.accuracy}%`}
          subtitle="Overall correct answers"
          icon={<Target className="h-5 w-5" />}
          valueColor={data.accuracy >= 70 ? "text-success" : data.accuracy >= 50 ? "text-warning" : "text-destructive"}
        />
        <StatCard
          title="Study Streak"
          value={`${data.study_streak} days`}
          subtitle="Keep it going!"
          icon={<Flame className="h-5 w-5" />}
          valueColor="text-warning"
        />
        <StatCard
          title="Weak Sections"
          value={data.weak_sections.length.toString()}
          subtitle="Areas to focus on"
          icon={<AlertTriangle className="h-5 w-5" />}
          valueColor="text-destructive"
        />
      </div>

      {/* Progress Overview & Weak Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overall Progress */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Questions Completed</span>
                <span className="font-medium">{completionPercent}%</span>
              </div>
              <ProgressBar value={completionPercent} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Accuracy</span>
                <span className="font-medium">{data.accuracy}%</span>
              </div>
              <ProgressBar
                value={data.accuracy}
                className="h-3"
                style={
                  {
                    "--progress-background":
                      data.accuracy >= 70
                        ? "var(--success)"
                        : data.accuracy >= 50
                          ? "var(--warning)"
                          : "var(--destructive)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {completionPercent >= 80
                  ? "Great progress! You're almost ready for the exam."
                  : completionPercent >= 50
                    ? "You're making good progress. Keep studying!"
                    : "Keep going! Consistent practice leads to success."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weak Sections */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Weak Sections</CardTitle>
            <Link href="/review">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Review All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.weak_sections.map((section) => (
                <div key={section.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{section.name}</span>
                    <span
                      className={`text-sm font-medium ${
                        section.accuracy >= 70
                          ? "text-success"
                          : section.accuracy >= 50
                            ? "text-warning"
                            : "text-destructive"
                      }`}
                    >
                      {section.accuracy}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      value={section.accuracy}
                      className="h-2 flex-1"
                      style={
                        {
                          "--progress-background":
                            section.accuracy >= 70
                              ? "var(--success)"
                              : section.accuracy >= 50
                                ? "var(--warning)"
                                : "var(--destructive)",
                        } as React.CSSProperties
                      }
                    />
                    <span className="text-xs text-muted-foreground w-20">{section.questions_count} questions</span>
                  </div>
                </div>
              ))}
            </div>
            {data.weak_sections.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No weak sections detected yet. Keep studying!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = "",
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  valueColor?: string
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-44" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
