'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { Project } from '@/content/site'
import styles from './ProjectsMarquee.module.css'

/** Copies of the project list rendered into the track. Must be even so the
 *  -50% keyframe lands on an exact repeat boundary. */
const SET_COPIES = 6

/**
 * Seconds for one full loop. hirotos.com runs this at 38s; slowed here on
 * purpose so the cards are easier to read as they pass.
 */
const LOOP_SECONDS = 58

type Props = {
  projects: readonly Project[]
  kicker?: string
  title: readonly string[]
  onOpen: (project: Project) => void
}

export function ProjectsMarquee({ projects, kicker = 'Projects', title, onOpen }: Props) {
  const [active, setActive] = useState<Project | null>(null)
  const pillRef = useRef<HTMLDivElement>(null)

  const sets = useMemo(
    () => Array.from({ length: SET_COPIES }, (_, i) => i),
    [],
  )

  // The pill trails the pointer. We write transform directly rather than going
  // through state so it never re-renders the marquee.
  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const pill = pillRef.current
    if (!pill) return
    pill.style.transform = `translate3d(${event.clientX + 16}px, ${event.clientY + 16}px, 0)`
  }, [])

  return (
    <section className={styles.section} onPointerMove={onPointerMove}>
      <div />

      <div className={styles.intro}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 className={styles.title}>
          {title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
      </div>

      <div className={styles.gallery}>
        <div className={styles.marquee}>
          <div
            className={styles.track}
            style={{ '--marquee-duration': `${LOOP_SECONDS}s` } as React.CSSProperties}
          >
            {sets.map((setIndex) => (
              <div className={styles.set} key={setIndex} aria-hidden={setIndex > 0}>
                {projects.map((project) => (
                  <ProjectCard
                    key={`${setIndex}-${project.id}`}
                    project={project}
                    duplicate={setIndex > 0}
                    onEnter={() => setActive(project)}
                    onLeave={() => setActive((c) => (c === project ? null : c))}
                    onOpen={() => onOpen(project)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.label}>
        <div className={styles.labelInner} data-visible={active !== null}>
          <div className={styles.labelTags}>
            {(active?.tags ?? [' ']).join(' / ')}
          </div>
          <div className={styles.labelName}>{active?.name ?? ' '}</div>
        </div>
      </div>

      <div ref={pillRef} className={styles.pill} data-visible={active !== null}>
        View project →
      </div>
    </section>
  )
}

type CardProps = {
  project: Project
  /** Duplicated sets exist only to make the loop seamless; hide them from AT. */
  duplicate: boolean
  onEnter: () => void
  onLeave: () => void
  onOpen: () => void
}

function ProjectCard({ project, duplicate, onEnter, onLeave, onOpen }: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleEnter = () => {
    onEnter()
    const video = videoRef.current
    if (!video) return
    /**
     * preload="none" is deliberate: 6 projects × 6 duplicated sets is 36 video
     * elements, and even "metadata" fires 36 range requests on page load. The
     * cost is that nothing is buffered on first hover, so kick off the load
     * here. A rejected play() just leaves the poster showing, which is fine.
     */
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load()
    void video.play().catch(() => {})
  }

  const handleLeave = () => {
    onLeave()
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <button
      type="button"
      className={`${styles.item} ${styles[project.shape]}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onClick={onOpen}
      tabIndex={duplicate ? -1 : 0}
      aria-hidden={duplicate}
      aria-label={`${project.name} — ${project.tags.join(', ')}`}
    >
      <span className={styles.card}>
        <figure className={styles.figure} data-project-id={project.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.poster} alt="" draggable={false} loading="lazy" decoding="async" />
          {project.video ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              data-ready="true"
              aria-hidden="true"
            >
              {project.video.webm ? (
                <source src={project.video.webm} type="video/webm" />
              ) : null}
              <source src={project.video.mp4} type="video/mp4" />
            </video>
          ) : null}
          {project.kind === 'product' ? (
            <span className={styles.status}>
              {project.status === 'building' ? 'Product · building' : 'Product'}
            </span>
          ) : null}
        </figure>
      </span>
    </button>
  )
}
