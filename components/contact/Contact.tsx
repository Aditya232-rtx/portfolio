'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { CONTACT, CONTACT_PAGE, SOCIALS } from '@/content/site'
import { SOCIAL_ICONS } from '@/components/icons'
import styles from './Contact.module.css'

type FieldKey = (typeof CONTACT_PAGE.form.fields)[number]['key']
type FormState = Record<FieldKey, string>

const EMPTY: FormState = CONTACT_PAGE.form.fields.reduce(
  (acc, f) => ({ ...acc, [f.key]: '' }),
  {} as FormState,
)

const MARQUEE_REPEAT = 12

function buildMailto(state: FormState): string {
  const lines = [
    `${CONTACT_PAGE.form.intro}`,
    '',
    `I'm ${state.name || '—'}.`,
    `You can reach me at ${state.email || '—'}.`,
    `I heard about you via ${state.source || '—'}.`,
    `I need help with ${state.need || '—'}.`,
    `Project: ${state.project || '—'}.`,
    '',
    "Let's talk.",
  ]
  const params = new URLSearchParams({
    subject: CONTACT.subject,
    body: lines.join('\n'),
  })
  return `mailto:${CONTACT.email}?${params.toString()}`
}

export function Contact() {
  const [state, setState] = useState<FormState>(EMPTY)
  const columns = CONTACT_PAGE.columns

  const marqueeItems = useMemo(
    () => Array.from({ length: MARQUEE_REPEAT }, (_, i) => i),
    [],
  )

  const onChange = (key: FieldKey, value: string) =>
    setState((prev) => ({ ...prev, [key]: value }))

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.location.href = buildMailto(state)
  }

  return (
    <section className={styles.page}>
      {/* ---- hero -------------------------------------------------------- */}
      <div className={styles.hero}>
        <p className={`${styles.eyebrow} p1`} data-reveal="text">
          {CONTACT_PAGE.tagline}
        </p>
        <div className={styles.heroLines}>
          {CONTACT_PAGE.hero.map((line, i) => (
            <h1
              key={line}
              className={`${styles.heroLine} h1`}
              data-reveal="text"
              style={{ marginLeft: `${i * 6}vw` }}
            >
              {line}
            </h1>
          ))}
        </div>
        <p className={`${styles.intro} p1`} data-reveal="text">
          {CONTACT_PAGE.intro}
        </p>
      </div>

      {/* ---- info columns ----------------------------------------------- */}
      <div className={styles.columns}>
        <div className={styles.col}>
          <span className={`${styles.colLabel} p1`} data-reveal="text">
            {columns.social.label}
          </span>
          <ul className={styles.colList} data-reveal="w">
            {columns.social.items.map((item) => (
              <li key={item.label} data-reveal="div">
                <a
                  className={`${styles.colLink} p1`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <span className={`${styles.colLabel} p1`} data-reveal="text">
            {columns.contacts.label}
          </span>
          <ul className={styles.colList} data-reveal="w">
            {columns.contacts.items.map((item) => (
              <li key={item.label} data-reveal="div">
                <a className={`${styles.colLink} p1`} href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <span className={`${styles.colLabel} p1`} data-reveal="text">
            {columns.location.label}
          </span>
          <ul className={styles.colList} data-reveal="w">
            {columns.location.lines.map((line) => (
              <li key={line} className={`${styles.colLine} p1`} data-reveal="div">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- big marquee ------------------------------------------------ */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((i) => (
            <span key={i} className={`${styles.marqueeItem} h1`}>
              {CONTACT_PAGE.marquee}
              <span className={styles.marqueeDot}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---- fill-in form ----------------------------------------------- */}
      <form className={styles.form} onSubmit={onSubmit}>
        <p className={`${styles.formIntro} h2`} data-reveal="text">
          {CONTACT_PAGE.form.intro}
        </p>

        <div className={styles.fields}>
          {CONTACT_PAGE.form.fields.map((field) => (
            <label key={field.key} className={styles.field} data-reveal="div">
              <span className={`${styles.fieldPrefix} h2`}>{field.prefix}</span>
              <input
                className={`${styles.fieldInput} h2`}
                name={field.key}
                type={field.key === 'email' ? 'email' : 'text'}
                autoComplete="off"
                placeholder={field.placeholder}
                value={state[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                required={field.key === 'name' || field.key === 'email'}
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          className={`${styles.submit} h1`}
          data-reveal="div"
        >
          {CONTACT_PAGE.form.submit}
          <span aria-hidden="true" className={styles.submitArrow}>
            →
          </span>
        </button>
      </form>

      {/* ---- bottom bar ------------------------------------------------- */}
      <div className={styles.bar}>
        <div className={styles.socials} data-reveal="w">
          {SOCIALS.map((social) => (
            <a
              key={social.name}
              className={styles.social}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.name}
              data-reveal="div"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {SOCIAL_ICONS[social.icon]}
              </svg>
            </a>
          ))}
        </div>
        <p className={`${styles.copy} p1`} data-reveal="text">
          Aditya Jadhav, 2026 — Built with care
        </p>
      </div>
    </section>
  )
}
