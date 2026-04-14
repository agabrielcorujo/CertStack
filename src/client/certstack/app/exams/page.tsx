"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Clock3, Search, Target } from "lucide-react"

import { AppShell } from "@/components/certstack/app-shell"
import { ApiError, apiFetch } from "@/lib/api"
import { clearStoredSession, getStoredSession } from "@/lib/auth"
import { normalizeCertCatalog } from "@/lib/study"
import type { ExamCatalogItem, ProfileResponse } from "@/lib/types"

export default function ExamsPage() {
  const router = useRouter()
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([])
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      router.replace("/login")
      return
    }

    let active = true

    async function loadData() {
      try {
        const [catalogResponse, profileResponse] = await Promise.all([
          apiFetch<ExamCatalogItem[]>("/exams/catalog"),
          apiFetch<ProfileResponse>("/profile/"),
        ])

        if (!active) {
          return
        }

        setCatalog(catalogResponse)
        setProfile(profileResponse)
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearStoredSession()
          router.replace("/login")
          return
        }

        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load exams.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [router])

  const filteredCatalog = catalog.filter((exam) => {
    const query = deferredSearch.trim().toLowerCase()
    if (!query) {
      return true
    }

    return (
      exam.display_name.toLowerCase().includes(query) ||
      exam.description.toLowerCase().includes(query) ||
      exam.focus.toLowerCase().includes(query)
    )
  })

  return (
    <AppShell
      title="Exam Center"
      subtitle="Launch full-length practice sessions against the real backend question bank."
      actions={
        <Link className="action-button" href="/flashcards">
          Warm up with flashcards
        </Link>
      }
    >
      <section className="hero-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Full-length mode</p>
            <h3 className="mt-2 text-4xl font-bold tracking-[-0.06em]">
              Treat practice like test day.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--ink-soft))]">
              Each exam session pulls a balanced set of questions by domain, keeps a timer running,
              and writes your final correct and incorrect totals back into the dashboard stats.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--ink-faint))]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="text-field pl-11"
              placeholder="Search exams"
            />
          </div>
        </div>
      </section>

      {loading ? <section className="panel">Loading exam catalog...</section> : null}
      {!loading && error ? <section className="panel text-[hsl(var(--danger))]">{error}</section> : null}

      {!loading ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredCatalog.map((exam) => {
            const cert = profile?.certs.find((item) => normalizeCertCatalog(item, catalog)?.slug === exam.slug)
            const estimatedMinutes = Math.max(45, Math.round(exam.question_count * 1.3))

            return (
              <article key={exam.slug} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Available exam</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em]">{exam.display_name}</h3>
                  </div>
                  <span className="badge-chip">
                    <Target className="h-4 w-4" />
                    {cert ? `${cert.accuracy}% accuracy` : "No attempts yet"}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-[hsl(var(--ink-soft))]">
                  {exam.description || exam.focus || "Certification-ready question bank with balanced domain coverage."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="panel-muted">
                    <p className="eyebrow">Questions</p>
                    <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">{exam.question_count}</p>
                  </div>
                  <div className="panel-muted">
                    <p className="eyebrow">Estimated time</p>
                    <p className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-[-0.05em]">
                      <Clock3 className="h-5 w-5 text-[hsl(var(--accent))]" />
                      {estimatedMinutes}m
                    </p>
                  </div>
                  <div className="panel-muted">
                    <p className="eyebrow">Logged attempts</p>
                    <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">{cert?.attempts ?? 0}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {exam.domains.map((domain) => (
                    <span key={domain.name} className="badge-chip">
                      {domain.name}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-[hsl(var(--ink-soft))]">
                    Stats recorded to the same profile totals used on the dashboard.
                  </p>
                  <Link className="action-button" href={`/exams/${exam.slug}`}>
                    Start exam
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}
    </AppShell>
  )
}
