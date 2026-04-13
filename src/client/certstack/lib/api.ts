import { getStoredSession } from "@/lib/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  token?: string
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = options.token ?? getStoredSession()?.accessToken

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const hasBody = options.body !== undefined
  if (hasBody) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
        ? payload.detail
        : response.statusText || "Request failed"

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}
