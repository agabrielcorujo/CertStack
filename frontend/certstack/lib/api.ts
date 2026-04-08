const DEFAULT_API_BASE_URL = "http://localhost:8000"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type JsonValue = Record<string, unknown>

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const baseUrl = getApiBaseUrl()
  const url = new URL(`${baseUrl}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!raw) return DEFAULT_API_BASE_URL
  return raw.replace(/\/$/, "")
}

export async function postJson<TResponse>(
  path: string,
  payload: JsonValue,
  token?: string
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const contentType = response.headers.get("content-type")
  const isJson = contentType?.includes("application/json") ?? false
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  return body as TResponse
}

export async function getJson<TResponse>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  token?: string
): Promise<TResponse> {
  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  })

  const contentType = response.headers.get("content-type")
  const isJson = contentType?.includes("application/json") ?? false
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  return body as TResponse
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}
