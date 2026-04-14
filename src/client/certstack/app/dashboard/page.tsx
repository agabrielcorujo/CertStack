"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, BrainCircuit, ChartColumnBig, Layers2, Target } from "lucide-react"

import { AppShell } from "@/components/certstack/app-shell"
import { ApiError, apiFetch } from "@/lib/api"
import { clearStoredSession, getStoredSession } from "@/lib/auth"
import { normalizeCertCatalog } from "@/lib/study"
import type { ExamCatalogItem, ProfileResponse } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      router.replace("/login")
      return
    }

    let active = true

    async function loadData() {
      try {
        const [profileResponse, catalogResponse] = await Promise.all([
          apiFetch<ProfileResponse>("/profile/"),
          apiFetch<ExamCatalogItem[]>("/exams/catalog"),
        ])

        if (!active) {
          return
        }

        setProfile(profileResponse)
        setCatalog(catalogResponse)
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearStoredSession()
          router.replace("/login")
          return
        }

        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load dashboard.")
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

  async function handleEnroll(examName: string) {
    setEnrolling(true)
    setError("")

    try {
      await apiFetch("/profile/create-profile", {
        method: "POST",
        body: {
          certs: [examName],
        },
      })

      const updatedProfile = await apiFetch<ProfileResponse>("/profile/")
      setProfile(updatedProfile)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to enroll in this cert.")
    } finally {
      setEnrolling(false)
    }
  }

  const enrolledExams =
    profile?.certs.map((cert) => ({
      cert,
      exam: normalizeCertCatalog(cert, catalog),
    })) ?? []

  return (
    <AppShell
      title="Dashboard"
      subtitle={
        profile
          ? `Track the certifications you are actively studying and the questions you are getting right and wrong.`
          : "Loading your profile and study inventory."
      }
      actions={
        <>
          <Link className="secondary-button" href="/flashcards">
            Study flashcards
          </Link>
          <Link className="action-button" href="/exams">
            Open exam center
          </Link>
        </>
      }
    >
      {loading ? (
        <section className="hero-card">
          <p className="eyebrow">Loading</p>
          <h3 className="mt-4 text-3xl font-bold tracking-[-0.05em]">Building your study dashboard.</h3>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="panel">
          <p className="eyebrow">Error</p>
          <p className="mt-3 text-base text-[hsl(var(--danger))]">{error}</p>
        </section>
      ) : null}

      {!loading && profile && !profile.certs.length && catalog.length ? (
        <section className="hero-card">
          <p className="eyebrow">Start here</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <h3 className="text-4xl font-bold tracking-[-0.06em]">Pick your first certification.</h3>
              <p className="max-w-xl text-sm leading-7 text-[hsl(var(--ink-soft))]">
                Your backend already exposes the Cloud Practitioner dataset. Enroll it once and
                the dashboard will start tracking flashcard and exam results immediately.
              </p>
              <button
                type="button"
                className="action-button"
                onClick={() => handleEnroll(catalog[0].exam_name)}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : `Study ${catalog[0].display_name}`}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="panel-muted">
              <p className="eyebrow">Available now</p>
              <h4 className="mt-3 text-2xl font-bold tracking-[-0.04em]">{catalog[0].display_name}</h4>
              <p className="mt-3 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                {catalog[0].description || catalog[0].focus || "Foundation-level AWS concepts, services, pricing, and security."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {catalog[0].domains.map((domain) => (
                  <span key={domain.name} className="badge-chip">
                    {domain.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && profile && profile.certs.length ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="hero-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-4">
                  <p className="eyebrow">Overview</p>
                  <h3 className="max-w-xl text-4xl font-bold tracking-[-0.06em]">
                    {profile.name ? `${profile.name}, here is your study signal.` : "Here is your study signal."}
                  </h3>
                  <p className="max-w-2xl text-sm leading-7 text-[hsl(var(--ink-soft))]">
                    Stats come directly from the backend profile record. Every flashcard grade and
                    exam submission updates these counts.
                  </p>
                </div>

                <div className="badge-chip">
                  <Layers2 className="h-4 w-4" />
                  {profile.certs.length} active cert{profile.certs.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <article className="metric-card">
                  <div className="metric-label">Questions right</div>
                  <div className="metric-number">{profile.totals.correct}</div>
                </article>
                <article className="metric-card">
                  <div className="metric-label">Questions wrong</div>
                  <div className="metric-number">{profile.totals.incorrect}</div>
                </article>
                <article className="metric-card">
                  <div className="metric-label">Accuracy</div>
                  <div className="metric-number">{profile.totals.accuracy}%</div>
                </article>
                <article className="metric-card">
                  <div className="metric-label">Attempts logged</div>
                  <div className="metric-number">{profile.totals.attempts}</div>
                </article>
              </div>
            </div>

            <div className="panel space-y-5">
              <p className="eyebrow">Next move</p>
              <div className="panel-muted">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="mt-1 h-5 w-5 text-[hsl(var(--brand))]" />
                  <div>
                    <h4 className="text-lg font-semibold">Flashcard sprint</h4>
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                      Use the Quizlet-style deck to keep logging small wins or misses by domain.
                    </p>
                  </div>
                </div>
              </div>
              <div className="panel-muted">
                <div className="flex items-start gap-3">
                  <Target className="mt-1 h-5 w-5 text-[hsl(var(--accent))]" />
                  <div>
                    <h4 className="text-lg font-semibold">Full-length exam</h4>
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                      Run a timed session when you want a realistic performance snapshot.
                    </p>
                  </div>
                </div>
              </div>
              <div className="panel-muted">
                <div className="flex items-start gap-3">
                  <ChartColumnBig className="mt-1 h-5 w-5 text-[hsl(var(--success))]" />
                  <div>
                    <h4 className="text-lg font-semibold">Stats stay honest</h4>
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                      Dashboard counts roll up from both flashcard grading and exam submissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="panel">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Current certifications</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">What you are studying</h3>
                </div>
                <Link href="/exams" className="ghost-button">
                  View exam center
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {enrolledExams.map(({ cert, exam }) => (
                  <article key={cert.cert} className="panel-muted">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-semibold tracking-[-0.03em]">
                          {exam?.display_name ?? cert.cert}
                        </h4>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--ink-soft))]">
                          {exam?.description || exam?.focus || "Study deck and exam mode ready."}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--ink-faint))]">
                          Accuracy
                        </p>
                        <p className="text-2xl font-bold tracking-[-0.05em]">{cert.accuracy}%</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm text-[hsl(var(--ink-soft))]">
                        <span>
                          {cert.correctqnum} right / {cert.incorrectqnum} wrong
                        </span>
                        <span>{exam?.question_count ?? cert.attempts} questions available</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.min(cert.accuracy, 100)}%` }} />
                      </div>
                    </div>

                    {exam?.domains?.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {exam.domains.map((domain) => (
                          <span key={domain.name} className="badge-chip">
                            {domain.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <p className="eyebrow">Question inventory</p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">Coverage by domain</h3>
              <div className="mt-6 space-y-4">
                {(enrolledExams[0]?.exam?.domains ?? []).map((domain) => {
                  const maxCount = Math.max(
                    ...(enrolledExams[0]?.exam?.domains.map((item) => item.question_count) ?? [1])
                  )

                  return (
                    <div key={domain.name} className="panel-muted">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{domain.name}</p>
                        <p className="text-sm text-[hsl(var(--ink-soft))]">{domain.question_count} questions</p>
                      </div>
                      <div className="mt-3 bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(domain.question_count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  )
}
