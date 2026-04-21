import { getStoredSession } from "@/lib/auth"

const LOCAL_API_BASE_URL = "http://localhost:8000"

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
}

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (typeof window === "undefined") {
    return stripTrailingSlash(configuredBaseUrl || LOCAL_API_BASE_URL)
  }

  const fallbackBaseUrl = isLocalHostname(window.location.hostname)
    ? LOCAL_API_BASE_URL
    : window.location.origin
  const rawBaseUrl = configuredBaseUrl || fallbackBaseUrl

  try {
    const url = new URL(rawBaseUrl, window.location.origin)

    if (
      window.location.protocol === "https:" &&
      url.protocol === "http:" &&
      !isLocalHostname(url.hostname)
    ) {
      url.protocol = "https:"
    }

    return stripTrailingSlash(url.toString())
  } catch {
    return stripTrailingSlash(rawBaseUrl)
  }
}

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

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
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
