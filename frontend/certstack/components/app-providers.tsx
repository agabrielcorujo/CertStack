"use client"

import * as React from "react"
import { CertificationFocusProvider } from "@/lib/certification-focus"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CertificationFocusProvider>{children}</CertificationFocusProvider>
}
