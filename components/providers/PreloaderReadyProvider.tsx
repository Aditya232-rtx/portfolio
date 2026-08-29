'use client'

import { createContext, useContext, useState } from 'react'

/**
 * Whether it's safe for persistent chrome (currently just the sticky name) to
 * reveal itself.
 *
 * Shell renders StickyName as a *sibling* of the page content, not a
 * descendant of it — so a page's own local "has the preloader finished"
 * state can't reach it by prop drilling. This tiny shared context is the
 * bridge instead.
 *
 * Defaults to true: most routes (currently /work) have no preloader at all,
 * and should show the sticky name immediately. Only a page that actually
 * mounts <Preloader> takes over the flag, flipping it false on mount and
 * true again once its own intro sequence hands off. See Preloader.tsx.
 */
const PreloaderReadyContext = createContext({
  ready: true,
  setReady: (_ready: boolean) => {},
})

export function PreloaderReadyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(true)
  return (
    <PreloaderReadyContext.Provider value={{ ready, setReady }}>
      {children}
    </PreloaderReadyContext.Provider>
  )
}

export function usePreloaderReady(): boolean {
  return useContext(PreloaderReadyContext).ready
}

export function useSetPreloaderReady(): (ready: boolean) => void {
  return useContext(PreloaderReadyContext).setReady
}
