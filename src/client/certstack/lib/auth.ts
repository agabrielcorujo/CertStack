import type { StoredSession } from "@/lib/types"

const STORAGE_KEY = "certstack.session"

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveStoredSession(session: StoredSession) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

export function buildDisplayName(session: Pick<StoredSession, "firstName" | "lastName">) {
  return `${session.firstName} ${session.lastName}`.trim() || "Learner"
}

export function buildInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
