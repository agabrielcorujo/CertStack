"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ExamsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}
  CheckCircle,
  Play,
  ChevronDown,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ExamStatus = "all" | "available" | "completed" | "upcoming"

interface Exam {
  id: number
  name: string
  subject: string
  questions: number
  duration: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "available" | "completed" | "upcoming"
  score?: number
  date?: string
  attempts?: number
}

const exams: Exam[] = [
  {
    id: 1,
    name: "AWS Solutions Architect Practice Exam",
    subject: "Cloud Computing",
    questions: 65,
    duration: "2 hours",
    difficulty: "Hard",
    status: "available",
    attempts: 0,
  },
  {
    id: 2,
    name: "Project Management Professional (PMP) Mock",
    subject: "Project Management",
    questions: 180,
    duration: "4 hours",
    difficulty: "Hard",
    status: "completed",
    score: 85,
    date: "Jan 28, 2026",
    attempts: 2,
  },
  {
    id: 3,
    name: "CompTIA Security+ Practice Test",
    subject: "Cybersecurity",
    questions: 90,
    duration: "90 minutes",
    difficulty: "Medium",
    status: "completed",
    score: 92,
    date: "Jan 20, 2026",
    attempts: 1,
  },
  {
    id: 4,
    name: "Certified Kubernetes Administrator (CKA)",
    subject: "DevOps",
    questions: 15,
    duration: "2 hours",
    difficulty: "Hard",
    status: "available",
    attempts: 0,
  },
  {
    id: 5,
    name: "Google Cloud Professional Exam",
    subject: "Cloud Computing",
    questions: 50,
    duration: "2 hours",
    difficulty: "Medium",
    status: "upcoming",
    date: "Mar 5, 2026",
  },
  {
    id: 6,
    name: "Microsoft Azure Fundamentals (AZ-900)",
    subject: "Cloud Computing",
    questions: 60,
    duration: "1 hour",
    difficulty: "Easy",
    status: "completed",
    score: 73,
    date: "Jan 15, 2026",
    attempts: 1,
  },
  {
    id: 7,
    name: "Scrum Master Certification Practice",
    subject: "Agile/Scrum",
    questions: 80,
    duration: "1 hour",
    difficulty: "Easy",
    status: "available",
    attempts: 0,
  },
  {
    id: 8,
    name: "Cisco CCNA Comprehensive Exam",
    subject: "Networking",
    questions: 120,
    duration: "2 hours",
    difficulty: "Hard",
    status: "upcoming",
    date: "Mar 12, 2026",
  },
]

const difficultyConfig = {
  Easy: { bg: "#ECFDF5", text: "#047857" },
  Medium: { bg: "#FEF3C7", text: "#B45309" },
  Hard: { bg: "#FEE2E2", text: "#B91C1C" },
}

const statusConfig = {
  available: { label: "Start Exam", icon: Play, color: "#4A7FFF" },
  completed: { label: "Review", icon: CheckCircle, color: "#10B981" },
  upcoming: { label: "Upcoming", icon: Calendar, color: "#F59E0B" },
}

const tabs: { label: string; value: ExamStatus }[] = [
  { label: "All Exams", value: "all" },
  { label: "Available", value: "available" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
]

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredExams = exams.filter((exam) => {
    const matchesTab = activeTab === "all" || exam.status === activeTab
    const matchesSearch =
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <AppLayout>
      <AppHeader title="Mock Exams" subtitle="Full-length certification practice exams" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          {/* Filters Row */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-[hsl(var(--surface))] p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
                    activeTab === tab.value
                      ? "bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-primary))] shadow-sm"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-64 rounded-xl border border-transparent bg-[hsl(var(--surface))] pl-10 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[hsl(var(--border))] focus:bg-[hsl(var(--surface-elevated))] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                />
              </div>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] px-4 text-sm font-medium text-[hsl(var(--text-secondary))] transition-colors duration-150 hover:bg-[hsl(var(--surface))]">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Exam Table */}
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Exam Name
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Subject
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Questions
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Duration
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Difficulty
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Action
              </span>
            </div>

            {/* Table Rows */}
            {filteredExams.map((exam) => {
              const difficulty = difficultyConfig[exam.difficulty]
              const status = statusConfig[exam.status]
              const StatusIcon = status.icon
              return (
                <div
                  key={exam.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] items-center gap-4 border-b border-[hsl(var(--border-light))] px-6 py-4 transition-colors duration-150 last:border-b-0 hover:bg-[hsl(var(--surface))]"
                >
                  {/* Name */}
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{exam.name}</p>
                    {exam.status === "completed" && exam.score !== undefined && (
                      <p className="mt-0.5 text-xs text-[hsl(var(--text-tertiary))]">
                        Score: {exam.score}% | {exam.attempts} attempt{exam.attempts !== 1 ? "s" : ""}
                      </p>
                    )}
                    {exam.status === "upcoming" && exam.date && (
                      <p className="mt-0.5 text-xs text-[hsl(var(--text-tertiary))]">
                        Available: {exam.date}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <span className="text-sm text-[hsl(var(--text-secondary))]">{exam.subject}</span>

                  {/* Questions */}
                  <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                    <FileText className="h-3.5 w-3.5" />
                    {exam.questions}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                    <Clock className="h-3.5 w-3.5" />
                    {exam.duration}
                  </div>

                  {/* Difficulty */}
                  <span
                    className="inline-flex h-6 w-fit items-center rounded-full px-3 text-xs font-medium"
                    style={{ backgroundColor: difficulty.bg, color: difficulty.text }}
                  >
                    {exam.difficulty}
                  </span>

                  {/* Action */}
                  <button
                    disabled={exam.status === "upcoming"}
                    className={cn(
                      "flex h-9 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-all duration-200",
                      exam.status === "upcoming"
                        ? "cursor-not-allowed bg-[hsl(var(--surface))] text-[hsl(var(--text-tertiary))]"
                        : exam.status === "completed"
                          ? "bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]"
                          : "bg-[#4A7FFF] text-[#FFFFFF] hover:bg-[#3D6EE8]"
                    )}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </button>
                </div>
              )
            })}

            {filteredExams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-[hsl(var(--text-tertiary))]" />
                <p className="mt-4 text-sm font-medium text-[hsl(var(--text-secondary))]">
                  No exams found
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--text-tertiary))]">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
