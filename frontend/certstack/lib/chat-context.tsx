"use client"

import * as React from "react"
import { getErrorMessage, postJson } from "@/lib/api"

// Types
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatContextType {
  messages: ChatMessage[]
  isLoading: boolean
  currentQuestionId: string | null
  setCurrentQuestionId: (id: string | null) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
}

interface ChatResponse {
  response: string
}

// Create context
const ChatContext = React.createContext<ChatContextType | undefined>(undefined)

// Fallback responses if backend chat is unavailable.
const AI_RESPONSES = [
  "Let me help guide you through this. First, consider what the question is really asking - what's the core concept being tested here?",
  "Great question! Before I give you the answer, let's think about this step by step. What do you already know about this topic?",
  "I can see why this might be confusing. Let me break it down: the key insight here is understanding the relationship between the variables.",
  "Think about it this way - if we apply the fundamental principle, what would be the logical next step?",
  "You're on the right track! Remember that in these problems, we need to consider all the constraints mentioned in the question.",
  "Let's approach this systematically. What information do we have, and what are we trying to find?",
  "Here's a hint: focus on the units and dimensions. They often tell you which formula to use.",
  "Consider the boundary conditions. What happens at the extremes? This can help narrow down the correct answer.",
]

// Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messagesByQuestion, setMessagesByQuestion] = React.useState<Record<string, ChatMessage[]>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentQuestionId, setCurrentQuestionId] = React.useState<string | null>(null)

  const messages = currentQuestionId ? messagesByQuestion[currentQuestionId] || [] : []

  const sendMessage = async (content: string) => {
    if (!currentQuestionId) return

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content,
      timestamp: new Date(),
    }

    // Add user message
    setMessagesByQuestion((prev) => ({
      ...prev,
      [currentQuestionId]: [...(prev[currentQuestionId] || []), userMessage],
    }))

    setIsLoading(true)

    let assistantContent = ""

    try {
      const result = await postJson<ChatResponse>("/chat", {
        question_id: currentQuestionId,
        message: content,
      })
      assistantContent = result.response
    } catch (error) {
      const fallback = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
      assistantContent = `${fallback}\n\n(Using fallback response: ${getErrorMessage(error)})`
    }

    const aiResponse: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "assistant",
      content: assistantContent,
      timestamp: new Date(),
    }

    setMessagesByQuestion((prev) => ({
      ...prev,
      [currentQuestionId]: [...(prev[currentQuestionId] || []), aiResponse],
    }))

    setIsLoading(false)
  }

  const clearMessages = () => {
    if (currentQuestionId) {
      setMessagesByQuestion((prev) => {
        const next = { ...prev }
        delete next[currentQuestionId]
        return next
      })
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        currentQuestionId,
        setCurrentQuestionId,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use chat context
export function useChat() {
  const context = React.useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
