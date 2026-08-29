'use client'

import styles from './GridOverlay.module.css'

/** The 8-column debug grid, toggled by the 16×16 square in the nav. */
export function GridOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.grid}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={styles.column} />
        ))}
      </div>
    </div>
  )
}
