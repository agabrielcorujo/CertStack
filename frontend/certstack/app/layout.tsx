import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppProviders } from '@/components/app-providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CertStack',
  description: 'CertStack helps you practice FE, PE, AWS, and other licensing exams with guided problem solving and coaching.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/placeholder.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/placeholder-user.jpg',
    other: [
      { rel: 'apple-touch-icon', url: '/placeholder-user.jpg', sizes: '180x180' },
    ],
    manifest: '/site.webmanifest',
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
        <a href="#content" className="skip-link">Skip to content</a>
        <AppProviders>
          <main id="content" tabIndex={-1}>
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  )
}
