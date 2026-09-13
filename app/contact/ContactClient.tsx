'use client'

import { useEffect, useRef } from 'react'
import { Contact } from '@/components/contact/Contact'
import { registerMotion } from '@/lib/motion/constants'
import { initElementsReveal } from '@/lib/motion/reveal'

export function ContactClient() {
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    registerMotion()
    cleanup.current = initElementsReveal(document)
    return () => {
      cleanup.current?.()
      cleanup.current = null
    }
  }, [])

  return (
    <main>
      <Contact />
    </main>
  )
}
