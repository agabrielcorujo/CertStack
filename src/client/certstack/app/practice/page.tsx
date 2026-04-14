"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { AppHeader } from "@/components/app-header"
import { QuestionCard } from "@/components/practice/question-card"
import { QuestionNavigator } from "@/components/practice/question-navigator"
import { Flag, ChevronLeft, ChevronRight } from "lucide-react"

const questions = [
  {
    id: 1,
    question:
      "Which of the following structures passes through the foramen ovale of the sphenoid bone?",
    options: [
      { id: "a", text: "Maxillary nerve (V2)" },
      { id: "b", text: "Mandibular nerve (V3)" },
      { id: "c", text: "Middle meningeal artery" },
      { id: "d", text: "Ophthalmic nerve (V1)" },
    ],
    correctAnswer: "b",
    explanation:
      "The mandibular nerve (V3) is the third branch of the trigeminal nerve that passes through the foramen ovale. The maxillary nerve passes through the foramen rotundum, the middle meningeal artery passes through the foramen spinosum, and the ophthalmic nerve passes through the superior orbital fissure.",
  },
  {
    id: 2,
    question:
      "A patient presents with inability to abduct the arm beyond 15 degrees. Which muscle is most likely affected?",
    options: [
      { id: "a", text: "Supraspinatus" },
      { id: "b", text: "Deltoid" },
      { id: "c", text: "Infraspinatus" },
      { id: "d", text: "Teres minor" },
    ],
    correctAnswer: "a",
    explanation:
      "The supraspinatus muscle initiates abduction of the arm (first 15 degrees). Damage to this muscle or the suprascapular nerve would impair the initial phase of arm abduction. The deltoid takes over abduction from 15-90 degrees.",
  },
  {
    id: 3,
    question: "Which enzyme is the rate-limiting step in cholesterol synthesis?",
    options: [
      { id: "a", text: "Acetyl-CoA carboxylase" },
      { id: "b", text: "HMG-CoA reductase" },
      { id: "c", text: "HMG-CoA synthase" },
      { id: "d", text: "Squalene synthase" },
    ],
    correctAnswer: "b",
    explanation:
      "HMG-CoA reductase is the rate-limiting enzyme in the mevalonate pathway for cholesterol synthesis. It converts HMG-CoA to mevalonate. Statins work by inhibiting this enzyme, reducing cholesterol synthesis.",
  },
]

export default function PracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([2])

  const currentQ = questions[currentQuestion - 1]

  function handlePrev() {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1)
  }

  function handleNext() {
    if (currentQuestion < questions.length) {
      if (!answeredQuestions.includes(currentQuestion)) {
        setAnsweredQuestions([...answeredQuestions, currentQuestion])
      }
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  function handleFlag() {
    if (flaggedQuestions.includes(currentQuestion)) {
      setFlaggedQuestions(flaggedQuestions.filter((q) => q !== currentQuestion))
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion])
    }
  }

  return (
    <AppLayout>
      <AppHeader title="Practice" subtitle="Anatomy - Chapter 5" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            {/* Main Question Area */}
            <div>
              <QuestionCard
                questionNumber={currentQuestion}
                totalQuestions={questions.length}
                question={currentQ.question}
                options={currentQ.options}
                correctAnswer={currentQ.correctAnswer}
                explanation={currentQ.explanation}
              />

              {/* Navigation Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 1}
                  className="flex h-10 items-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-5 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 hover:border-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--surface))] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={handleFlag}
                  className={`flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200 ${
                    flaggedQuestions.includes(currentQuestion)
                      ? "bg-[#FEF3C7] text-[#B45309]"
                      : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {flaggedQuestions.includes(currentQuestion) ? "Flagged" : "Flag"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length}
                  className="flex h-10 items-center gap-2 rounded-full bg-[#4A7FFF] px-5 text-sm font-medium text-[#FFFFFF] transition-all duration-200 hover:bg-[#3D6EE8] hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigator */}
            <div className="hidden lg:block">
              <QuestionNavigator
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answeredQuestions={answeredQuestions}
                flaggedQuestions={flaggedQuestions}
                onSelect={setCurrentQuestion}
              />
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
