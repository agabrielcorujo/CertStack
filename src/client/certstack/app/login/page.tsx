"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { startTransition, useEffect, useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, KeyRound, Mail, ShieldCheck } from "lucide-react"

import { ApiError, apiFetch } from "@/lib/api"
import { getStoredSession, saveStoredSession } from "@/lib/auth"
import type { LoginResponse } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twofa, setTwofa] = useState("")
  const [needsTwofa, setNeedsTwofa] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (getStoredSession()) {
      router.replace("/dashboard")
      return
    }

    const queryEmail = new URLSearchParams(window.location.search).get("email")
    if (queryEmail) {
      setEmail(queryEmail)
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
          twofa: twofa || undefined,
        },
      })

      if (response.status === "2fa_required") {
        setNeedsTwofa(true)
        setStatusMessage(response.message ?? "Verification code sent to your email.")
        return
      }

      if (!response.access_token || !response.role) {
        throw new ApiError("Missing access token in login response.", 500, response)
      }

      saveStoredSession({
        accessToken: response.access_token,
        role: response.role,
        firstName: response.first_name ?? "",
        lastName: response.last_name ?? "",
      })

      startTransition(() => {
        router.push("/dashboard")
      })
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError ? caughtError.message : "Unable to sign in right now."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-grid">
      <section className="auth-hero">
        <div className="space-y-8">
          <div className="brand-lockup">
            <div className="brand-icon">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">CertStack</p>
              <h1 className="brand-title">A sharper way to prep for certification day.</h1>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <p className="eyebrow">Cloud practitioner ready</p>
            <h2 className="text-5xl font-bold tracking-[-0.08em] text-[hsl(var(--ink))]">
              Flashcards that feel like Quizlet.
              <br />
              Full exams that feel like the real thing.
            </h2>
            <p className="max-w-lg text-lg leading-8 text-[hsl(var(--ink-soft))]">
              Study the AWS Certified Cloud Practitioner with live stats, topic decks, and a
              proper exam runner that records what you get right and wrong.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel">
            <p className="eyebrow">Memorize faster</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.05em]">Flip, grade, repeat</h3>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--ink-soft))]">
              Move through domain-specific decks and log every correct or missed answer as you go.
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow">Measure honestly</p>
            <h3 className="mt-3 text-2xl font-bold tracking-[-0.05em]">Long-form exam mode</h3>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--ink-soft))]">
              Timed sessions, flagged questions, review screens, and score tracking tied back to
              your dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="eyebrow">Sign in</p>
            <h1 className="text-4xl font-bold tracking-[-0.08em]">Return to your study desk.</h1>
            <p className="text-sm leading-6 text-[hsl(var(--ink-soft))]">
              Use the JWT auth backend in this repo. The access token is stored locally in the
              browser for the app shell to use.
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--ink-faint))]" />
              <input
                id="email"
                type="email"
                className="text-field pl-11"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--ink-faint))]" />
              <input
                id="password"
                type="password"
                className="text-field pl-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {needsTwofa && (
            <div className="panel-muted">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--ink))]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand))]" />
                Verification code
              </div>
              <label className="field-label" htmlFor="twofa">
                Email code
              </label>
              <input
                id="twofa"
                type="text"
                className="text-field"
                value={twofa}
                onChange={(event) => setTwofa(event.target.value)}
                placeholder="Enter the 6-digit code"
              />
              {statusMessage ? (
                <p className="mt-3 text-sm text-[hsl(var(--ink-soft))]">{statusMessage}</p>
              ) : null}
            </div>
          )}

          {error ? (
            <div className="rounded-[1.2rem] border border-[rgba(217,79,79,0.22)] bg-[rgba(217,79,79,0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
              {error}
            </div>
          ) : null}

          <button type="submit" className="action-button w-full" disabled={submitting}>
            {submitting ? "Signing in..." : needsTwofa ? "Verify and continue" : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-sm text-[hsl(var(--ink-soft))]">
            No account yet?{" "}
            <Link className="font-semibold text-[hsl(var(--brand-deep))]" href="/signup">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
