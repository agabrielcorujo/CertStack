import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppProviders } from '@/components/app-providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CertStack — Exam Prep Platform',
  description: 'CertStack helps you practice FE, PE, AWS, and other licensing exams with guided problem solving and coaching.',
  icons: {
    icon: [
      {
        url: '/placeholder.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/placeholder-user.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
