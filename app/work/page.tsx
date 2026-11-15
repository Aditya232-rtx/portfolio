import { PROJECTS } from '@/content/site'
import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { WorkClient } from './WorkClient'
import styles from './Work.module.css'

export const metadata = pageMetadata(
  '/work',
  'Software & AI Projects',
  'Explore Aditya Jadhav’s software projects, including ThirdDoor, CrowdShield, and Ouroboros, spanning backend engineering, applied AI, and computer vision.',
)

export default function WorkPage() {
  return (
    <main>
      <WorkClient />
      <section className={styles.projects} aria-labelledby="project-list">
        <h2 className="h2" id="project-list">Selected projects</h2>
        <ul>
          {PROJECTS.map(({ id, name, blurb, role, href }) => (
            <li key={id}>
              <h3 className="p1"><Link href={`/work/${id}`}>{name}</Link></h3>
              <p className="p1">{blurb}</p>
              <p className="p1">Role: {role}</p>
              <Link className="p1" href={`/work/${id}`}>Project details</Link>
              {href && <a className="p1" href={href} target="_blank" rel="noreferrer">Visit {name} ↗</a>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
