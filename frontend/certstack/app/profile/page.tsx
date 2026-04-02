"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}
  { label: "Notifications", value: "notifications" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <AppLayout>
      <AppHeader title="Profile" subtitle="Manage your account" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header Card */}
          <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DBEAFE] text-2xl font-bold text-[#3D6EE8]">
                  JD
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--surface-elevated))] bg-[#4A7FFF] text-[#FFFFFF] transition-colors duration-150 hover:bg-[#3D6EE8]"
                  aria-label="Change avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">John Doe</h2>
                <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">IT Professional • Certification Learner</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                  <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <Mail className="h-3.5 w-3.5" /> john.doe@company.com
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <MapPin className="h-3.5 w-3.5" /> New York, USA
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <Calendar className="h-3.5 w-3.5" /> Joined Sep 2024
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button className="h-10 rounded-full border-2 border-[hsl(var(--border))] px-6 text-sm font-medium text-[#4A7FFF] transition-all duration-200 hover:border-[#4A7FFF] hover:bg-[#EFF6FF]">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-[hsl(var(--border-light))]">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "border-b-2 px-6 py-3 text-sm font-medium transition-colors duration-150",
                  activeTab === tab.value
                    ? "border-[#4A7FFF] text-[#4A7FFF]"
                    : "border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </main>
    </AppLayout>
  )
}

function ProfileTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Personal Info */}
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Personal Information</h3>
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" value="John Doe" />
          <FormField label="Email" value="john.doe@company.com" />
          <FormField label="Phone" value="+1 (555) 123-4567" />
          <FormField label="Location" value="New York, USA" />
        </div>
      </div>

      {/* Professional Info */}
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Professional Information</h3>
        <div className="flex flex-col gap-4">
          <FormField label="Company" value="TechCorp Inc." />
          <FormField label="Role" value="Software Engineer" />
          <FormField label="Experience" value="3 years" />
          <FormField label="Target Certification" value="AWS Solutions Architect" />
        </div>
      </div>

      {/* Study Stats */}
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Study Statistics</h3>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <StatItem label="Total Study Hours" value="245h" />
          <StatItem label="Questions Answered" value="4,821" />
          <StatItem label="Average Score" value="78%" />
          <StatItem label="Exams Completed" value="23" />
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Account Settings */}
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Account Settings</h3>
        <div className="flex flex-col gap-5">
          <InputField label="Email Address" type="email" defaultValue="john.doe@company.com" />
          <InputField label="Password" type="password" defaultValue="************" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
              Language
            </label>
            <select className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] px-4 text-sm text-[hsl(var(--text-primary))] focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="h-10 rounded-full bg-[#4A7FFF] px-6 text-sm font-medium text-[#FFFFFF] transition-all duration-200 hover:bg-[#3D6EE8]">
            Save Changes
          </button>
          <button className="h-10 rounded-full border-2 border-[hsl(var(--border))] px-6 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 hover:bg-[hsl(var(--surface))]">
            Cancel
          </button>
        </div>
      </div>

      {/* Study Preferences */}
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Study Preferences</h3>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Show timer during practice" description="Display countdown timer during practice sessions" defaultChecked />
          <ToggleRow label="Auto-advance questions" description="Automatically move to next question after answering" defaultChecked={false} />
          <ToggleRow label="Show explanations immediately" description="Display explanations right after answering" defaultChecked />
          <ToggleRow label="Shuffle question order" description="Randomize question order in practice sets" defaultChecked />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-[#FEE2E2] bg-[hsl(var(--surface-elevated))] p-6">
        <h3 className="mb-2 text-base font-semibold text-[#B91C1C]">Danger Zone</h3>
        <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="flex gap-3">
          <button className="h-10 rounded-full border-2 border-[#FEE2E2] px-6 text-sm font-medium text-[#EF4444] transition-all duration-200 hover:bg-[#FEF2F2]">
            Delete Account
          </button>
          <button className="h-10 rounded-full border-2 border-[hsl(var(--border))] px-6 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all duration-200 hover:bg-[hsl(var(--surface))]">
            Export Data
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsTab() {
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="mb-5 text-base font-semibold text-[hsl(var(--text-primary))]">Notification Preferences</h3>
        <div className="flex flex-col gap-4">
          <ToggleRow label="Email notifications" description="Receive study reminders via email" defaultChecked />
          <ToggleRow label="Exam reminders" description="Get notified before upcoming exams" defaultChecked />
          <ToggleRow label="Progress reports" description="Weekly summary of your study progress" defaultChecked />
          <ToggleRow label="New content alerts" description="Get notified when new practice material is available" defaultChecked={false} />
          <ToggleRow label="Marketing emails" description="Receive product updates and promotions" defaultChecked={false} />
        </div>
      </div>
    </div>
  )
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[hsl(var(--surface))] px-4 py-3">
      <span className="text-sm text-[hsl(var(--text-secondary))]">{label}</span>
      <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{value}</span>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[hsl(var(--surface))] p-4 text-center">
      <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{value}</p>
      <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">{label}</p>
    </div>
  )
}

function InputField({
  label,
  type,
  defaultValue,
}: {
  label: string
  type: string
  defaultValue: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] px-4 text-sm text-[hsl(var(--text-primary))] transition-all duration-200 focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
      />
    </div>
  )
}

function ToggleRow({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between rounded-xl py-2">
      <div>
        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</p>
        <p className="mt-0.5 text-xs text-[hsl(var(--text-tertiary))]">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-[#4A7FFF]" : "bg-[#D1D5DB]"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[#FFFFFF] shadow-sm transition-transform duration-200",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  )
}
