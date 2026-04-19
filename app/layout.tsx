import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DM_Sans, Space_Mono, Source_Serif_4 } from 'next/font/google'

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ["400", "500", "600", "700"],
  variable: '--font-dm-sans'
})

const spaceMono = Space_Mono({ 
  subsets: ['latin'], 
  weight: ["400", "700"],
  variable: '--font-space-mono'
})

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'], 
  weight: ["400", "600", "700"],
  variable: '--font-source-serif'
})

export const metadata: Metadata = {
  title: 'HORMULSE AI - Self-Evolving Intelligence',
  description: 'An advanced AI control system with multi-model orchestration, real-time analytics, and unlimited potential',
  generator: 'HORMULSE AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${dmSans.variable} ${spaceMono.variable} ${sourceSerif.variable} font-sans antialiased bg-background text-foreground scanline`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
