"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"

import { ApiError, apiFetch } from "@/lib/api"
import { getStoredSession } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    twofa: false,
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (getStoredSession()) {
      router.replace("/dashboard")
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          ...form,
          phone: "",
          city: "",
          street: "",
          state: "",
          zip_code: "",
        },
      })

      router.push(`/login?email=${encodeURIComponent(form.email)}`)
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError ? caughtError.message : "Unable to create your account."
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
              <p className="eyebrow">Get started</p>
              <h1 className="brand-title">Build your certification workspace.</h1>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <h2 className="text-5xl font-bold tracking-[-0.08em] text-[hsl(var(--ink))]">
              One login.
              <br />
              One dashboard.
              <br />
              One clear study signal.
            </h2>
            <p className="text-lg leading-8 text-[hsl(var(--ink-soft))]">
              Create your account, choose Cloud Practitioner, and start tracking every flashcard
              session and exam attempt in one place.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            "Create your account in under a minute.",
            "Enroll in AWS Certified Cloud Practitioner from the dashboard.",
            "Use flashcards and exam mode to push real stats into your profile.",
          ].map((item) => (
            <div key={item} className="panel flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-[hsl(var(--success))]" />
              <p className="text-sm leading-6 text-[hsl(var(--ink-soft))]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <p className="eyebrow">Create account</p>
            <h1 className="text-4xl font-bold tracking-[-0.08em]">Start your first cert path.</h1>
            <p className="text-sm leading-6 text-[hsl(var(--ink-soft))]">
              Set up your login details now and finish the rest of your study setup inside
              CertStack.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="first-name">
                First name
              </label>
              <input
                id="first-name"
                className="text-field"
                value={form.first_name}
                onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
                placeholder="Adrian"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="last-name">
                Last name
              </label>
              <input
                id="last-name"
                className="text-field"
                value={form.last_name}
                onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
                placeholder="Corujo"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              className="text-field"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className="text-field"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Choose a strong password"
              required
            />
          </div>

          <label className="panel-muted flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.twofa}
              onChange={(event) => setForm((current) => ({ ...current, twofa: event.target.checked }))}
              className="mt-1 h-4 w-4 rounded border"
            />
            <span className="text-sm leading-6 text-[hsl(var(--ink-soft))]">
              Enable email-based 2FA for login challenges.
            </span>
          </label>

          {error ? (
            <div className="rounded-[1.2rem] border border-[rgba(217,79,79,0.22)] bg-[rgba(217,79,79,0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
              {error}
            </div>
          ) : null}

          <button type="submit" className="action-button w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-sm text-[hsl(var(--ink-soft))]">
            Already registered?{" "}
            <Link className="font-semibold text-[hsl(var(--brand-deep))]" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
