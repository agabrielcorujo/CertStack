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

interface EndSessionResponse {
  session_id: number
  exam: string
  category: string | null
  started_at: string
  ended_at: string
  cards_reviewed: number
  correct_answers: number
  accuracy_percent: number
}

interface StudySessionHistoryResponse {
  sessions: Array<{
    session_id: number
    exam: string
    category: string | null
    deck_id: number | null
    cards_reviewed: number
    correct_answers: number
    accuracy_percent: number
    started_at: string
    ended_at: string | null
    is_active: boolean
    duration_seconds: number
  }>
}

export interface FlashcardProgress {
  tracked_cards: number
  due_cards: number
  total_reviews: number
  correct_reviews: number
  incorrect_reviews: number
  overall_accuracy_percent: number
  average_ease_factor: number
  average_interval_days: number
}

export interface SessionStats {
  session_count: number
  cards_reviewed: number
  correct_answers: number
  session_accuracy_percent: number
  last_session_at: string | null
}

export interface CategoryBreakdown {
  category: string
  tracked_cards: number
  due_cards: number
  accuracy_percent: number
}

export interface EndSessionSummary {
  sessionId: number
  exam: string
  category: string | null
  startedAt: string
  endedAt: string
  cardsReviewed: number
  correctAnswers: number
  accuracyPercent: number
}

export interface StudySessionItem {
  sessionId: number
  exam: string
  category: string | null
  cardsReviewed: number
  correctAnswers: number
  accuracyPercent: number
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  isActive: boolean
}

interface ProgressResponse {
  summary: FlashcardProgress
  sessions: SessionStats
  category_breakdown: CategoryBreakdown[]
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
    const text = rawText.replace(/^[A-Z]\.\s*/, "").trim() || rawText.replace(/^[A-Z]\s*/, "").trim()

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

export async function getFlashcardProgress(params: {
  exam: string
  category?: string
}): Promise<{ progress: FlashcardProgress; sessions: SessionStats; categoryBreakdown: CategoryBreakdown[] } | null> {
  try {
    const query = new URLSearchParams()
    query.set("exam", params.exam)
    if (params.category) query.set("category", params.category)

    const response = await apiRequest<ProgressResponse>(`/flashcards/progress?${query.toString()}`)
    return {
      progress: response.summary,
      sessions: response.sessions,
      categoryBreakdown: response.category_breakdown || [],
    }
  } catch (error) {
    console.error("Failed to fetch flashcard progress:", error)
    return null
  }
}

export async function endStudySession(params: {
  sessionId: number
  cardsReviewed: number
  correctAnswers: number
}): Promise<EndSessionSummary> {
  const response = await apiRequest<EndSessionResponse>("/flashcards/sessions/end", {
    method: "POST",
    body: JSON.stringify({
      session_id: params.sessionId,
      cards_reviewed: params.cardsReviewed,
      correct_answers: params.correctAnswers,
    }),
  })

  return {
    sessionId: response.session_id,
    exam: response.exam,
    category: response.category,
    startedAt: response.started_at,
    endedAt: response.ended_at,
    cardsReviewed: response.cards_reviewed,
    correctAnswers: response.correct_answers,
    accuracyPercent: response.accuracy_percent,
  }
}

export async function getStudySessionHistory(params: {
  exam?: string
  category?: string
  limit?: number
  offset?: number
  includeActive?: boolean
}): Promise<StudySessionItem[]> {
  const query = new URLSearchParams()
  if (params.exam) query.set("exam", params.exam)
  if (params.category) query.set("category", params.category)
  if (params.includeActive !== undefined) query.set("include_active", String(params.includeActive))
  query.set("limit", String(params.limit ?? 5))
  query.set("offset", String(params.offset ?? 0))

  const response = await apiRequest<StudySessionHistoryResponse>(`/flashcards/sessions/history?${query.toString()}`)

  return (response.sessions || []).map((session) => ({
    sessionId: session.session_id,
    exam: session.exam,
    category: session.category,
    cardsReviewed: session.cards_reviewed,
    correctAnswers: session.correct_answers,
    accuracyPercent: session.accuracy_percent,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    durationSeconds: session.duration_seconds,
    isActive: session.is_active,
  }))
}
