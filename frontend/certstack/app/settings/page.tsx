"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  
  return null
}

type SettingSection = "account" | "notifications" | "appearance" | "data"

export default function SettingsPage() {
  const [section, setSection] = useState<SettingSection>("account")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)
  const [weeklyReport, setWeeklyReport] = useState(true)

  return (
    <AppLayout>
      <AppHeader title="Settings" subtitle="Manage your preferences" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
            {/* Sidebar Nav */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSection("account")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  section === "account"
                    ? "bg-[hsl(var(--pastel-blue))] text-[#4A7FFF]"
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <Lock className="h-4 w-4" />
                Account
              </button>
              <button
                onClick={() => setSection("notifications")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  section === "notifications"
                    ? "bg-[hsl(var(--pastel-blue))] text-[#4A7FFF]"
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setSection("appearance")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  section === "appearance"
                    ? "bg-[hsl(var(--pastel-blue))] text-[#4A7FFF]"
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <Palette className="h-4 w-4" />
                Appearance
              </button>
              <button
                onClick={() => setSection("data")}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  section === "data"
                    ? "bg-[hsl(var(--pastel-blue))] text-[#4A7FFF]"
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <Download className="h-4 w-4" />
                Data & Privacy
              </button>
            </div>

            {/* Content */}
            <div>
              {section === "account" && (
                <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
                  <h3 className="mb-6 text-lg font-semibold text-[hsl(var(--text-primary))]">Account Settings</h3>
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="john.doe@company.com"
                        className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm text-[hsl(var(--text-primary))] focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                        Change Password
                      </label>
                      <input
                        type="password"
                        placeholder="New password"
                        className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm text-[hsl(var(--text-primary))] focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]"
                      />
                    </div>
                    <button className="h-11 w-fit rounded-xl bg-[#4A7FFF] px-6 text-sm font-medium text-white hover:bg-[#3D6EE8]">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {section === "notifications" && (
                <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
                  <h3 className="mb-6 text-lg font-semibold text-[hsl(var(--text-primary))]">Notification Preferences</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Email Notifications</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Receive exam reminders and updates</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          emailNotifs ? "bg-[#4A7FFF]" : "bg-[hsl(var(--border))]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            emailNotifs ? "left-5" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Push Notifications</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Get notifications on your device</p>
                      </div>
                      <button
                        onClick={() => setPushNotifs(!pushNotifs)}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          pushNotifs ? "bg-[#4A7FFF]" : "bg-[hsl(var(--border))]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            pushNotifs ? "left-5" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Weekly Progress Report</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">Summary of your weekly activity</p>
                      </div>
                      <button
                        onClick={() => setWeeklyReport(!weeklyReport)}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          weeklyReport ? "bg-[#4A7FFF]" : "bg-[hsl(var(--border))]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            weeklyReport ? "left-5" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section === "appearance" && (
                <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
                  <h3 className="mb-6 text-lg font-semibold text-[hsl(var(--text-primary))]">Appearance</h3>
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                        Theme
                      </label>
                      <select className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm text-[hsl(var(--text-primary))] focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--text-primary))]">
                        Language
                      </label>
                      <select className="h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 text-sm text-[hsl(var(--text-primary))] focus:border-[#4A7FFF] focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {section === "data" && (
                <div className="flex flex-col gap-6">
                  <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-[hsl(var(--text-primary))]">Export Data</h3>
                    <p className="mb-4 text-sm text-[hsl(var(--text-secondary))]">
                      Download a copy of your study progress and exam results
                    </p>
                    <button className="flex h-11 items-center gap-2 rounded-xl border-2 border-[hsl(var(--border))] px-6 text-sm font-medium text-[hsl(var(--text-primary))] hover:border-[hsl(var(--text-tertiary))]">
                      <Download className="h-4 w-4" />
                      Export Data
                    </button>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-red-900">Danger Zone</h3>
                    <p className="mb-4 text-sm text-red-700">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <button className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-medium text-white hover:bg-red-700">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
