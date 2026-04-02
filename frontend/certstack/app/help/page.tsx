"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HelpPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}

const faqs = [
  {
    question: "How do I start a practice session?",
    answer: "Navigate to the Practice page from the sidebar, select your subject and topic, then click 'Start Practice' to begin answering questions.",
  },
  {
    question: "Can I retake an exam?",
    answer: "Yes, you can retake any available exam as many times as you want. Your best score will be recorded in your profile.",
  },
  {
    question: "How is my score calculated?",
    answer: "Your score is calculated as the percentage of correct answers. Each question carries equal weight unless specified otherwise.",
  },
  {
    question: "Can I download study materials for offline use?",
    answer: "Yes, you can download most study materials from the Materials page. Click the download icon on any resource card.",
  },
  {
    question: "How do I reset my progress?",
    answer: "Go to Settings > Study Preferences and click 'Reset Progress'. Note that this action is irreversible.",
  },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <AppLayout>
      <AppHeader title="Help Center" subtitle="Find answers and get support" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="h-14 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] pl-12 pr-4 text-base text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <BookOpen className="h-6 w-6 text-[#4A7FFF]" />
              </div>
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Documentation</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">Browse guides</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5]">
                <MessageCircle className="h-6 w-6 text-[#10B981]" />
              </div>
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Live Chat</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">Talk to support</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <Mail className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Email Us</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">Get in touch</span>
            </div>
          </div>

          {/* FAQs */}
          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Frequently Asked Questions</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border-b border-[hsl(var(--border-light))] last:border-b-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{faq.question}</span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-[hsl(var(--text-tertiary))] transition-transform duration-200 ${openFaq === idx ? "rotate-90" : ""}`}
                      />
                    </button>
                    {openFaq === idx && (
                      <p className="pb-4 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
