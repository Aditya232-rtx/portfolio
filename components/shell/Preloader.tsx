'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CommandMark } from '@/components/icons'
import { DUR, STAGGER, prefersReducedMotion } from '@/lib/motion/constants'
import { gooText } from '@/lib/motion/goo'
import { useSetPreloaderReady } from '@/components/providers/PreloaderReadyProvider'
import styles from './Preloader.module.css'

/** The progress block's own growth, independent of the counter. */
const BLOCK_GROW_S = 4
/** How long the 0→100 counter takes. */
const COUNT_S = 2

type Props = {
  /** Fires once the intro is done and the page should take over. */
  onComplete: () => void
}

export function Preloader({ onComplete }: Props) {
  const blockRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<SVGSVGElement>(null)
  const countRef = useRef<HTMLDivElement>(null)
  const done = useRef(false)
  /**
   * Once the intro is over the black block and the counter are torn out of the
   * DOM rather than left hidden behind a clip-path, so no later reflow or style
   * recalculation can bring them back as a stray black square.
   */
  const [finished, setFinished] = useState(false)
  const setPreloaderReady = useSetPreloaderReady()

  /**
   * Runs before paint, not after: the shared flag defaults to true (for
   * routes with no preloader at all), so a plain useEffect here would let
   * chrome gated on it — currently just the sticky name — flash visible for
   * one frame before this claims the page.
   */
  useLayoutEffect(() => {
    setPreloaderReady(false)
    return () => setPreloaderReady(true)
  }, [setPreloaderReady])

  useEffect(() => {
    const block = blockRef.current
    const mark = markRef.current
    const count = countRef.current
    if (!block || !mark || !count) return

    const finish = () => {
      if (done.current) return
      done.current = true
      setFinished(true)
      setPreloaderReady(true)
      onComplete()
    }

    if (prefersReducedMotion()) {
      gsap.set(count, { autoAlpha: 0 })
      gsap.set(block, { height: '0%' })
      gsap.set(mark, { visibility: 'visible', clipPath: 'inset(0% 0% 0% 0%)' })
      finish()
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(count, { visibility: 'visible' })
      gooText(count, 'reveal', 0)

      gsap.to(block, { height: '100%', duration: BLOCK_GROW_S, ease: 'InOut' })

      const counter = { value: 0 }
      gsap.to(counter, {
        value: 100,
        duration: COUNT_S,
        ease: 'InOut',
        onUpdate() {
          const line = count.querySelector('div') ?? count
          line.textContent = `${Math.round(counter.value)}%`
        },
        onComplete() {
          gooText(count, 'hide', 0)

          /**
           * The reference morphs its rectangle into a blob here. The ⌘ mark is
           * one path with five disjoint subpaths, which MorphSVG tears on, so
           * we keep the clip reveal and settle the mark with the site's own goo
           * blur instead — same duration and rhythm.
           * See docs/REFERENCE.md §12.
           */
          gsap.set(mark, { visibility: 'visible' })
          gsap
            .timeline()
            .to(block, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: DUR.m,
              ease: 'Out',
            })
            .to(
              mark,
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: DUR.m,
                ease: 'Out',
              },
              '<',
            )
            .fromTo(
              mark,
              { scale: 0.94, filter: 'blur(12px)', opacity: 0 },
              {
                scale: 1,
                filter: 'blur(0px)',
                opacity: 1,
                duration: DUR.l,
                ease: 'Out',
              },
              '<',
            )

          gsap.delayedCall(DUR.s + STAGGER * 0.5, finish)
        },
      })
    })

    return () => ctx.revert()
  }, [onComplete, setPreloaderReady])

  return (
    <>
      <div className={styles.progress} data-preloader="progress">
        {finished ? null : <div ref={blockRef} className={styles.block} />}
        <CommandMark ref={markRef} className={styles.mark} />
      </div>
      {finished ? null : (
        <div
          ref={countRef}
          className={`${styles.count} h1`}
          data-preloader="count"
        >
          <div>0%</div>
        </div>
      )}
    </>
  )
}
