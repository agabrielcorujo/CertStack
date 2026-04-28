"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/icons"

type Achievement = {
  id: string
  title: string
  description: string
  earned: boolean
  progress: number // 0-100
}

const sampleAchievements: Achievement[] = [
  { id: "a1", title: "First Steps", description: "Complete your first game.", earned: true, progress: 100 },
  { id: "a2", title: "Streak Starter", description: "Get a 5-question streak.", earned: false, progress: 40 },
  { id: "a3", title: "Speed Demon", description: "Score 1000+ in Speed Round.", earned: false, progress: 60 },
  { id: "a4", title: "Topic Climber", description: "Reach Level 5 in Ladder.", earned: true, progress: 100 },
  { id: "a5", title: "Exam Ready", description: "Score 80%+ on an Exam Sprint.", earned: false, progress: 20 },
  { id: "a6", title: "Marathoner", description: "Practice for 30 days.", earned: false, progress: 5 },
  { id: "a7", title: "Quiz Master", description: "Answer 500 questions correctly.", earned: false, progress: 12 },
]

export function Achievements({ items = sampleAchievements }: { items?: Achievement[] }) {
  const [list, setList] = React.useState<Achievement[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("achievements:v1") : null
      return raw ? JSON.parse(raw) as Achievement[] : items
    } catch {
      return items
    }
  })

  const [filter, setFilter] = React.useState<"all" | "earned" | "locked">("all")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Achievement | null>(null)

  React.useEffect(() => {
    try {
      window.localStorage.setItem("achievements:v1", JSON.stringify(list))
    } catch {}
  }, [list])

  // Manual toggling of achievements removed to prevent marking from UI

  const visible = list
    .filter((a) => filter === "all" ? true : filter === "earned" ? a.earned : !a.earned)
    .filter((a) => `${a.title} ${a.description}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <section aria-labelledby="achievements" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="achievements" className="text-lg font-semibold text-foreground">Achievements</h2>
          <p className="text-xs text-muted-foreground">Earn medals by mastering topics</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            aria-label="Search achievements"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-md border border-border bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-1">
            <button onClick={() => setFilter("all")} className={filter === "all" ? "text-primary font-medium" : "text-muted-foreground text-sm"}>All</button>
            <button onClick={() => setFilter("earned")} className={filter === "earned" ? "text-primary font-medium" : "text-muted-foreground text-sm"}>Earned</button>
            <button onClick={() => setFilter("locked")} className={filter === "locked" ? "text-primary font-medium" : "text-muted-foreground text-sm"}>Locked</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="flex items-center gap-4 p-3 rounded-xl border border-border bg-secondary/30"
            role="button"
            tabIndex={0}
            onClick={() => setSelected(a)}
            onKeyDown={(e) => { if (e.key === "Enter") setSelected(a) }}
          >
            <motion.div
              initial={false}
              animate={a.earned ? { scale: [1, 1.14, 1] } : { rotate: 0 }}
              transition={a.earned ? { duration: 0.9, ease: "easeOut" } : {}}
              className={"flex h-12 w-12 items-center justify-center rounded-full " + (a.earned ? "bg-chart-3 text-primary-foreground" : "bg-muted text-muted-foreground")}
              aria-hidden
            >
              <Icons.award className="h-6 w-6" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                <span className={"text-xs font-medium " + (a.earned ? "text-chart-3" : "text-muted-foreground")}>
                  {a.earned ? "Earned" : `${a.progress}%`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{a.description}</p>

              {!a.earned && (
                <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                  <div
                    style={{ width: `${a.progress}%` }}
                    className="h-full rounded-full bg-primary transition-all duration-500"
                  />
                </div>
              )}
            </div>

            {/* Removed manual Mark Earned control */}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{visible.length} shown</div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.div initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: 24 }} transition={{ type: "spring" }} className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className={"flex h-14 w-14 items-center justify-center rounded-full " + (selected.earned ? "bg-chart-3 text-primary-foreground" : "bg-muted text-muted-foreground") }>
                  <Icons.award className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{selected.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="text-sm font-medium text-foreground">{selected.progress}%</div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div style={{ width: `${selected.progress}%` }} className="h-full rounded-full bg-primary" />
              </div>

              <div className="mt-4 flex items-center gap-2 justify-end">
                <button onClick={() => setSelected(null)} className="rounded-xl px-3 py-1 text-sm border border-border">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Achievements
