'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { IDENTITY } from '@/content/site'
import { DUR } from '@/lib/motion/constants'
import { gooText, killGooTweens } from '@/lib/motion/goo'
import { useLenis } from '@/components/providers/SmoothScrollProvider'
import { usePreloaderReady } from '@/components/providers/PreloaderReadyProvider'
import styles from './StickyName.module.css'

/**
 * Rest and collapsed widths as percentages of the full-bleed parent, so they
 * hold at any viewport. 1408/1440 = 97.778%; the reference's 29.45rem collapsed
 * width is 424px of 1440 = 29.444%.
 */
const REST_WIDTH = '97.778%'
/** How faint the two halves sit while scrolling the page. */
const REST_OPACITY = 0.22
const COLLAPSED_WIDTH = '29.444%'
/** Treat "within 2px of the end" as the bottom. */
const BOTTOM_EPSILON = 2

export function StickyName() {
  const lenis = useLenis()
  const ready = usePreloaderReady()
  const innerRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const triggered = useRef(false)

  useEffect(() => {
    const inner = innerRef.current
    const meta = metaRef.current
    /**
     * Gated on `ready`, not just mount: on the home page this is the same
     * preloader handoff every heading waits for. Setting opacity eagerly
     * here — as an earlier version did — showed the name during the
     * preloader itself, well before the page it belongs to had appeared.
     */
    if (!inner || !meta || !lenis || !ready) return

    const metaLines = Array.from(
      meta.querySelectorAll<HTMLElement>('[data-sticky-meta]'),
    )

    const parts = Array.from(
      inner.querySelectorAll<HTMLElement>('[data-name-part]'),
    )

    // Entrance: a plain blur+opacity fade, not the SVG goo reveal — gooText
    // forces opacity to a flat 1, which would clobber the parts' resting
    // 0.22 dimness (set in CSS) the moment it ran.
    gsap.fromTo(
      inner,
      { opacity: 0 },
      { opacity: 1, duration: DUR.m, ease: 'Out' },
    )
    gsap.fromTo(
      parts,
      { filter: 'blur(20px)' },
      { filter: 'blur(0px)', duration: DUR.l, ease: 'power2.out' },
    )

    gsap.set(metaLines, { visibility: 'visible' })
    gooText(metaLines, 'initial')

    const tl = gsap
      .timeline({
        paused: true,
        onReverseComplete: () => {
          killGooTweens(metaLines)
          gooText(metaLines, 'initial')
        },
      })
      .fromTo(
        inner,
        { width: REST_WIDTH },
        { width: COLLAPSED_WIDTH, duration: DUR.m, ease: 'InOut' },
      )
      /**
       * The halves sit faded at the page edges the whole way down, then come up
       * to full black as they close together — the name resolving is the last
       * beat of the page.
       */
      .fromTo(
        parts,
        { opacity: REST_OPACITY },
        { opacity: 1, duration: DUR.m, ease: 'InOut' },
        0,
      )
      .fromTo(
        inner,
        { opacity: 0.1 },
        { opacity: 1, duration: DUR.s, ease: 'InOut' },
        `-=${DUR.s}`,
      )
      .add(() => {
        killGooTweens(metaLines)
        gooText(metaLines, 'reveal', 0)
      })

    timeline.current = tl

    const check = () => {
      const limit = lenis.limit
      const atBottom = limit <= BOTTOM_EPSILON || lenis.scroll >= limit - BOTTOM_EPSILON

      if (atBottom && !triggered.current) {
        triggered.current = true
        tl.play()
      } else if (!atBottom && triggered.current) {
        triggered.current = false
        killGooTweens(metaLines)
        gooText(metaLines, 'hide')
        tl.reverse()
      }
    }

    lenis.on('scroll', check)
    const settle = gsap.delayedCall(0.15, check)

    return () => {
      lenis.off('scroll', check)
      settle.kill()
      tl.kill()
    }
  }, [lenis, ready])

  return (
    <section className={styles.sticky} aria-hidden="true">
      <div ref={innerRef} className={styles.inner}>
        <div className={`${styles.part} h1`} data-name-part>
          {IDENTITY.stickyNameLeft}
        </div>
        <div className={`${styles.part} h1`} data-name-part>
          {IDENTITY.stickyNameRight}
        </div>
      </div>
      <div ref={metaRef} className={styles.meta}>
        <div className="p1" data-sticky-meta>
          {IDENTITY.metaLeft}
        </div>
        <div className="p1" data-sticky-meta>
          {IDENTITY.metaRight}
        </div>
      </div>
    </section>
  )
}
