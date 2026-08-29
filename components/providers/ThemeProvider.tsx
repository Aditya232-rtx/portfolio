'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Five themes, switched by a class on <body>. Content stays black in every mode;
 * only the page background changes. Persisted to sessionStorage so the choice
 * survives navigation — the reference does the same.
 * See docs/REFERENCE.md §4.
 */

export const THEME_MODES = ['base', '1', '3', '2', '4'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

/** Background colour per mode, used by the liquid wipe. */
export const THEME_COLORS: Record<ThemeMode, string> = {
  base: '#ffffff',
  '1': '#bec1ca',
  '2': '#ff633d',
  '3': '#919e44',
  '4': '#c31f26',
}

const STORAGE_KEY = 'theme-mode'
const DEFAULT_MODE: ThemeMode = 'base'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode, origin?: { x: number; y: number }) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: DEFAULT_MODE,
  setMode: () => {},
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && (THEME_MODES as readonly string[]).includes(value)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE)

  /**
   * Restore the stored choice after hydration. Reading sessionStorage during
   * render would desync server and client markup, so the one extra render this
   * costs is the price of hydration safety.
   */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isThemeMode(stored)) setModeState(stored)
    } catch {
      /* sessionStorage unavailable (private mode) — keep the default. */
    }
  }, [])

  useEffect(() => {
    const body = document.body
    THEME_MODES.forEach((m) => body.classList.remove(`theme-${m}`))
    body.classList.add(`theme-${mode}`)
  }, [mode])

  const setMode = useCallback(
    (next: ThemeMode, origin?: { x: number; y: number }) => {
      setModeState((current) => {
        if (current === next) return current
        // The wipe paints the *outgoing* colour outward from the click point.
        window.dispatchEvent(
          new CustomEvent('theme:wipe', {
            detail: { from: THEME_COLORS[current], origin },
          }),
        )
        try {
          sessionStorage.setItem(STORAGE_KEY, next)
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [],
  )

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
