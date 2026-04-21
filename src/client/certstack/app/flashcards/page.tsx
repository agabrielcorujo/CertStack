"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react"

import { AppShell } from "@/components/certstack/app-shell"
import { ApiError, apiFetch } from "@/lib/api"
import { clearStoredSession, getStoredSession } from "@/lib/auth"
import { answerKeys, choiceEntries, isQuestionCorrect } from "@/lib/study"
import type { ExamCatalogItem, StudyQuestion } from "@/lib/types"
import { cn } from "@/lib/utils"

type AiMessage = {
  role: "user" | "assistant"
  content: string
}

export default function FlashcardsPage() {
  const router = useRouter()
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([])
  const [selectedExam, setSelectedExam] = useState<ExamCatalogItem | null>(null)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [deckVersion, setDeckVersion] = useState(0)
  const [cards, setCards] = useState<StudyQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [cardCorrect, setCardCorrect] = useState<boolean | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingCards, setLoadingCards] = useState(false)
  const [recording, setRecording] = useState(false)
  const [askingAi, setAskingAi] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const session = getStoredSession()
    if (!session) {
      router.replace("/login")
      return
    }

    let active = true

    async function loadCatalog() {
      try {
        const exams = await apiFetch<ExamCatalogItem[]>("/exams/catalog")
        if (!active) {
          return
        }

        setCatalog(exams)
        setSelectedExam(exams[0] ?? null)
        setSelectedDomain(exams[0]?.domains[0]?.name ?? "")
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearStoredSession()
          router.replace("/login")
          return
        }

        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load flashcards.")
        }
      } finally {
        if (active) {
          setLoadingCatalog(false)
        }
      }
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [router])

  useEffect(() => {
    if (!selectedExam) {
      return
    }

    if (!selectedExam.domains.some((domain) => domain.name === selectedDomain)) {
      setSelectedDomain(selectedExam.domains[0]?.name ?? "")
    }
  }, [selectedDomain, selectedExam])

  useEffect(() => {
    if (!selectedExam || !selectedDomain) {
      return
    }

    let active = true

    async function loadCards() {
      setLoadingCards(true)
      setError("")

      try {
        const params = new URLSearchParams({
          exam_name: selectedExam.exam_name,
          domain: selectedDomain,
          limit: "12",
        })

        const response = await apiFetch<StudyQuestion[]>(`/flashcards/?${params.toString()}`)
        if (!active) {
          return
        }

        setCards(response)
        setCurrentIndex(0)
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearStoredSession()
          router.replace("/login")
          return
        }

        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load this deck.")
        }
      } finally {
        if (active) {
          setLoadingCards(false)
        }
      }
    }

    loadCards()

    return () => {
      active = false
    }
  }, [deckVersion, selectedDomain, selectedExam, router])

  const currentCard = cards[currentIndex]
  const correctAnswers = currentCard ? answerKeys(currentCard.answer) : []
  const answerLabels = correctAnswers.join(", ")
  const selectedAnswerLabels = selectedAnswers.join(", ")
  const isMultiSelect = correctAnswers.length > 1

  useEffect(() => {
    setSelectedAnswers([])
    setChecked(false)
    setCardCorrect(null)
    setAiOpen(false)
    setAiPrompt("")
    setAiMessages([])
    setError("")
  }, [currentCard?.question])

  const progress = useMemo(() => {
    if (!cards.length) {
      return 0
    }

    return ((currentIndex + 1) / cards.length) * 100
  }, [cards.length, currentIndex])

  async function validateAnswers(nextAnswers: string[]) {
    if (!selectedExam || !currentCard || checked || !nextAnswers.length) {
      return
    }

    const correct = isQuestionCorrect(currentCard, nextAnswers)
    setChecked(true)
    setCardCorrect(correct)
    setRecording(true)
    setError("")

    try {
      await apiFetch("/profile/progress", {
        method: "POST",
        body: {
          exam_name: selectedExam.exam_name,
          correct: correct ? 1 : 0,
          incorrect: correct ? 0 : 1,
        },
      })
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearStoredSession()
        router.replace("/login")
        return
      }

      setError(caughtError instanceof Error ? caughtError.message : "Unable to save your result.")
    } finally {
      setRecording(false)
    }
  }

  function toggleAnswer(choiceKey: string) {
    if (!currentCard || checked || recording) {
      return
    }

    if (!isMultiSelect) {
      const nextAnswers = [choiceKey]
      setSelectedAnswers(nextAnswers)
      void validateAnswers(nextAnswers)
      return
    }

    setSelectedAnswers((current) =>
      current.includes(choiceKey)
        ? current.filter((entry) => entry !== choiceKey)
        : [...current, choiceKey]
    )
  }

  function advanceCard() {
    setCurrentIndex((index) => {
      if (index >= cards.length - 1) {
        return 0
      }

      return index + 1
    })
  }

  function advanceFromAiPanel() {
    setAiOpen(false)
    advanceCard()
  }

  async function askAiAboutCard() {
    if (!currentCard || !selectedExam) {
      return
    }

    const prompt = aiPrompt.trim()
    if (!prompt) {
      return
    }

    setAskingAi(true)
    setAiPrompt("")
    setError("")

    try {
      const response = await apiFetch<string>("/flashcards/ai/", {
        method: "POST",
        body: {
          question: currentCard.question,
          exam: selectedExam.exam_name,
          user_question: prompt,
          choices: currentCard.choices,
          answer: currentCard.answer,
          explanation: currentCard.explanation ?? null,
        },
      })

      setAiMessages((current) => [
        ...current,
        { role: "user", content: prompt },
        { role: "assistant", content: response },
      ])
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearStoredSession()
        router.replace("/login")
        return
      }

      setAiPrompt(prompt)
      setError(caughtError instanceof Error ? caughtError.message : "Unable to ask AI about this card.")
    } finally {
      setAskingAi(false)
    }
  }

  return (
    <AppShell
      title="Flashcards"
      subtitle="Answer-first flashcards with automatic grading, stored progress, and on-card AI follow-up."
      actions={
        <>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setCurrentIndex(0)
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset deck
          </button>
          <button
            type="button"
            className="action-button"
            onClick={() => {
              setDeckVersion((value) => value + 1)
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            New random set
          </button>
        </>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel space-y-5">
          <div>
            <p className="eyebrow">Deck controls</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.05em]">Pick your study lane.</h3>
          </div>

          {loadingCatalog ? (
            <p className="text-sm text-[hsl(var(--ink-soft))]">Loading available exams...</p>
          ) : (
            <>
              <div>
                <label className="field-label" htmlFor="exam-select">
                  Exam
                </label>
                <select
                  id="exam-select"
                  className="text-field"
                  value={selectedExam?.slug ?? ""}
                  onChange={(event) => {
                    const nextExam = catalog.find((exam) => exam.slug === event.target.value) ?? null
                    setSelectedExam(nextExam)
                    setSelectedDomain(nextExam?.domains[0]?.name ?? "")
                  }}
                >
                  {catalog.map((exam) => (
                    <option key={exam.slug} value={exam.slug}>
                      {exam.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="domain-select">
                  Domain
                </label>
                <select
                  id="domain-select"
                  className="text-field"
                  value={selectedDomain}
                  onChange={(event) => setSelectedDomain(event.target.value)}
                >
                  {selectedExam?.domains.map((domain) => (
                    <option key={domain.name} value={domain.name}>
                      {domain.name} ({domain.question_count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-muted">
                <p className="eyebrow">Deck cue</p>
                <h4 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                  {selectedExam?.display_name ?? "No exam selected"}
                </h4>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--ink-soft))]">
                  {selectedExam?.focus ||
                    selectedExam?.description ||
                    "Pick a domain and answer the card directly. Your result is graded and stored automatically."}
                </p>
              </div>
            </>
          )}

          {error ? (
            <div className="rounded-[1.2rem] border border-[rgba(217,79,79,0.22)] bg-[rgba(217,79,79,0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="hero-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Deck progress</p>
                <h3 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                  {selectedDomain || "Choose a domain"}
                </h3>
              </div>
              <div className="badge-chip">
                <Layers3 className="h-4 w-4" />
                {cards.length ? `${currentIndex + 1} / ${cards.length}` : "0 cards"}
              </div>
            </div>

            <div className="mt-6 bar-track">
              <div className="bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="study-card-wrap">
            {loadingCards ? (
              <div className="study-face">
                <p className="eyebrow">Loading</p>
                <h4 className="mt-4 text-3xl font-bold tracking-[-0.05em]">Pulling a fresh question stack.</h4>
              </div>
            ) : currentCard ? (
              <section className="study-face space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="eyebrow">{currentCard.domain || selectedDomain || "Flashcard"}</p>
                    {checked ? (
                      <div className="badge-chip">
                        {cardCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {cardCorrect ? "Correct" : "Incorrect"}
                      </div>
                    ) : null}
                  </div>

                  <h4 className="text-3xl font-bold tracking-[-0.06em] leading-tight">
                    {currentCard.question}
                  </h4>

                  <p className="text-sm leading-7 text-[hsl(var(--ink-soft))]">
                    {checked
                      ? "Your answer has been graded and saved to your dashboard stats."
                      : isMultiSelect
                        ? "Select every correct answer, then check your selection."
                        : "Click an answer to validate it instantly."}
                  </p>
                </div>

                <div className="grid gap-3">
                  {choiceEntries(currentCard.choices).map((choice) => {
                    const chosen = selectedAnswers.includes(choice.key)
                    const correct = checked && correctAnswers.includes(choice.key)
                    const incorrectChoice = checked && chosen && !correctAnswers.includes(choice.key)

                    return (
                      <button
                        key={choice.key}
                        type="button"
                        className={cn(
                          "option-chip w-full justify-start text-left",
                          chosen && !checked && "option-chip-active",
                          correct && "option-chip-correct",
                          incorrectChoice && "option-chip-incorrect"
                        )}
                        onClick={() => toggleAnswer(choice.key)}
                        disabled={checked || recording}
                      >
                        <span className="mr-2 font-semibold">{choice.label}</span>
                        {choice.text}
                      </button>
                    )
                  })}
                </div>

                {!checked ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setSelectedAnswers([])}
                      disabled={!selectedAnswers.length || recording}
                    >
                      Clear selection
                    </button>

                    {isMultiSelect ? (
                      <button
                        type="button"
                        className="action-button"
                        onClick={() => void validateAnswers(selectedAnswers)}
                        disabled={!selectedAnswers.length || recording}
                      >
                        {recording ? "Checking..." : "Check answer"}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "rounded-[1.3rem] border px-4 py-4",
                        cardCorrect
                          ? "border-[rgba(22,101,52,0.2)] bg-[rgba(22,101,52,0.08)]"
                          : "border-[rgba(217,79,79,0.22)] bg-[rgba(217,79,79,0.08)]"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {cardCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {cardCorrect ? "You picked the right answer." : "That choice was incorrect."}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[hsl(var(--ink-soft))]">
                        You chose{" "}
                        <span className="font-semibold text-[hsl(var(--ink))]">
                          {selectedAnswerLabels || "no answer"}
                        </span>
                        . Correct answer:{" "}
                        <span className="font-semibold text-[hsl(var(--ink))]">{answerLabels}</span>.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setAiOpen((current) => !current)}
                      >
                        <Sparkles className="h-4 w-4" />
                        {aiOpen ? "Hide AI help" : "Ask AI about this card"}
                      </button>

                      <button
                        type="button"
                        className="action-button"
                        onClick={advanceCard}
                        disabled={recording}
                      >
                        {currentIndex >= cards.length - 1 ? "Start deck over" : "Next card"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <div className="study-face">
                <p className="eyebrow">Empty</p>
                <h4 className="mt-4 text-3xl font-bold tracking-[-0.05em]">
                  This domain does not have a deck yet.
                </h4>
              </div>
            )}
          </div>

          {checked && currentCard ? (
            <section className="panel space-y-5">
              <div className="panel-muted">
                <p className="eyebrow">Explanation</p>
                <p className="mt-3 text-sm leading-7 text-[hsl(var(--ink-soft))]">
                  {currentCard.explanation || "No explanation is stored for this question yet."}
                </p>
              </div>

              {aiOpen ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">Ask AI</p>
                      <h4 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                        Drill into why this answer works.
                      </h4>
                    </div>
                    <div className="badge-chip">
                      <Sparkles className="h-4 w-4" />
                      Card tutor
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {aiMessages.length ? (
                      aiMessages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={cn(
                            "rounded-[1.25rem] px-4 py-3 text-sm leading-7",
                            message.role === "user"
                              ? "bg-[rgba(22,101,52,0.08)] text-[hsl(var(--ink))]"
                              : "bg-[rgba(15,23,42,0.06)] text-[hsl(var(--ink-soft))]"
                          )}
                        >
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--ink-faint))]">
                            {message.role === "user" ? "You" : "AI"}
                          </p>
                          <p>{message.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-7 text-[hsl(var(--ink-soft))]">
                        Ask why the right answer is correct, why the other options are wrong, or for a simpler analogy.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      className="text-field min-h-[120px] resize-none"
                      value={aiPrompt}
                      onChange={(event) => setAiPrompt(event.target.value)}
                      placeholder="Why is this the best answer for Cloud Practitioner?"
                      disabled={askingAi}
                    />

                    <div className="flex flex-wrap justify-between gap-3">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={advanceFromAiPanel}
                        disabled={askingAi || recording}
                      >
                        {currentIndex >= cards.length - 1 ? "Start deck over" : "Next card"}
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        className="action-button"
                        onClick={() => void askAiAboutCard()}
                        disabled={!aiPrompt.trim() || askingAi}
                      >
                        <Sparkles className="h-4 w-4" />
                        {askingAi ? "Asking..." : "Ask AI"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </AppShell>
  )
}
