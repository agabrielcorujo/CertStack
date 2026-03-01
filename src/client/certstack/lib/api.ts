const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FetchOptions = {
  token?: string;
  method?: "GET" | "POST";
  body?: unknown;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, method = "GET", body } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export type StartPracticePayload = {
  exam_name: string;
  categories: string[];
  num_questions: number;
};

export function startPracticeSession(token: string, payload: StartPracticePayload) {
  return apiFetch<{ session_id: number; questions: unknown[] }>("/practice/start", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getPracticeSession(token: string, sessionId: number) {
  return apiFetch(`/practice/session/${sessionId}`, {
    method: "GET",
    token,
  });
}

export type SubmitAnswerPayload = {
  session_id: number;
  question_hash: string;
  selected_answer: string | string[];
  time_spent_seconds?: number;
  flagged?: boolean;
};

export function submitPracticeAnswer(token: string, payload: SubmitAnswerPayload) {
  return apiFetch("/practice/submit", {
    method: "POST",
    token,
    body: {
      ...payload,
      flagged: payload.flagged ?? false,
    },
  });
}

export function completePracticeSession(token: string, sessionId: number) {
  return apiFetch(`/practice/complete/${sessionId}`, {
    method: "POST",
    token,
  });
}

export function getPracticeResults(token: string, sessionId: number) {
  return apiFetch(`/practice/results/${sessionId}`, {
    method: "GET",
    token,
  });
}
