import type { Metadata } from "next"
import type { ReactNode } from "react"
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "CertStack",
  description: "Quizlet-style certification prep for flashcards, full exams, and progress tracking.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable}`}>{children}</body>
    </html>
  )
}
