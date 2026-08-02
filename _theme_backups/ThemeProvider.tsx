'use client'
import { useEffect } from 'react'

const THEMES = {
  cyber: {
    '--bg-primary':    'linear-gradient(160deg,#080e1a,#0d1828,#091420)',
    '--bg-card':       'rgba(255,255,255,0.04)',
    '--border-card':   'rgba(255,255,255,0.09)',
    '--border-accent': 'rgba(0,200,184,0.30)',
    '--text-primary':  '#F2F8FC',
    '--text-secondary':'rgba(242,248,252,0.55)',
    '--text-muted':    'rgba(242,248,252,0.30)',
    '--accent':        '#00C8B8',
    '--accent-glow':   'rgba(0,200,184,0.18)',
    '--aurora':        'radial-gradient(ellipse at 50% 0%,rgba(0,200,184,0.10),rgba(26,140,255,0.06) 50%,transparent 75%)',
    '--nav-bg':        'rgba(255,255,255,0.04)',
    '--tab-active':    'rgba(0,200,184,0.14)',
    '--tab-text':      '#00C8B8',
    '--shadow':        '0 8px 40px rgba(0,0,0,0.40)',
  },
  hospital: {
    '--bg-primary':    'linear-gradient(160deg,#E8F4F8,#F2F8FC,#EAF4F8)',
    '--bg-card':       'rgba(255,255,255,0.82)',
    '--border-card':   'rgba(0,100,130,0.12)',
    '--border-accent': 'rgba(0,122,110,0.35)',
    '--text-primary':  '#071828',
    '--text-secondary':'rgba(7,24,40,0.65)',
    '--text-muted':    'rgba(7,24,40,0.40)',
    '--accent':        '#007A6E',
    '--accent-glow':   'rgba(0,122,110,0.15)',
    '--aurora':        'radial-gradient(ellipse at 50% 0%,rgba(0,122,110,0.07),rgba(0,90,150,0.04) 50%,transparent 75%)',
    '--nav-bg':        'rgba(230,244,250,0.80)',
    '--tab-active':    'rgba(0,122,110,0.14)',
    '--tab-text':      '#007A6E',
    '--shadow':        '0 8px 40px rgba(0,60,100,0.12)',
  },
  ambient: {
    '--bg-primary':    'linear-gradient(160deg,#0c1424,#111e35,#0e1a2d)',
    '--bg-card':       'rgba(255,255,255,0.05)',
    '--border-card':   'rgba(191,90,242,0.12)',
    '--border-accent': 'rgba(191,90,242,0.35)',
    '--text-primary':  '#F5F0FF',
    '--text-secondary':'rgba(245,240,255,0.55)',
    '--text-muted':    'rgba(245,240,255,0.30)',
    '--accent':        '#BF5AF2',
    '--accent-glow':   'rgba(191,90,242,0.18)',
    '--aurora':        'radial-gradient(ellipse at 30% 0%,rgba(191,90,242,0.10),rgba(255,159,10,0.05) 50%,transparent 75%)',
    '--nav-bg':        'rgba(255,255,255,0.04)',
    '--tab-active':    'rgba(191,90,242,0.14)',
    '--tab-text':      '#BF5AF2',
    '--shadow':        '0 8px 40px rgba(80,0,120,0.30)',
  },
}

export function applyThemeVars(id: string) {
  const vars = THEMES[id as keyof typeof THEMES] || THEMES.cyber
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  document.body.setAttribute('data-theme', id)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('cliniverse-theme-v2') || 'cyber'
    applyThemeVars(saved)

    // Listen for theme changes from ProfilePage
    const handler = (e: CustomEvent) => applyThemeVars(e.detail)
    window.addEventListener('cliniverse-theme-change', handler as EventListener)
    return () => window.removeEventListener('cliniverse-theme-change', handler as EventListener)
  }, [])
  return <>{children}</>
}
