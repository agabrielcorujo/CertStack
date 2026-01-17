// API Client with automatic token refresh
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type TokenGetter = () => string | null
type TokenSetter = (token: string | null) => void
type LogoutCallback = () => void

let getAccessToken: TokenGetter = () => null
let setAccessToken: TokenSetter = () => {}
let onLogout: LogoutCallback = () => {}

export function initializeApiClient(
  tokenGetter: TokenGetter,
  tokenSetter: TokenSetter,
  logoutCallback: LogoutCallback,
) {
  getAccessToken = tokenGetter
  setAccessToken = tokenSetter
  onLogout = logoutCallback
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Include HttpOnly cookies
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch {
    return null
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (response.status === 401 && retry) {
    // Try to refresh the token
    const newToken = await refreshAccessToken()

    if (newToken) {
      setAccessToken(newToken)
      // Retry the original request with new token
      return apiRequest<T>(endpoint, options, false)
    } else {
      // Refresh failed, logout user
      onLogout()
      throw new Error("Session expired. Please login again.")
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }))
    throw new Error(error.detail || `Error: ${response.status}`)
  }

  return response.json()
}

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Invalid credentials" }))
      throw new Error(error.detail || "Login failed")
    }

    return response.json()
  },

  register: async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Registration failed" }))
      throw new Error(error.detail || "Registration failed")
    }

    return response.json()
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  },

  refresh: refreshAccessToken,
}

// Questions API
export const questionsApi = {
  getQuestions: (mode: "practice" | "review" = "practice") => apiRequest<Question[]>(`/questions?mode=${mode}`),

  getQuestion: (id: string) => apiRequest<Question>(`/questions/${id}`),

  submitAnswer: (id: string, data: AnswerSubmission) =>
    apiRequest<AnswerResponse>(`/questions/${id}/answer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  flagQuestion: (id: string, flagged: boolean) =>
    apiRequest(`/questions/${id}/flag`, {
      method: "POST",
      body: JSON.stringify({ flagged }),
    }),

  getStats: (id: string) => apiRequest<QuestionStats>(`/questions/${id}/stats`),
}

// Review API
export const reviewApi = {
  getReviewQuestions: () => apiRequest<Question[]>("/review"),
}

// Progress API
export const progressApi = {
  getProgress: () => apiRequest<Progress>("/progress"),
}

// AI API
export const aiApi = {
  chat: (questionId: string, message: string, threadId?: string) =>
    apiRequest<AIResponse>(threadId ? `/ai/chat/${threadId}` : "/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, message }),
    }),

  getHint: (questionId: string) =>
    apiRequest<HintResponse>("/ai/hint", {
      method: "POST",
      body: JSON.stringify({ question_id: questionId }),
    }),
}

// Types
export interface Question {
  id: string
  prompt: string
  choices: Choice[]
  section: string
  explanation?: string
  flagged?: boolean
  last_correct?: boolean
  confidence?: number
}

export interface Choice {
  id: string
  text: string
}

export interface AnswerSubmission {
  choice_id: string
  confidence: number
  time_spent_seconds: number
}

export interface AnswerResponse {
  correct: boolean
  correct_choice_id: string
  explanation: string
}

export interface QuestionStats {
  attempts: number
  correct_count: number
  average_time: number
  last_confidence: number
}

export interface Progress {
  exam_name: string
  total_questions: number
  completed_questions: number
  accuracy: number
  weak_sections: WeakSection[]
  study_streak: number
}

export interface WeakSection {
  name: string
  accuracy: number
  questions_count: number
}

export interface AIResponse {
  message: string
  thread_id: string
}

export interface HintResponse {
  hint: string
}
