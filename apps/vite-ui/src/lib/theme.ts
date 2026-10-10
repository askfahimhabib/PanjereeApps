import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'lms_theme'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

export function isSystemDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return

  const isDark = mode === 'dark' || (mode === 'system' && isSystemDark())
  const root = document.documentElement

  if (isDark) {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }

  localStorage.setItem(THEME_STORAGE_KEY, mode)
  window.dispatchEvent(new CustomEvent('lms_theme_changed', { detail: { mode, isDark } }))
}

// Global initialization to run once at startup
export function initTheme() {
  if (typeof window === 'undefined') return

  const mode = getStoredTheme()
  applyTheme(mode)

  // Listen for system theme changes if in 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    const currentMode = getStoredTheme()
    if (currentMode === 'system') {
      applyTheme('system')
    }
  }

  try {
    mediaQuery.addEventListener('change', handleChange)
  } catch {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const current = getStoredTheme()
    return current === 'dark' || (current === 'system' && isSystemDark())
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ mode: ThemeMode; isDark: boolean }>
      if (custom.detail) {
        setThemeState(custom.detail.mode)
        setIsDark(custom.detail.isDark)
      }
    }

    window.addEventListener('lms_theme_changed', handler)
    return () => window.removeEventListener('lms_theme_changed', handler)
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    applyTheme(mode)
  }, [])

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark'
    setTheme(nextMode)
  }, [isDark, setTheme])

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
