import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PROJECTS } from '@/content/site'
import { FULL_NAME, pageMetadata, SITE_ORIGIN } from '@/lib/seo'
import styles from './Project.module.css'

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

function getProject(slug: string) {
  return PROJECTS.find((project) => project.id === slug)
}

export function generateStaticParams() {
  return PROJECTS.map(({ id }) => ({ slug: id }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  const description = `${project.name}: ${project.focus}. ${project.blurb} Aditya Jadhav’s role: ${project.role}.`
  return pageMetadata(`/work/${project.id}`, `${project.name} — ${project.focus}`, description)
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const canonical = new URL(`/work/${project.id}`, SITE_ORIGIN).href
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${canonical}#project`,
    name: project.name,
    url: canonical,
    description: project.blurb,
    dateCreated: project.year,
    creator: {
      '@type': 'Person',
      name: FULL_NAME,
      url: SITE_ORIGIN,
    },
    keywords: project.tags,
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link><span aria-hidden="true"> / </span>
        <Link href="/work">Work</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{project.name}</span>
      </nav>
      <article>
        <p className={styles.eyebrow}>{project.year} · {project.kind} · {project.status}</p>
        <h1>{project.name}</h1>
        <p className={styles.lede}>{project.focus}: {project.blurb}</p>
        <p className={styles.role}>Aditya Jadhav · {project.role}</p>

        <section aria-labelledby="overview-heading" className={styles.section}>
          <h2 id="overview-heading">Project overview</h2>
          {project.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section aria-labelledby="technology-heading" className={styles.section}>
          <h2 id="technology-heading">Technologies and focus</h2>
          <p>{project.stack.join(' · ')}</p>
          <ul className={styles.tags}>
            {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </section>

        <nav aria-label="Project navigation" className={styles.links}>
          <Link href="/work">All projects</Link>
          {project.href && <a href={project.href} target="_blank" rel="noreferrer">Project site or source ↗</a>}
        </nav>
      </article>
    </main>
  )
}
