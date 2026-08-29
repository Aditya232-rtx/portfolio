import { ACHIEVEMENTS, type AchievementSection } from '@/content/site'
import styles from './Achievements.module.css'

/**
 * Achievements, education and interests, rendered in the reference's awards
 * table: a staggered heading, then rows of year / context / org / result that
 * fill on hover.
 */
export function Achievements() {
  return (
    <>
      {ACHIEVEMENTS.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </>
  )
}

function Section({ section }: { section: AchievementSection }) {
  return (
    <section className={styles.section} aria-labelledby={`${section.id}-heading`}>
      <div className={styles.inner}>
        <div className={styles.headingWrap} id={`${section.id}-heading`}>
          {section.heading.map((line) => (
            <h2
              key={line}
              className={`${styles.headingLine} h1`}
              data-reveal="text"
            >
              {line}
            </h2>
          ))}
        </div>

        <div className={styles.table}>
          {section.groups.map((group) => (
            <div className={styles.group} key={`${group.year}-${group.context}`}>
              {/* Rows can legitimately repeat (two identical hackathon wins),
                  so the index is part of the key. */}
              {group.rows.map((row, rowIndex) => (
                <div
                  className={styles.row}
                  key={`${row.org}-${row.result}-${rowIndex}`}
                  data-reveal="div"
                >
                  {/* Year and context appear once, on the group's first row. */}
                  <div className={`${styles.cell} ${styles.year} p1`}>
                    {rowIndex === 0 ? group.year : ''}
                  </div>
                  <div className={`${styles.cell} ${styles.context} p1`}>
                    {rowIndex === 0 ? group.context : ''}
                  </div>
                  <div className={`${styles.cell} ${styles.org} p1`}>
                    {row.org}
                  </div>
                  <div className={`${styles.cell} ${styles.result} p1`}>
                    {row.result}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
