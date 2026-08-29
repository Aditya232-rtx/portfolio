'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FEATURED } from '@/content/site'
import { registerMotion } from '@/lib/motion/constants'
import { Globe } from './Globe'
import styles from './Featured.module.css'

/**
 * "Work 24-26" framing the project globe.
 *
 * Ported from the reference's `initFeaturedHeadingWidth`, read out of its own
 * bundle rather than guessed at:
 *
 *   const natural = heading.scrollWidth
 *   const full    = heading.parentElement.offsetWidth
 *   gsap.set(heading, { width: natural })
 *   gsap.timeline({ scrollTrigger: {
 *         trigger: globe, start: 'top 75%', end: 'bottom 25%', scrub: true,
 *         onUpdate(self) { …swap at progress >= 0.99… } } })
 *     .to(heading, { width: full,    ease: 'none' })
 *     .to(heading, { width: natural, ease: 'none' })
 *
 * Three things fall out of that which earlier attempts here got wrong:
 *
 * 1. It animates WIDTH, not gap or per-word transforms. The heading is
 *    `justify-content: space-between`, so growing the box is what pushes the
 *    two words apart — and it's why they track the container edges exactly.
 * 2. The words spread apart and then come back TOGETHER. It's a there-and-back
 *    timeline, not a one-way spread.
 * 3. "All Works" is not present on arrival. At the very end of the scrub
 *    (progress ≥ 0.99) the two words are hidden and the link is swapped in,
 *    with the container flipping to a centred column.
 *
 * The trigger is the GLOBE, not the section.
 */

/** Progress at which the words swap out for the "All Works" link. */
const SWAP_PROGRESS = 0.99

export function Featured() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    registerMotion()

    const heading = section.querySelector<HTMLElement>(`.${styles.heading}`)
    const globe = section.querySelector<HTMLElement>(`.${styles.globe}`)
    const linkWrap = section.querySelector<HTMLElement>(`.${styles.linkWrap}`)
    if (!heading || !globe || !linkWrap) return

    const words = Array.from(
      heading.querySelectorAll<HTMLElement>(`.${styles.word}`),
    )

    const mm = gsap.matchMedia()

    mm.add('(min-width: 992px)', () => {
      const natural = heading.scrollWidth
      const full = heading.parentElement?.offsetWidth ?? natural

      gsap.set(heading, { width: natural })

      const showWords = () => {
        words.forEach((w) => {
          w.style.display = ''
        })
        linkWrap.style.display = 'none'
        heading.style.flexDirection = ''
        heading.style.alignItems = ''
        heading.style.justifyContent = 'space-between'
      }

      const showLink = () => {
        words.forEach((w) => {
          w.style.display = 'none'
        })
        linkWrap.style.display = 'block'
        heading.style.flexDirection = 'column'
        heading.style.alignItems = 'center'
        heading.style.justifyContent = 'center'
      }

      showWords()

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: globe,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: true,
          onUpdate: (self) => {
            if (self.progress >= SWAP_PROGRESS) showLink()
            else showWords()
          },
        },
      })

      timeline
        .to(heading, { width: full, ease: 'none' })
        .to(heading, { width: natural, ease: 'none' })

      ScrollTrigger.refresh()

      return () => {
        timeline.kill()
        showWords()
        gsap.set(heading, { clearProps: 'width' })
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <span className={`${styles.word} h1`} data-reveal="text">
            {FEATURED.title[0]}
          </span>
          <span className={`${styles.word} h1`} data-reveal="text">
            {FEATURED.title[1]}
          </span>

          {/* Swapped in for the words at the end of the scrub. */}
          <div className={styles.linkWrap}>
            <Link href="/work" className={`${styles.link} h1`}>
              {FEATURED.allWorksLabel}
            </Link>
          </div>
        </div>

        <Globe className={styles.globe} />
      </div>
    </section>
  )
}
