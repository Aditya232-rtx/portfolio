'use client'

import { useState } from 'react'
import { Nav } from './Nav'
import { GridOverlay } from './GridOverlay'
import { Scrollbar } from './Scrollbar'
import { StickyName } from './StickyName'
import { ThemeWipe } from './ThemeWipe'

/**
 * Persistent chrome shared by every page: nav, dev grid, scrollbar, sticky name
 * and the theme wipe overlay.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const [gridVisible, setGridVisible] = useState(false)

  return (
    <>
      <GridOverlay visible={gridVisible} />
      <Nav onToggleGrid={() => setGridVisible((v) => !v)} />
      {children}
      <StickyName />
      <Scrollbar />
      <ThemeWipe />
    </>
  )
}
