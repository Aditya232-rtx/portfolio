import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import { IDENTITY } from '@/content/site'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { PreloaderReadyProvider } from '@/components/providers/PreloaderReadyProvider'
import { Shell } from '@/components/shell/Shell'
import './globals.css'

/**
 * The reference uses Akzidenz-Grotesk Pro Medium — a licensed face we cannot
 * redistribute. Inter Tight at weight 500 is the closest free grotesk in
 * proportion and x-height; tracking is tuned in tokens.css to match.
 */
const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
})

const NAME = `${IDENTITY.firstName} ${IDENTITY.lastName}`

export const metadata: Metadata = {
  title: `${NAME} — Software Developer`,
  description:
    'Software developer building backend services, agent systems and data pipelines, with a focus on correctness, observability and production reliability.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: `${NAME} — Software Developer`,
    description:
      'Backend services, agent systems and data pipelines built for production.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={interTight.variable}>
      <body className="theme-base">
        <ThemeProvider>
          <SmoothScrollProvider>
            <PreloaderReadyProvider>
              <Shell>{children}</Shell>
            </PreloaderReadyProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
