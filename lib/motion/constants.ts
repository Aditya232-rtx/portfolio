/**
 * Motion constants, lifted verbatim from the reference bundle.
 * See docs/REFERENCE.md §5.
 */

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

export const DUR = {
  xs: 0.2,
  s: 0.4,
  m: 0.8,
  l: 1.2,
} as const

export const STAGGER = 0.1
export const DELAY_REVEAL = 0.2
export const STAGGER_DEFAULT = 0.05
export const DURATION_DEFAULT = 0.6

/** Lenis config, matching the reference exactly. */
export const LENIS_OPTIONS = {
  duration: 1.2,
  smoothWheel: true,
  touchMultiplier: 2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
} as const

let registered = false

/**
 * Register plugins and the named eases. Safe to call repeatedly; only the first
 * call does work. Must run in the browser.
 */
export function registerMotion(): void {
  if (registered || typeof window === 'undefined') return
  registered = true

  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)

  CustomEase.create('InOut', '0.76,0,0.24,1')
  CustomEase.create('Out', '0.25,1,0.5,1')
  CustomEase.create('In', '0.5,0,0.75,0')
  CustomEase.create('ease', '0.25,0.1,0.25,1')
  CustomEase.create('Write', '0.333,0,0.667,1')
  /* hirotos.com's zoom ease, used by the projects marquee */
  CustomEase.create('Zoom', '0.2,0.8,0.2,1')

  gsap.ticker.lagSmoothing(0)

  if (process.env.NODE_ENV === 'development') {
    ;(window as unknown as { gsap: typeof gsap }).gsap = gsap
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
