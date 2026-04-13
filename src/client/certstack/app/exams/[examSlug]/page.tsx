"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flag,
  Hourglass,
  TimerReset,
} from "lucide-react"

import { AppShell } from "@/components/certstack/app-shell"
import { ApiError, apiFetch } from "@/lib/api"
import { clearStoredSession, getStoredSession } from "@/lib/auth"
import { answerKeys, choiceEntries, isQuestionCorrect } from "@/lib/study"
import { cn } from "@/lib/utils"
import type { ExamCatalogItem, StudyQuestion } from "@/lib/types"

type AnswerMap = Record<number, string[]>

export default function ExamSessionPage() {
  const params = useParams<{ examSlug: string }>()
  const router = useRouter()
  const [exam, setExam] = useState<ExamCatalogItem | null>(null)
  const [questions, setQuestions] = useState<StudyQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [flagged, setFlagged] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [score, setScore] = useState({ correct: 0, incorrect: 0, percent: 0 })

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      router.replace("/login")
      return
    }

    let active = true

    async function loadExam() {
      try {
        const catalog = await apiFetch<ExamCatalogItem[]>("/exams/catalog")
        if (!active) {
          return
        }

        const matchedExam = catalog.find((item) => item.slug === params.examSlug) ?? null
        if (!matchedExam) {
          setError("Exam not found.")
          setLoading(false)
          return
        }

        setExam(matchedExam)
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearStoredSession()
          router.replace("/login")
          return
        }

        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load the exam.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadExam()

    return () => {
      active = false
    }
  }, [params.examSlug, router])

  useEffect(() => {
    if (!started || submitted) {
      return
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(interval)
          return 0
        }

        return value - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [started, submitted])

  useEffect(() => {
    if (started && !submitted && remainingSeconds === 0 && questions.length) {
      void submitExam()
    }
  }, [questions.length, remainingSeconds, started, submitted])

  const currentQuestion = questions[currentIndex]
  const selectedAnswers = answers[currentIndex] ?? []
  const isMultiSelect = currentQuestion ? answerKeys(currentQuestion.answer).length > 1 : false
  const answeredCount = Object.keys(answers).length

  const domainSummary = useMemo(() => {
    const summary = new Map<string, { correct: number; total: number }>()

    questions.forEach((question, index) => {
      const domain = question.domain ?? "Unknown"
      const entry = summary.get(domain) ?? { correct: 0, total: 0 }
      entry.total += 1

      if (submitted && isQuestionCorrect(question, answers[index] ?? [])) {
        entry.correct += 1
      }

      summary.set(domain, entry)
    })

    return [...summary.entries()]
  }, [answers, questions, submitted])

  async function startExamSession() {
    if (!exam) {
      return
    }

    setStarting(true)
    setError("")

    try {
      const params = new URLSearchParams({
        exam_name: exam.exam_name,
        limit_per_domain: "17",
      })

      const response = await apiFetch<StudyQuestion[]>(`/exams?${params.toString()}`)
      setQuestions(response)
      setAnswers({})
      setFlagged([])
      setCurrentIndex(0)
      setSubmitted(false)
      setStarted(true)
      setScore({ correct: 0, incorrect: 0, percent: 0 })
      setRemainingSeconds(Math.max(45, Math.round(response.length * 1.3)) * 60)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start this exam.")
    } finally {
      setStarting(false)
    }
  }

  function toggleAnswer(choiceKey: string) {
    if (!currentQuestion || submitted) {
      return
    }

    setAnswers((current) => {
      const existing = current[currentIndex] ?? []

      if (!isMultiSelect) {
        return {
          ...current,
          [currentIndex]: [choiceKey],
        }
      }

      const nextAnswers = existing.includes(choiceKey)
        ? existing.filter((entry) => entry !== choiceKey)
        : [...existing, choiceKey]

      return {
        ...current,
        [currentIndex]: nextAnswers,
      }
    })
  }

  function toggleFlag() {
    setFlagged((current) =>
      current.includes(currentIndex)
        ? current.filter((entry) => entry !== currentIndex)
        : [...current, currentIndex]
    )
  }

  async function submitExam() {
    if (!exam || !questions.length || submitting || submitted) {
      return
    }

    setSubmitting(true)

    try {
      let correctCount = 0
      questions.forEach((question, index) => {
        if (isQuestionCorrect(question, answers[index] ?? [])) {
          correctCount += 1
        }
      })

      const incorrectCount = questions.length - correctCount
      const percent = Math.round((correctCount / questions.length) * 100)

      await apiFetch("/profile/progress", {
        method: "POST",
        body: {
          exam_name: exam.exam_name,
          correct: correctCount,
          incorrect: incorrectCount,
        },
      })

      setScore({
        correct: correctCount,
        incorrect: incorrectCount,
        percent,
      })
      setSubmitted(true)
      setCurrentIndex(0)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to submit exam.")
    } finally {
      setSubmitting(false)
    }
  }

  function formatRemainingTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
  }

  return (
    <AppShell
      title={exam?.display_name ?? "Exam session"}
      subtitle="Timed, reviewable, and wired to your dashboard progress totals."
      actions={
        <Link className="secondary-button" href="/exams">
          Back to exam center
        </Link>
      }
    >
      {loading ? <section className="panel">Loading exam session...</section> : null}
      {!loading && error ? <section className="panel text-[hsl(var(--danger))]">{error}</section> : null}

      {!loading && exam && !started ? (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="hero-card">
            <p className="eyebrow">Exam brief</p>
            <h3 className="mt-3 text-4xl font-bold tracking-[-0.06em]">{exam.display_name}</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--ink-soft))]">
              {exam.description || exam.focus || "This session samples a balanced set of questions from the backend question bank."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <div className="metric-label">Question pool</div>
                <div className="metric-number">{exam.question_count}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Domain groups</div>
                <div className="metric-number">{exam.domains.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Expected pace</div>
                <div className="metric-number">{Math.max(45, Math.round(exam.question_count * 1.3))}m</div>
              </div>
            </div>

            <div className="mt-8">
              <button type="button" className="action-button" onClick={startExamSession} disabled={starting}>
                {starting ? "Building exam..." : "Start full-length exam"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="panel space-y-4">
            <p className="eyebrow">Coverage</p>
            {exam.domains.map((domain) => (
              <div key={domain.name} className="panel-muted">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold">{domain.name}</span>
                  <span className="text-sm text-[hsl(var(--ink-soft))]">{domain.question_count} questions</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {started && exam && currentQuestion ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[0.74fr_0.26fr]">
            <div className="space-y-4">
              <div className="hero-card">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">{submitted ? "Review mode" : "Exam in progress"}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                      Question {currentIndex + 1} of {questions.length}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="badge-chip">
                      <Hourglass className="h-4 w-4" />
                      {submitted ? "Submitted" : formatRemainingTime(remainingSeconds)}
                    </span>
                    <span className="badge-chip">
                      <CheckCircle2 className="h-4 w-4" />
                      {answeredCount} answered
                    </span>
                  </div>
                </div>

                <div className="mt-6 bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {submitted ? (
                <section className="panel">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow">Result</p>
                      <h3 className="mt-2 text-4xl font-bold tracking-[-0.06em]">{score.percent}%</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="panel-muted">
                        <p className="eyebrow">Correct</p>
                        <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">{score.correct}</p>
                      </div>
                      <div className="panel-muted">
                        <p className="eyebrow">Incorrect</p>
                        <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">{score.incorrect}</p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="panel">
                <div className="space-y-4">
                  <div>
                    <p className="eyebrow">{currentQuestion.domain || "Question"}</p>
                    <h4 className="mt-3 text-3xl font-bold tracking-[-0.05em] leading-tight">
                      {currentQuestion.question}
                    </h4>
                    <p className="mt-3 text-sm text-[hsl(var(--ink-soft))]">
                      {isMultiSelect ? "Multiple answers required." : "Choose the best answer."}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {choiceEntries(currentQuestion.choices).map((choice) => {
                      const chosen = selectedAnswers.includes(choice.key)
                      const correct = answerKeys(currentQuestion.answer).includes(choice.key)
                      const incorrectChoice = submitted && chosen && !correct

                      return (
                        <button
                          key={choice.key}
                          type="button"
                          className={cn(
                            "option-chip",
                            chosen && !submitted && "option-chip-active",
                            submitted && correct && "option-chip-correct",
                            incorrectChoice && "option-chip-incorrect"
                          )}
                          onClick={() => toggleAnswer(choice.key)}
                          disabled={submitted}
                        >
                          <span className="mr-2 font-semibold">{choice.label}</span>
                          {choice.text}
                        </button>
                      )
                    })}
                  </div>

                  {submitted ? (
                    <div className="panel-muted">
                      <p className="eyebrow">Explanation</p>
                      <p className="mt-3 text-sm leading-7 text-[hsl(var(--ink-soft))]">
                        {currentQuestion.explanation || "No explanation stored for this question."}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex flex-wrap gap-3">
                  {!submitted ? (
                    <button type="button" className="secondary-button" onClick={toggleFlag}>
                      <Flag className="h-4 w-4" />
                      {flagged.includes(currentIndex) ? "Unflag" : "Flag"}
                    </button>
                  ) : null}

                  {submitted ? (
                    <button
                      type="button"
                      className="action-button"
                      onClick={startExamSession}
                      disabled={starting}
                    >
                      <TimerReset className="h-4 w-4" />
                      Retry exam
                    </button>
                  ) : currentIndex === questions.length - 1 ? (
                    <button type="button" className="action-button" onClick={submitExam} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit exam"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))}
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="panel">
                <p className="eyebrow">Navigator</p>
                <div className="mt-4 navigator-grid">
                  {questions.map((question, index) => {
                    const answered = Boolean(answers[index]?.length)
                    const flaggedQuestion = flagged.includes(index)

                    return (
                      <button
                        key={`${question.question}-${index}`}
                        type="button"
                        className={cn(
                          "navigator-pill",
                          index === currentIndex && "navigator-pill-active",
                          answered && "navigator-pill-complete",
                          flaggedQuestion && "navigator-pill-flagged"
                        )}
                        onClick={() => setCurrentIndex(index)}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="panel">
                <p className="eyebrow">Domain summary</p>
                <div className="mt-4 space-y-3">
                  {domainSummary.map(([domain, summary]) => (
                    <div key={domain} className="panel-muted">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{domain}</span>
                        <span className="text-sm text-[hsl(var(--ink-soft))]">
                          {submitted ? `${summary.correct}/${summary.total}` : `${summary.total} total`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </>
      ) : null}
    </AppShell>
  )
}
