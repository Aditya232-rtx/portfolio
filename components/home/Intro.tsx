'use client'

import { HERO_HEADINGS, IDENTITY } from '@/content/site'
import {
  THEME_MODES,
  useTheme,
  type ThemeMode,
} from '@/components/providers/ThemeProvider'
import { Preloader } from '@/components/shell/Preloader'
import styles from './Intro.module.css'

const THEME_LABELS: Record<ThemeMode, string> = {
  base: 'White',
  '1': 'Concrete',
  '2': 'Rust',
  '3': 'Verdigris',
  '4': 'Blood',
}

export function Intro({ onPreloaderDone }: { onPreloaderDone: () => void }) {
  const { mode, setMode } = useTheme()

  return (
    <section className={styles.intro}>
      <div className={styles.inner}>
        {/*
          Hairline segments — only on rows where column 3 is clear. In the
          reference these are literal `.spacer` elements with
          data-reveal="clip-down": each one grows top-down in step with the
          text beside it, rather than being present from the first frame.
        */}
        <div
          className={`${styles.rule} ${styles.ruleHero}`}
          data-reveal="clip-down"
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleGroupB}`}
          data-reveal="clip-down"
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleBio}`}
          data-reveal="clip-down"
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleStatement}`}
          data-reveal="clip-down"
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleOutro}`}
          data-reveal="clip-down"
          aria-hidden="true"
        />

        <Preloader onComplete={onPreloaderDone} />

        <div className={`${styles.meta}`}>
          <div className="p1" data-reveal="text">
            {IDENTITY.location}
          </div>
          <div className={styles.metaRow}>
            <span className="p1" data-reveal="text">
              {IDENTITY.workingWith.label}
            </span>
            <a
              className="p1"
              href={IDENTITY.workingWith.href}
              data-reveal="text"
            >
              {IDENTITY.workingWith.name}
            </a>
          </div>
        </div>

        <div className={`${styles.role} p1`} data-reveal="text">
          {IDENTITY.role[0]}
          <br />
          {IDENTITY.role[1]}
        </div>

        <div className={`${styles.name} ${styles.group}`}>
          {HERO_HEADINGS.name.map((line) => (
            <h1 key={line} className="h1" data-reveal="text">
              {line}
            </h1>
          ))}
        </div>

        <div className={`${styles.groupA} ${styles.group}`}>
          {HERO_HEADINGS.groups[0].map((line) => (
            <h1 key={line} className="h1" data-reveal="text">
              {line}
            </h1>
          ))}
        </div>

        <div className={`${styles.groupB} ${styles.group}`}>
          {HERO_HEADINGS.groups[1].map((line, i, all) => (
            <h1
              key={line}
              className={`h1 ${i === all.length - 1 ? styles.offsetLine : ''}`}
              data-reveal="text"
            >
              {line}
            </h1>
          ))}
        </div>

        <div className={styles.themeGrid}>
          {THEME_MODES.map((themeMode) => (
            <div key={themeMode} className={styles.themeSwitch} data-reveal="div">
              <button
                type="button"
                className={`${styles.themeDot} ${
                  mode === themeMode ? styles.themeDotActive : ''
                }`}
                onClick={(event) =>
                  setMode(themeMode, { x: event.clientX, y: event.clientY })
                }
                aria-label={`${THEME_LABELS[themeMode]} theme`}
                aria-pressed={mode === themeMode}
              />
            </div>
          ))}
        </div>

        <p className={`${styles.bio} p1`} data-reveal="text">
          {IDENTITY.bio.map((line, i) => (
            <span key={line}>
              {line}
              {i < IDENTITY.bio.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>

        <h2 className={`${styles.statementSolo1} h1`} data-reveal="text">
          {HERO_HEADINGS.statement.solo[0]}
        </h2>
        <h2 className={`${styles.statementSolo2} h1`} data-reveal="text">
          {HERO_HEADINGS.statement.solo[1]}
        </h2>

        <div className={`${styles.statementPair} ${styles.group}`}>
          {HERO_HEADINGS.statement.pair.map((line) => (
            <h2 key={line} className="h1" data-reveal="text">
              {line}
            </h2>
          ))}
        </div>

        <div className={`${styles.copyright} p1`} data-reveal="text">
          {IDENTITY.copyright}
        </div>
      </div>
    </section>
  )
}
