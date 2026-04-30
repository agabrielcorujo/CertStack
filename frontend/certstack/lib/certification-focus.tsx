"use client"

import * as React from "react"

export interface CertificationOption {
  id: string
  label: string
  family: string
}

export const CERTIFICATION_OPTIONS: CertificationOption[] = [
  { id: "fe-civil", label: "FE Civil", family: "Engineering" },
  { id: "fe-mechanical", label: "FE Mechanical", family: "Engineering" },
  { id: "pe-civil", label: "PE Civil", family: "Engineering" },
  { id: "pe-mechanical", label: "PE Mechanical", family: "Engineering" },
  { id: "aws-ccp", label: "AWS CCP", family: "Cloud" },
  { id: "aws-saa", label: "AWS SAA", family: "Cloud" },
  { id: "aws-security", label: "AWS Security", family: "Cloud" },
  { id: "pmp", label: "PMP", family: "Project Management" },
]

interface CertificationFocusContextValue {
  selectedIds: string[]
  selectedCertifications: CertificationOption[]
  primaryId: string | null
  primaryCertification: CertificationOption | null
  toggleCertification: (id: string) => void
  setPrimaryCertification: (id: string) => void
}

const STORAGE_KEY = "certstack.study-focus"

const CertificationFocusContext = React.createContext<CertificationFocusContextValue | undefined>(undefined)

export function CertificationFocusProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [primaryId, setPrimaryId] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { selectedIds?: string[]; primaryId?: string | null }
      const validSelected = (parsed.selectedIds ?? []).filter((id) => CERTIFICATION_OPTIONS.some((c) => c.id === id))
      const validPrimary = parsed.primaryId && CERTIFICATION_OPTIONS.some((c) => c.id === parsed.primaryId) ? parsed.primaryId : null
      setSelectedIds(validSelected)
      setPrimaryId(validPrimary && validSelected.includes(validPrimary) ? validPrimary : validSelected[0] ?? null)
    } catch {
      // Ignore malformed local storage and use defaults.
    }
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIds, primaryId }))
    } catch {
      // Ignore storage failures.
    }
  }, [selectedIds, primaryId])

  const toggleCertification = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id)
        setPrimaryId((oldPrimary) => (oldPrimary === id ? next[0] ?? null : oldPrimary))
        return next
      }

      const next = [...prev, id]
      setPrimaryId((oldPrimary) => oldPrimary ?? id)
      return next
    })
  }

  const setPrimaryCertification = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setPrimaryId(id)
  }

  const selectedCertifications = React.useMemo(
    () => CERTIFICATION_OPTIONS.filter((option) => selectedIds.includes(option.id)),
    [selectedIds]
  )

  const primaryCertification = React.useMemo(
    () => CERTIFICATION_OPTIONS.find((option) => option.id === primaryId) ?? null,
    [primaryId]
  )

  return (
    <CertificationFocusContext.Provider
      value={{
        selectedIds,
        selectedCertifications,
        primaryId,
        primaryCertification,
        toggleCertification,
        setPrimaryCertification,
      }}
    >
      {children}
    </CertificationFocusContext.Provider>
  )
}

export function useCertificationFocus() {
  const context = React.useContext(CertificationFocusContext)
  if (!context) {
    throw new Error("useCertificationFocus must be used within CertificationFocusProvider")
  }
  return context
}
