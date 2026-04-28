"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { useTheme } from "next-themes"
import { Icons } from "@/components/icons"

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

// ============================================================================
// SETTINGS SECTIONS
// ============================================================================

const settingsSections = [
  { id: "account", label: "Account", icon: Icons.profile },
  { id: "preferences", label: "Preferences", icon: Icons.settings },
  { id: "notifications", label: "Notifications", icon: Icons.bell },
  { id: "appearance", label: "Appearance", icon: Icons.sun },
  { id: "privacy", label: "Privacy", icon: Icons.lock },
]

// ============================================================================
// SETTINGS PAGE
// ============================================================================

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState("account")
  const [isSaving, setIsSaving] = React.useState(false)

  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account preferences and application settings
            </p>
          </motion.div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <motion.nav
              variants={itemVariants}
              className="w-full lg:w-64 shrink-0"
            >
              <div className="rounded-2xl border border-border bg-card p-2 elevation-1">
                {settingsSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </motion.nav>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="flex-1">
              <div className="rounded-2xl border border-border bg-card elevation-1">
                {/* Account Section */}
                {activeSection === "account" && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update your personal details and email address
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            defaultValue="Jane"
                            className="h-11 rounded-xl bg-secondary/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            defaultValue="Doe"
                            className="h-11 rounded-xl bg-secondary/50 border-border"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="jane@example.com"
                          className="h-11 rounded-xl bg-secondary/50 border-border"
                        />
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Update your password to keep your account secure
                        </p>
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              className="h-11 rounded-xl bg-secondary/50 border-border"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                className="h-11 rounded-xl bg-secondary/50 border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                className="h-11 rounded-xl bg-secondary/50 border-border"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Section */}
                {activeSection === "preferences" && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Learning Preferences</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Customize your practice sessions and learning experience
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="questionsPerSession">Questions per Session</Label>
                        <Select defaultValue="10">
                          <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 questions</SelectItem>
                            <SelectItem value="10">10 questions</SelectItem>
                            <SelectItem value="15">15 questions</SelectItem>
                            <SelectItem value="20">20 questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Default Difficulty</Label>
                        <Select defaultValue="mixed">
                          <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Show Timer</p>
                            <p className="text-sm text-muted-foreground">
                              Display a countdown timer during practice
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Immediate Feedback</p>
                            <p className="text-sm text-muted-foreground">
                              Show correct answer immediately after submission
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Spaced Repetition</p>
                            <p className="text-sm text-muted-foreground">
                              Prioritize questions you got wrong previously
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === "notifications" && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose what notifications you want to receive
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Daily Reminders</p>
                            <p className="text-sm text-muted-foreground">
                              Get reminded to practice every day
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Streak Alerts</p>
                            <p className="text-sm text-muted-foreground">
                              {"Get notified when you're about to lose your streak"}
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Achievement Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Celebrate when you earn new achievements
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Weekly Progress Report</p>
                            <p className="text-sm text-muted-foreground">
                              Receive a summary of your weekly progress
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">New Content Alerts</p>
                            <p className="text-sm text-muted-foreground">
                              Be notified when new topics are available
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="reminderTime">Reminder Time</Label>
                        <Select defaultValue="09:00">
                          <SelectTrigger className="h-11 rounded-xl bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Section */}
                {activeSection === "appearance" && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Customize how the app looks and feels
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="space-y-4">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: "light", label: "Light", icon: Icons.sun },
                            { id: "dark", label: "Dark", icon: Icons.moon },
                            { id: "system", label: "System", icon: Icons.settings },
                          ].map((themeOption) => {
                            const selected = mounted && theme === themeOption.id

                            return (
                              <motion.button
                                key={themeOption.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme(themeOption.id)}
                                className={cn(
                                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                                  selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground/50"
                                )}
                              >
                                <themeOption.icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{themeOption.label}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Reduce Motion</p>
                            <p className="text-sm text-muted-foreground">
                              Minimize animations throughout the app
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Compact Mode</p>
                            <p className="text-sm text-muted-foreground">
                              Use smaller spacing and font sizes
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === "privacy" && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-foreground">Privacy & Security</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage your privacy settings and account security
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Public Profile</p>
                            <p className="text-sm text-muted-foreground">
                              Allow others to see your profile and progress
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Show on Leaderboard</p>
                            <p className="text-sm text-muted-foreground">
                              Display your name on public leaderboards
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>

                      <Separator />

                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Irreversible actions that affect your account
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button variant="outline" size="sm" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
                            Export Data
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 sm:px-8">
                  <Button variant="outline" className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSaving ? (
                      <>
                        <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icons.save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
