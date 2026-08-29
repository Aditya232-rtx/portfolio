'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLenis } from '@/components/providers/SmoothScrollProvider'
import styles from './Scrollbar.module.css'

/** Idle time before the bar fades out. */
const IDLE_HIDE_MS = 1000
const FADE_S = 0.3

export function Scrollbar() {
  const lenis = useLenis()
  const wrapRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const thumb = thumbRef.current
    if (!wrap || !thumb || !lenis) return

    let hideTimer: ReturnType<typeof setTimeout> | null = null
    let hidden = true
    let grabOffset = 0

    const setHidden = (next: boolean) => {
      if (hidden === next) return
      hidden = next
      gsap.to(wrap, {
        autoAlpha: next ? 0 : 1,
        duration: FADE_S,
        overwrite: 'auto',
      })
    }

    const scheduleHide = () => {
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        if (!dragRef.current) setHidden(true)
      }, IDLE_HIDE_MS)
    }

    const travel = () => wrap.clientHeight - thumb.offsetHeight

    const sync = () => {
      if (lenis.limit <= 0) return
      const progress = gsap.utils.clamp(0, 1, lenis.scroll / lenis.limit)
      gsap.set(thumb, { y: progress * travel() })
    }

    const onScroll = () => {
      if (lenis.limit <= 0) {
        setHidden(true)
        return
      }
      setHidden(false)
      scheduleHide()
      if (!dragRef.current) sync()
    }

    const dragRef = { current: false }

    const onPointerDown = (event: PointerEvent) => {
      dragRef.current = true
      setDragging(true)
      thumb.setPointerCapture(event.pointerId)
      grabOffset = event.clientY - thumb.getBoundingClientRect().top
      if (hideTimer) clearTimeout(hideTimer)
      setHidden(false)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return
      const bounds = wrap.getBoundingClientRect()
      const y = gsap.utils.clamp(
        0,
        travel(),
        event.clientY - bounds.top - grabOffset,
      )
      gsap.set(thumb, { y })
      const progress = travel() > 0 ? y / travel() : 0
      lenis.scrollTo(progress * lenis.limit, { immediate: true })
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragRef.current) return
      dragRef.current = false
      setDragging(false)
      thumb.releasePointerCapture(event.pointerId)
      scheduleHide()
    }

    lenis.on('scroll', onScroll)
    thumb.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    sync()
    scheduleHide()

    return () => {
      lenis.off('scroll', onScroll)
      thumb.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [lenis])

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      <div
        ref={thumbRef}
        className={styles.thumb}
        data-dragging={dragging || undefined}
      />
    </div>
  )
}
