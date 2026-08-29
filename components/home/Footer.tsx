'use client'

import { useEffect, useState } from 'react'
import { CONTACT, FOOTER_QUOTE, SOCIALS } from '@/content/site'
import { CommandMark, SOCIAL_ICONS } from '@/components/icons'
import styles from './Footer.module.css'

const CLOCK_TICK_MS = 1000

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Local wall-clock time. Renders "00" on the server so hydration is stable. */
function useClock() {
  const [time, setTime] = useState({ hours: '00', minutes: '00' })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime({ hours: pad(now.getHours()), minutes: pad(now.getMinutes()) })
    }
    update()
    const id = setInterval(update, CLOCK_TICK_MS)
    return () => clearInterval(id)
  }, [])

  return time
}

const MAILTO = (() => {
  const params = new URLSearchParams({ subject: CONTACT.subject })
  return `mailto:${CONTACT.email}?${params.toString()}`
})()

export function Footer() {
  const { hours, minutes } = useClock()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={`${styles.quoteA} ${styles.group}`}>
          {FOOTER_QUOTE.left[0].map((line) => (
            <h2 key={line} className="h1" data-reveal="text">
              {line}
            </h2>
          ))}
        </div>

        <div className={`${styles.quoteB} ${styles.group}`}>
          {FOOTER_QUOTE.left[1].map((line) => (
            <h2 key={line} className="h1" data-reveal="text">
              {line}
            </h2>
          ))}
        </div>

        <div className={styles.time}>
          <span className={`${styles.paren} h1`} aria-hidden="true">
            (
          </span>
          <span className={`${styles.hours} h1`}>{hours}</span>
          <span className={`${styles.colonA} h1`} aria-hidden="true">
            :
          </span>
          <div className={styles.markCell} data-reveal="clip-down">
            <CommandMark />
          </div>
          <span className={`${styles.colonB} h1`} aria-hidden="true">
            :
          </span>
          <span className={`${styles.minutes} h1`}>{minutes}</span>
          <span className="h1" aria-hidden="true">
            )
          </span>
        </div>

        <div className={`${styles.quoteC} ${styles.group}`}>
          {FOOTER_QUOTE.right[0].map((line) => (
            <h2 key={line} className="h1" data-reveal="text">
              {line}
            </h2>
          ))}
        </div>

        <div className={`${styles.quoteD} ${styles.group}`}>
          {FOOTER_QUOTE.right[1].map((line) => (
            <h2 key={line} className="h1" data-reveal="text">
              {line}
            </h2>
          ))}
        </div>

        <div className={styles.mail}>
          <p className="p1" data-reveal="text">
            {CONTACT.availability[0]}
            <br />
            {CONTACT.availability[1]}
          </p>
          <div className={`${styles.prompt} p1`} data-reveal="div">
            {CONTACT.prompt}
          </div>
          <a className={`${styles.mailLink} p1`} href={MAILTO} data-reveal="div">
            {CONTACT.email}
          </a>
        </div>

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
      </div>
    </footer>
  )
}
