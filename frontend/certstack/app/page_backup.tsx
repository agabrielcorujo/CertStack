// Backup of landing page - can be restored later if needed
"use client"

import Link from "next/link"
import { BookOpen, CheckCircle, TrendingUp, Award, ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A7FFF]/5 via-white to-[#4A7FFF]/5">
      {/* Navigation */}
      <nav className="border-b border-[hsl(var(--border-light))] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A7FFF]">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[hsl(var(--text-primary))]">CertStack</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex h-10 items-center rounded-xl px-5 text-sm font-medium text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--text-primary))]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex h-10 items-center rounded-full bg-[#4A7FFF] px-5 text-sm font-medium text-white transition-all hover:bg-[#3D6EE8] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#4A7FFF]/10 px-4 py-2 text-sm font-medium text-[#4A7FFF]">
            <Sparkles className="h-4 w-4" />
            AI-Powered Certification Prep
          </div>
          <h1 className="text-5xl font-bold leading-tight text-[hsl(var(--text-primary))] sm:text-6xl">
            Master Your Certifications with Confidence
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
            Prepare for professional certification exams with adaptive practice, comprehensive study materials,
            and detailed performance analytics. Your path to certification success starts here.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/signup"
              className="flex h-12 items-center gap-2 rounded-full bg-[#4A7FFF] px-8 text-sm font-medium text-white transition-all hover:bg-[#3D6EE8] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex h-12 items-center rounded-full border-2 border-[hsl(var(--border))] bg-white px-8 text-sm font-medium text-[hsl(var(--text-primary))] transition-all hover:border-[hsl(var(--text-tertiary))]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <CheckCircle className="h-6 w-6 text-[#4A7FFF]" />
            </div>
            <h3 className="mt-4 font-semibold text-[hsl(var(--text-primary))]">
              Adaptive Practice
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
              AI-powered question selection that adapts to your skill level and focuses on your weak areas.
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDF4]">
              <TrendingUp className="h-6 w-6 text-[#10B981]" />
            </div>
            <h3 className="mt-4 font-semibold text-[hsl(var(--text-primary))]">
              Progress Tracking
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
              Detailed analytics and insights to monitor your progress and identify areas for improvement.
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <Award className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <h3 className="mt-4 font-semibold text-[hsl(var(--text-primary))]">
              Mock Exams
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
              Full-length practice exams that simulate real test conditions to build confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F3FF]">
              <BookOpen className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <h3 className="mt-4 font-semibold text-[hsl(var(--text-primary))]">
              Study Resources
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
              Access comprehensive study materials, notes, and video tutorials for every topic.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-[hsl(var(--border-light))] bg-gradient-to-br from-[#4A7FFF] to-[#3D6EE8] p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold">Trusted by Professionals Worldwide</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold">50K+</p>
              <p className="mt-2 text-white/80">Practice Questions</p>
            </div>
            <div>
              <p className="text-5xl font-bold">15K+</p>
              <p className="mt-2 text-white/80">Active Users</p>
            </div>
            <div>
              <p className="text-5xl font-bold">92%</p>
              <p className="mt-2 text-white/80">Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-[hsl(var(--text-primary))]">
          Ready to start your journey?
        </h2>
        <p className="mt-4 text-lg text-[hsl(var(--text-secondary))]">
          Join thousands of professionals achieving their certification goals.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#4A7FFF] px-8 text-sm font-medium text-white transition-all hover:bg-[#3D6EE8] hover:-translate-y-0.5 hover:shadow-lg"
        >
          Get Started Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border-light))] bg-[hsl(var(--surface))] py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            © 2026 CertStack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
