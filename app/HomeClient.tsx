'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Intro } from '@/components/home/Intro'
import { Featured } from '@/components/home/Featured'
import { Achievements } from '@/components/home/Achievements'
import { Footer } from '@/components/home/Footer'
import { registerMotion } from '@/lib/motion/constants'
import { initElementsReveal } from '@/lib/motion/reveal'
import { useLenis } from '@/components/providers/SmoothScrollProvider'

export function HomeClient() {
  const [ready, setReady] = useState(false)
  const lenis = useLenis()
  const cleanup = useRef<(() => void) | null>(null)

  // Hold the page still until the preloader hands off.
  useEffect(() => {
    if (!lenis) return
    if (ready) lenis.start()
    else lenis.stop()
  }, [lenis, ready])

  // Wire the scroll reveals once, after the preloader completes.
  useEffect(() => {
    if (!ready) return
    registerMotion()
    cleanup.current = initElementsReveal(document)
    return () => {
      cleanup.current?.()
      cleanup.current = null
    }
  }, [ready])

  const onPreloaderDone = useCallback(() => setReady(true), [])

  return (
    <main>
      <Intro onPreloaderDone={onPreloaderDone} />
      <Featured />
      <Achievements />
      <Footer />
    </main>
  )
}
