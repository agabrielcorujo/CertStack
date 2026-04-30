"use client"

import * as React from "react"
import { CertificationFocusProvider } from "@/lib/certification-focus"
import { ThemeProvider } from "./theme-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <CertificationFocusProvider>{children}</CertificationFocusProvider>
    </ThemeProvider>
  )
}
