"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authApi, initializeApiClient } from "./api-client"
import { useRouter } from "next/navigation"

interface User {
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    }
    setUser(null)
    setAccessToken(null)
    router.push("/login")
  }, [router])

  // Initialize API client with token management
  useEffect(() => {
    initializeApiClient(
      () => accessToken,
      (token) => setAccessToken(token),
      logout,
    )
  }, [accessToken, logout])

  // Try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const newToken = await authApi.refresh()
        if (newToken) {
          setAccessToken(newToken)
          // Token refresh doesn't return user info, so we'll get it from localStorage if available
          const storedUser = localStorage.getItem("certstack_user")
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        }
      } catch {
        // No valid session
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    const userData = {
      email,
      first_name: response.first_name,
      last_name: response.last_name,
    }
    setUser(userData)
    setAccessToken(response.access_token)
    localStorage.setItem("certstack_user", JSON.stringify(userData))
    router.push("/dashboard")
  }

  const register = async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    await authApi.register(data)
    // After registration, automatically log in
    await login(data.email, data.password)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
