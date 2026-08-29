'use client'

import { useCallback, useEffect, useState } from 'react'
import { PROJECTS, type Project } from '@/content/site'
import { ProjectsMarquee } from '@/components/projects/ProjectsMarquee'
import { ProjectZoom } from '@/components/projects/ProjectZoom'

const TITLE = [
  'Learning to build',
  'systems that can',
  'run in production.',
] as const

export function WorkClient() {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)

  const open = useCallback((project: Project) => {
    const index = PROJECTS.findIndex((p) => p.id === project.id)
    if (index >= 0) setZoomIndex(index)
  }, [])

  const close = useCallback(() => setZoomIndex(null), [])

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (zoomIndex === null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [zoomIndex])

  return (
    <>
      <ProjectsMarquee
        projects={PROJECTS}
        title={TITLE}
        onOpen={open}
      />
      {zoomIndex !== null ? (
        <ProjectZoom
          projects={PROJECTS}
          index={zoomIndex}
          onIndexChange={setZoomIndex}
          onClose={close}
        />
      ) : null}
    </>
  )
}
