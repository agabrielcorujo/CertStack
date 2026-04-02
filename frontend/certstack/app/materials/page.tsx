"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MaterialsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}

const categories = ["All", "Textbooks", "Videos", "Audio", "Notes"]

const materials = [
  {
    id: 1,
    title: "AWS Cloud Practitioner Study Guide",
    type: "notes" as const,
    subject: "Cloud Computing",
    size: "2.4 MB",
    date: "Jan 15, 2026",
    downloads: 1240,
  },
  {
    id: 2,
    title: "Kubernetes Fundamentals Video Series",
    type: "video" as const,
    subject: "DevOps",
    size: "850 MB",
    date: "Jan 22, 2026",
    downloads: 890,
  },
  {
    id: 3,
    title: "Network Security Best Practices Guide",
    type: "notes" as const,
    subject: "Cybersecurity",
    size: "1.8 MB",
    date: "Feb 1, 2026",
    downloads: 2100,
  },
  {
    id: 4,
    title: "Agile & Scrum Methodology Audio Course",
    type: "audio" as const,
    subject: "Project Management",
    size: "120 MB",
    date: "Jan 28, 2026",
    downloads: 560,
  },
  {
    id: 5,
    title: "Python Programming Complete Textbook",
    type: "textbook" as const,
    subject: "Programming",
    size: "15 MB",
    date: "Dec 20, 2025",
    downloads: 3200,
  },
  {
    id: 6,
    title: "Docker Containerization Tutorial Videos",
    type: "video" as const,
    subject: "DevOps",
    size: "420 MB",
    date: "Feb 3, 2026",
    downloads: 710,
  },
]

const typeConfig = {
  notes: { icon: FileText, color: "#4A7FFF", bg: "#EFF6FF" },
  video: { icon: Video, color: "#10B981", bg: "#ECFDF5" },
  audio: { icon: Headphones, color: "#A78BFA", bg: "#F3F0FF" },
  textbook: { icon: BookOpen, color: "#F59E0B", bg: "#FEF3C7" },
}

export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = materials.filter((m) => {
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Textbooks" && m.type === "textbook") ||
      (activeCategory === "Videos" && m.type === "video") ||
      (activeCategory === "Audio" && m.type === "audio") ||
      (activeCategory === "Notes" && m.type === "notes")
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AppLayout>
      <AppHeader title="Study Resources" subtitle="Access your learning materials" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150",
                    activeCategory === cat
                      ? "bg-[#4A7FFF] text-[#FFFFFF]"
                      : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border-light))]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-xl border border-transparent bg-[hsl(var(--surface))] pl-10 pr-4 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[hsl(var(--border))] focus:bg-[hsl(var(--surface-elevated))] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
              />
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((material) => {
              const config = typeConfig[material.type]
              const TypeIcon = config.icon
              return (
                <div
                  key={material.id}
                  className="group cursor-pointer rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: config.bg }}
                    >
                      <TypeIcon className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-[hsl(var(--text-primary))]">
                        {material.title}
                      </h3>
                      <p className="mt-1 text-xs text-[hsl(var(--text-tertiary))]">{material.subject}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border-light))] pt-3">
                    <div className="flex gap-4 text-xs text-[hsl(var(--text-tertiary))]">
                      <span>{material.size}</span>
                      <span>{material.downloads.toLocaleString()} downloads</span>
                    </div>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--text-tertiary))] opacity-0 transition-all duration-150 hover:bg-[hsl(var(--surface))] group-hover:opacity-100"
                      aria-label={`Download ${material.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-[hsl(var(--text-tertiary))]" />
              <p className="mt-4 text-sm font-medium text-[hsl(var(--text-secondary))]">No materials found</p>
              <p className="mt-1 text-xs text-[hsl(var(--text-tertiary))]">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
