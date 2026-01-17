"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { aiApi, type Question } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Sparkles, Send, Loader2, Lightbulb, X, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AIHelpPanelProps {
  question: Question
  onClose: () => void
}

export function AIHelpPanel({ question, onClose }: AIHelpPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiApi.chat(question.id, userMessage.content, threadId || undefined)

      setThreadId(response.thread_id)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.message,
        },
      ])
    } catch {
      // Mock response for development
      const mockResponses = [
        "Think about which AWS service is specifically designed for container orchestration. Consider the difference between ECS (which is AWS-proprietary) and a service that runs the open-source Kubernetes.",
        "Good question! When comparing these options, focus on the key requirement: managed Kubernetes. Which service name includes 'Kubernetes' or 'K8s' in its description?",
        "Let me guide you without giving away the answer. AWS offers several container services, but only one provides native Kubernetes management. What do you know about each option?",
      ]

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetHint = async () => {
    setIsLoading(true)

    try {
      const response = await aiApi.getHint(question.id)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response.hint,
        },
      ])
    } catch {
      // Mock hint
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Hint: The correct answer contains a letter that represents a popular container orchestration platform. Think about which platform starts with 'K' and is widely used for managing containerized applications.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          AI Study Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-transparent" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-64 px-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="py-8 text-center">
              <Bot className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about this question. I{"'"}ll help guide you without giving away the answer.
              </p>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleGetHint}>
                <Lightbulb className="h-4 w-4" />
                Get a Hint
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                      message.role === "assistant" ? "bg-primary/10" : "bg-secondary",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-sm",
                      message.role === "assistant" ? "bg-secondary/50" : "bg-primary/10",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 rounded-lg px-3 py-2 bg-secondary/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="bg-secondary"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 gap-2 text-muted-foreground bg-transparent"
              onClick={handleGetHint}
              disabled={isLoading}
            >
              <Lightbulb className="h-4 w-4" />
              Get Another Hint
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
