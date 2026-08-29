'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { Project } from '@/content/site'
import styles from './ProjectZoom.module.css'

type Props = {
  projects: readonly Project[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export function ProjectZoom({ projects, index, onIndexChange, onClose }: Props) {
  const project = projects[index]
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const step = useCallback(
    (delta: number) => {
      const next = (index + delta + projects.length) % projects.length
      onIndexChange(next)
    },
    [index, projects.length, onIndexChange],
  )

  // Escape closes; arrows step. Focus moves into the overlay on open.
  useEffect(() => {
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, step])

  if (!project) return null

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} — project detail`}
    >
      <div className={styles.header}>
        <button
          ref={closeRef}
          type="button"
          className={styles.back}
          onClick={onClose}
          aria-label="Close project detail"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 L8 12 L15 19" />
          </svg>
        </button>
        <span className={styles.headerMeta}>
          {project.year} — {project.role}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.tags}>{project.tags.join(' / ')}</div>
        <h2 className={styles.name}>{project.name}</h2>

        <div className={styles.body}>
          {project.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Role</dt>
            <dd className={styles.metaValue}>{project.role}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Type</dt>
            <dd className={styles.metaValue}>
              {project.kind === 'product'
                ? project.status === 'building'
                  ? 'Product — in development'
                  : 'Product'
                : 'Learning project'}
            </dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Stack</dt>
            <dd className={styles.metaValue}>{project.stack.join(', ')}</dd>
          </div>
          {project.href ? (
            <div className={styles.metaItem}>
              <dt className={styles.metaLabel}>Live</dt>
              <dd className={styles.metaValue}>
                <a href={project.href} target="_blank" rel="noreferrer noopener">
                  {project.href.replace(/^https?:\/\//, '')} ↗
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className={styles.media}>
        {project.video ? (
          <video poster={project.poster} muted loop autoPlay playsInline>
            {project.video.webm ? (
              <source src={project.video.webm} type="video/webm" />
            ) : null}
            <source src={project.video.mp4} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.poster} alt={`${project.name} preview`} />
        )}
      </div>

      <ul className={styles.map}>
        {projects.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`${styles.mapDot} ${i === index ? styles.mapDotActive : ''}`}
              onClick={() => onIndexChange(i)}
              aria-label={`Go to ${p.name}`}
              aria-current={i === index}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
