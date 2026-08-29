'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { NAV_LINKS, NAV_SECONDARY } from '@/content/site'
import { DUR, STAGGER } from '@/lib/motion/constants'
import styles from './Nav.module.css'

const CLOSED_CLIP = 'inset(0% 0% 100% 0%)'
const OPEN_CLIP = 'inset(0% 0% 0% 0%)'
/** Scrolling this far with the menu open dismisses it. */
const SCROLL_DISMISS_PX = 10

export function Nav({ onToggleGrid }: { onToggleGrid: () => void }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelsRef = useRef<HTMLDivElement>(null)
  const archiveRef = useRef<HTMLAnchorElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const animate = useCallback((next: boolean) => {
    const panels = panelsRef.current?.querySelectorAll(`.${styles.link}`)
    const archive = archiveRef.current
    if (!panels?.length) return

    timeline.current?.kill()
    const tl = gsap.timeline()
    timeline.current = tl

    if (next) {
      tl.to(panels, {
        clipPath: OPEN_CLIP,
        duration: DUR.m,
        ease: 'Out',
        overwrite: 'auto',
        // Rightmost panel leads.
        stagger: { amount: STAGGER * panels.length, from: 'end' },
      })
      if (archive) {
        tl.to(
          archive,
          { yPercent: 0, duration: DUR.m, ease: 'Out', overwrite: 'auto' },
          `-=${DUR.m * 0.5}`,
        )
      }
      return
    }

    if (archive) {
      tl.to(archive, { yPercent: 100, duration: DUR.s, ease: 'In' }, 0)
    }
    tl.to(
      panels,
      {
        clipPath: CLOSED_CLIP,
        duration: DUR.s,
        ease: 'In',
        stagger: { each: STAGGER, from: 'start' },
      },
      0,
    )
  }, [])

  const toggle = useCallback(() => {
    setOpen((current) => {
      animate(!current)
      return !current
    })
  }, [animate])

  // Any meaningful scroll closes the menu.
  useEffect(() => {
    if (!open) return
    const start = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - start) > SCROLL_DISMISS_PX) {
        setOpen(false)
        animate(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open, animate])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        animate(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, animate])

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.gridToggle}
          onClick={onToggleGrid}
          aria-label="Toggle layout grid"
        />

        <button
          type="button"
          className={`${styles.button} p1`}
          onClick={toggle}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <div
          id="nav-menu"
          ref={panelsRef}
          className={styles.menu}
          aria-hidden={!open}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
              tabIndex={open ? 0 : -1}
            >
              <span
                className={`${styles.indicator} ${
                  isCurrent(link.href) ? styles.indicatorCurrent : ''
                } p1`}
              >
                {link.index}
              </span>
              <span className={`${styles.linkLabel} h2`}>{link.label}</span>
            </Link>
          ))}
        </div>

        <Link
          ref={archiveRef}
          href={NAV_SECONDARY.href}
          className={`${styles.archive} p1`}
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
        >
          {NAV_SECONDARY.label}
        </Link>
      </div>
    </nav>
  )
}
