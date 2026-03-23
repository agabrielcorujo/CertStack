"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Eye, EyeOff, Mail, Lock, User, GraduationCap } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    password: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  const hasNumber = /\d/.test(formData.password)
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password)
  const passwordStrong = formData.password.length >= 8 && hasNumber && hasSpecial
  const canSubmit =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    emailValid &&
    passwordStrong &&
    termsAccepted &&
    !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!canSubmit) {
      setError("Please complete all required fields and accept the terms.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const normalizedEmail = formData.email.trim().toLowerCase()
      const normalizedFirstName = formData.firstName.trim()
      const normalizedLastName = formData.lastName.trim()
      const normalizedInstitution = formData.institution.trim()

      // First, register the user
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: formData.password,
        }),
      })

      if (!registerResponse.ok) {
        const data = await registerResponse.json().catch(() => null)
        throw new Error(data.message || "Registration failed")
      }

      // Then, create the user profile
      const profileResponse = await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          institution: normalizedInstitution,
        }),
      })

      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => null)
        throw new Error(data.message || "Profile creation failed")
      }

      // Redirect to dashboard on success
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#4A7FFF] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.2)]">
            <BookOpen className="h-6 w-6 text-[#FFFFFF]" />
          </div>
          <span className="text-xl font-bold text-[#FFFFFF]">CertStack</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-[#FFFFFF]">
            Start your journey
            <br />
            to success
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-[rgba(255,255,255,0.8)]">
            Join thousands of professionals who use CertStack to prepare for certifications and achieve their career goals.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.2)]">
                <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-[rgba(255,255,255,0.9)]">Access to 50,000+ practice questions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.2)]">
                <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-[rgba(255,255,255,0.9)]">Detailed performance analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.2)]">
                <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-[rgba(255,255,255,0.9)]">Personalized study plans</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-[rgba(255,255,255,0.5)]">Trusted by 15,000+ professionals worldwide</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center bg-[#FFFFFF] px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A7FFF]">
              <BookOpen className="h-5 w-5 text-[#FFFFFF]" />
            </div>
            <span className="text-lg font-bold text-[hsl(var(--text-primary))]">CertStack</span>
          </div>

          <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Create your account</h2>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Get started with your free account today
          </p>

          {error && (
            <div role="alert" aria-live="polite" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} aria-busy={loading}>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-first-name" className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                  <input
                    id="signup-first-name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] pl-11 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-last-name" className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                  Last name
                </label>
                <input
                  id="signup-last-name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] px-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] pl-11 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label htmlFor="signup-institution" className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                Company/Institution (optional)
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                <input
                  id="signup-institution"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your company or organization"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] pl-11 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={8}
                  className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] pl-11 pr-12 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                Must be at least 8 characters with a number and special character
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-[hsl(var(--border))] text-[#4A7FFF] focus:ring-[#DBEAFE]"
              />
              <label htmlFor="terms" className="text-sm text-[hsl(var(--text-secondary))]">
                {"I agree to the "}
                <button type="button" className="font-medium text-[#4A7FFF] hover:text-[#3D6EE8]">
                  Terms of Service
                </button>
                {" and "}
                <button type="button" className="font-medium text-[#4A7FFF] hover:text-[#3D6EE8]">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 w-full rounded-full bg-[#4A7FFF] text-sm font-medium text-[#FFFFFF] transition-all duration-200 hover:bg-[#3D6EE8] hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[hsl(var(--border-light))]" />
              <span className="text-xs text-[hsl(var(--text-tertiary))]">or sign up with</span>
              <div className="h-px flex-1 bg-[hsl(var(--border-light))]" />
            </div>

            {/* Social Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] text-sm font-medium text-[hsl(var(--text-primary))] transition-all duration-200 hover:bg-[hsl(var(--surface))]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] text-sm font-medium text-[hsl(var(--text-primary))] transition-all duration-200 hover:bg-[hsl(var(--surface))]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.22.05.45.05.68zm3.678 16.72c.01.12.01.23 0 .33-.4 1.47-1.49 3.4-2.68 4.47-.99.89-1.97 1.77-3.27 1.77-.53 0-.95-.15-1.35-.31-.43-.17-.87-.35-1.56-.35-.72 0-1.19.19-1.64.36-.38.15-.75.29-1.22.33-1.23.05-2.17-.96-3.16-1.86C3.03 21.16 1.54 17.73 1.54 14.39c0-3.6 2.34-5.51 4.63-5.51.72 0 1.32.21 1.84.4.4.14.76.27 1.06.27.25 0 .57-.12.95-.27.57-.21 1.28-.48 2.16-.48 1.58 0 3.14.96 3.86 2.47-1.37.79-2.3 2.27-2.3 3.94 0 1.95 1.17 3.6 2.83 4.3-.2.59-.44 1.15-.73 1.62z" />
                </svg>
                Apple
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[hsl(var(--text-secondary))]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#4A7FFF] hover:text-[#3D6EE8]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
