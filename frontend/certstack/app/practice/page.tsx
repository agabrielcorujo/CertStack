"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PracticePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}

const questions = [
  {
    id: 1,
    question:
      "Which of the following is a key principle of object-oriented programming?",
    options: [
      { id: "a", text: "Procedural abstraction" },
      { id: "b", text: "Encapsulation" },
      { id: "c", text: "Linear execution" },
      { id: "d", text: "Direct memory access" },
    ],
    correctAnswer: "b",
    explanation:
      "Encapsulation is one of the four fundamental principles of object-oriented programming, along with abstraction, inheritance, and polymorphism. It refers to bundling data and methods that operate on that data within a single unit (class) and restricting direct access to some components.",
  },
  {
    id: 2,
    question:
      "What is the primary purpose of a load balancer in a distributed system?",
    options: [
      { id: "a", text: "Data encryption" },
      { id: "b", text: "Distributing requests across multiple servers" },
      { id: "c", text: "Database replication" },
      { id: "d", text: "Code compilation" },
    ],
    correctAnswer: "b",
    explanation:
      "A load balancer distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed. This improves application availability, reliability, and scalability by efficiently managing resource utilization.",
  },
  {
    id: 3,
    question: "In agile methodology, what is the purpose of a sprint retrospective?",
    options: [
      { id: "a", text: "Planning the next sprint tasks" },
      { id: "b", text: "Reviewing and improving team processes" },
      { id: "c", text: "Demonstrating completed work" },
      { id: "d", text: "Estimating story points" },
    ],
    correctAnswer: "b",
    explanation:
      "A sprint retrospective is a meeting held at the end of each sprint where the team reflects on what went well, what didn't, and identifies specific improvements for the next sprint. It focuses on continuous process improvement.",
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
      <AppHeader title="Practice" subtitle="Software Development - Core Concepts" />
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
