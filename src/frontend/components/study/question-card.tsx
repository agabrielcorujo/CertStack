"use client"

import { useState } from "react"
import type { Question, AnswerResponse } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Flag, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { ConfidenceRating } from "./confidence-rating"
import { AIHelpPanel } from "./ai-help-panel"

interface QuestionCardProps {
  question: Question
  onAnswer: (choiceId: string, confidence: number) => Promise<AnswerResponse>
  onNext: () => void
  onFlag: (flagged: boolean) => void
  isLast: boolean
}

export function QuestionCard({ question, onAnswer, onNext, onFlag, isLast }: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<AnswerResponse | null>(null)
  const [isFlagged, setIsFlagged] = useState(question.flagged || false)
  const [showAIHelp, setShowAIHelp] = useState(false)

  const handleSubmit = async () => {
    if (!selectedChoice) return

    setIsSubmitting(true)
    try {
      const response = await onAnswer(selectedChoice, confidence)
      setResult(response)
      setShowAIHelp(false) // Close AI panel when answer is submitted
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    setSelectedChoice(null)
    setConfidence(3)
    setResult(null)
    setShowAIHelp(false)
    onNext()
  }

  const handleFlag = () => {
    const newFlagged = !isFlagged
    setIsFlagged(newFlagged)
    onFlag(newFlagged)
  }

  const isAnswered = result !== null

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {/* Section Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {question.section}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 bg-transparent", isFlagged && "text-warning")}
              onClick={handleFlag}
            >
              <Flag className={cn("h-4 w-4", isFlagged && "fill-warning")} />
              {isFlagged ? "Flagged" : "Flag"}
            </Button>
          </div>

          {/* Question */}
          <p className="text-lg font-medium mb-6 leading-relaxed">{question.prompt}</p>

          {/* Choices */}
          <div className="space-y-3">
            {question.choices.map((choice) => {
              const isSelected = selectedChoice === choice.id
              const isCorrect = result?.correct_choice_id === choice.id
              const isWrong = isAnswered && isSelected && !result?.correct

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => !isAnswered && setSelectedChoice(choice.id)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    "flex items-start gap-3",
                    !isAnswered && "hover:border-primary/50 hover:bg-secondary/50",
                    !isAnswered && isSelected && "border-primary bg-primary/10",
                    isAnswered && isCorrect && "border-success bg-success/10",
                    isAnswered && isWrong && "border-destructive bg-destructive/10",
                    isAnswered && !isCorrect && !isWrong && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                      !isAnswered && isSelected && "border-primary bg-primary text-primary-foreground",
                      !isAnswered && !isSelected && "border-muted-foreground/30",
                      isAnswered && isCorrect && "border-success bg-success text-success-foreground",
                      isAnswered && isWrong && "border-destructive bg-destructive text-destructive-foreground",
                    )}
                  >
                    {isAnswered && isCorrect ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isAnswered && isWrong ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      choice.id.toUpperCase()
                    )}
                  </span>
                  <span className="flex-1">{choice.text}</span>
                </button>
              )
            })}
          </div>

          {/* Explanation (after answer) */}
          {isAnswered && result && (
            <div
              className={cn(
                "mt-6 p-4 rounded-lg border",
                result.correct ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className={cn("font-medium", result.correct ? "text-success" : "text-destructive")}>
                  {result.correct ? "Correct!" : "Incorrect"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {!isAnswered ? (
            <div className="space-y-6">
              <ConfidenceRating value={confidence} onChange={setConfidence} />
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowAIHelp(!showAIHelp)}>
                  <Sparkles className="h-4 w-4" />
                  {showAIHelp ? "Hide AI Help" : "Get AI Help"}
                </Button>
                <Button onClick={handleSubmit} disabled={!selectedChoice || isSubmitting} className="min-w-32">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleNext} className="gap-2">
                {isLast ? "Complete Session" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAIHelp && !isAnswered && <AIHelpPanel question={question} onClose={() => setShowAIHelp(false)} />}
    </div>
  )
}
