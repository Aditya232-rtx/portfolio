import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import { FULL_NAME, HOME_TITLE, SITE_ORIGIN } from '@/lib/seo'
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: HOME_TITLE,
    template: `%s | ${FULL_NAME}`,
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
        <noscript>
          <style>{'[data-reveal] { visibility: visible } [data-preloader="count"] { display: none }'}</style>
        </noscript>
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
