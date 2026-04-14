export interface PracticeOption {
  id: string
  text: string
}

export interface PracticeFlashcard {
  questionId: string
  question: string
  options: PracticeOption[]
  correctAnswer: string
  explanation: string
  difficulty?: number
  category?: string
}

interface FlashcardReviewCard {
  question_id: string
  question: string
  choices: unknown
  answer: unknown
  difficulty?: number
  category?: string
}

interface FlashcardsReviewResponse {
  cards: FlashcardReviewCard[]
}

interface ActiveSessionResponse {
  active_session: {
    session_id: number
  } | null
}

interface StartSessionResponse {
  session_id: number
}

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000"

function getApiBaseUrl(): string {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return env?.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token") || localStorage.getItem("token")
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(init.headers)

  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeChoices(rawChoices: unknown): PracticeOption[] {
  if (!Array.isArray(rawChoices)) return []

  return rawChoices.map((choice, index) => {
    const rawText = String(choice || "")
    const letterPrefixMatch = rawText.match(/^([A-Z])\./)
    const derivedId = letterPrefixMatch?.[1]?.toLowerCase() || String.fromCharCode(97 + index)
    const text = rawText.replace(/^[A-Z]\.?\s*/, "").trim()

    return {
      id: derivedId,
      text: text || rawText,
    }
  })
}

function normalizeCorrectAnswer(rawAnswer: unknown): string {
  if (Array.isArray(rawAnswer) && rawAnswer.length > 0) {
    return String(rawAnswer[0]).toLowerCase()
  }

  if (typeof rawAnswer === "string") {
    return rawAnswer.trim().toLowerCase()
  }

  return ""
}

export function mapFlashcardToPractice(card: FlashcardReviewCard): PracticeFlashcard {
  const options = normalizeChoices(card.choices)
  const correctAnswer = normalizeCorrectAnswer(card.answer)

  return {
    questionId: card.question_id,
    question: card.question,
    options,
    correctAnswer,
    explanation: "Review complete explanation in study materials.",
    difficulty: card.difficulty,
    category: card.category,
  }
}

export async function fetchPracticeFlashcards(params: {
  exam: string
  category?: string
  limit?: number
  deckId?: number
}): Promise<PracticeFlashcard[]> {
  const body = {
    exam: params.exam,
    category: params.category,
    deck_id: params.deckId,
    limit: params.limit ?? 20,
  }

  const response = await apiRequest<FlashcardsReviewResponse>("/flashcards/review", {
    method: "POST",
    body: JSON.stringify(body),
  })

  return (response.cards || []).map(mapFlashcardToPractice)
}

export async function getOrStartStudySession(params: {
  exam: string
  category?: string
  deckId?: number
}): Promise<number | null> {
  const query = new URLSearchParams()
  if (params.exam) query.set("exam", params.exam)
  if (params.category) query.set("category", params.category)
  if (params.deckId !== undefined) query.set("deck_id", String(params.deckId))

  const active = await apiRequest<ActiveSessionResponse>(`/flashcards/sessions/active?${query.toString()}`)
  if (active.active_session?.session_id) {
    return active.active_session.session_id
  }

  const started = await apiRequest<StartSessionResponse>("/flashcards/sessions/start", {
    method: "POST",
    body: JSON.stringify({
      exam: params.exam,
      category: params.category,
      deck_id: params.deckId,
    }),
  })

  return started.session_id || null
}

export async function recordFlashcardReview(params: {
  questionId: string
  wasCorrect: boolean
  confidence?: number
  sessionId?: number | null
}): Promise<void> {
  await apiRequest("/flashcards/record", {
    method: "POST",
    body: JSON.stringify({
      question_id: params.questionId,
      was_correct: params.wasCorrect,
      confidence: params.confidence,
      session_id: params.sessionId,
    }),
  })
}
