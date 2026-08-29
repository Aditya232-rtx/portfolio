'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LENIS_OPTIONS, registerMotion } from '@/lib/motion/constants'

const LenisContext = createContext<Lenis | null>(null)

/** Access the shared Lenis instance. Null until mounted. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

const RESIZE_DEBOUNCE_MS = 40

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    registerMotion()

    const instance = new Lenis({ ...LENIS_OPTIONS, wrapper: window })
    /**
     * Publishing the instance costs one extra render at mount. Creating Lenis
     * during render instead would attach listeners as a render side effect and
     * leak a second instance under StrictMode's double-invoke, so the effect is
     * the correct place despite the lint rule's preference.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)

    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(() => ScrollTrigger.refresh(true), RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
