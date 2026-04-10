"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useChat } from "@/lib/chat-context"

interface ChatPanelProps {
  className?: string
}

export function ChatPanel({ className }: ChatPanelProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Icons.bot className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Tutor</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Icons.delete className="h-4 w-4" />
            <span className="sr-only">Clear chat</span>
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                <Icons.lightbulb className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="text-base font-medium text-foreground mb-1">
                Need help with this question?
              </h4>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Ask for hints, clarifications, or step-by-step guidance. I won&apos;t give you the answer directly!
              </p>
              
              {/* Quick prompts */}
              <div className="mt-6 space-y-2 w-full max-w-[280px]">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                {[
                  "Give me a hint",
                  "What concept is this testing?",
                  "Walk me through the approach",
                ].map((prompt) => (
                  <motion.button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Icons.bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
