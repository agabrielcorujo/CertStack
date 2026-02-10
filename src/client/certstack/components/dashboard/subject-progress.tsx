"use client"

const subjects = [
  { 
    name: "Anatomy", 
    progress: 85, 
    total: 500, 
    completed: 425, 
    colorFrom: "hsl(var(--subject-anatomy))",
    colorTo: "hsl(223 100% 76%)",
  },
  { 
    name: "Pharmacology", 
    progress: 62, 
    total: 400, 
    completed: 248, 
    colorFrom: "hsl(var(--subject-pharma))",
    colorTo: "hsl(165 75% 60%)",
  },
  { 
    name: "Biochemistry", 
    progress: 45, 
    total: 350, 
    completed: 157, 
    colorFrom: "hsl(var(--subject-biochem))",
    colorTo: "hsl(38 100% 70%)",
  },
  { 
    name: "Pathology", 
    progress: 30, 
    total: 450, 
    completed: 135, 
    colorFrom: "hsl(var(--subject-pathology))",
    colorTo: "hsl(255 80% 85%)",
  },
  { 
    name: "Microbiology", 
    progress: 72, 
    total: 300, 
    completed: 216, 
    colorFrom: "hsl(var(--subject-micro))",
    colorTo: "hsl(350 100% 80%)",
  },
]

export function SubjectProgress() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Subject Progress</h3>
        <button className="text-sm font-medium text-[hsl(var(--primary-600))] transition-colors hover:text-[hsl(var(--primary-700))]">
          Details
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {subjects.map((subject) => (
          <div key={subject.name} className="space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                {subject.name}
              </span>
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                {subject.completed}/{subject.total}
              </span>
            </div>
            
            {/* Progress bar - thicker with gradient */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--background-surface))]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${subject.progress}%`,
                  background: `linear-gradient(to right, ${subject.colorFrom}, ${subject.colorTo})`,
                }}
              />
            </div>
            
            {/* Percentage - larger and colored */}
            <div className="text-right">
              <span 
                className="text-lg font-bold"
                style={{ color: subject.colorFrom }}
              >
                {subject.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
