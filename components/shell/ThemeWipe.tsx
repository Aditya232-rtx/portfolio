'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './ThemeWipe.module.css'

/**
 * Circular wipe on theme change. The reference does this in WebGL; a clip-path
 * circle expanding from the click point is visually equivalent at this scale
 * and costs nothing.
 *
 * The disc is painted in the *outgoing* colour and grows outward, so the new
 * background is revealed behind it.
 * See docs/REFERENCE.md §9.
 */

const WIPE_S = 1.5

type WipeDetail = {
  from: string
  origin?: { x: number; y: number }
}

export function ThemeWipe() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWipe = (event: Event) => {
      const { from, origin } = (event as CustomEvent<WipeDetail>).detail
      const x = origin?.x ?? window.innerWidth / 2
      const y = origin?.y ?? window.innerHeight / 2

      // Furthest corner sets the radius the disc must reach.
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(window.innerWidth - x, window.innerHeight - y),
      )

      el.style.background = from
      el.style.display = 'block'

      gsap.fromTo(
        el,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        {
          clipPath: `circle(${radius}px at ${x}px ${y}px)`,
          duration: WIPE_S,
          ease: 'Out',
          onComplete: () => {
            el.style.display = 'none'
          },
        },
      )
    }

    window.addEventListener('theme:wipe', onWipe)
    return () => window.removeEventListener('theme:wipe', onWipe)
  }, [])

  return <div ref={ref} className={styles.wipe} aria-hidden="true" />
}
