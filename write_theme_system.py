#!/usr/bin/env python3
"""
write_theme_system.py — Cliniverse AI
══════════════════════════════════════════════════════════════════
الحل النهائي: نظام ثيمين عبر React Context
يصل لكل مكون مباشرة — بدون CSS variables

الثيمان:
  🌊 Ocean  — أبيض زجاجي Apple-style
  🌙 Midnight — داكن عميق ECGs واضحة
══════════════════════════════════════════════════════════════════
"""

from pathlib import Path
import shutil

PROJECT = Path('/Users/macbook/cliniverse-ai')
COMP    = PROJECT / 'app' / 'components'
BACKUP  = PROJECT / '_theme_backups'
BACKUP.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────
# 1. ClinicalTheme.tsx — Context + 2 themes
# ─────────────────────────────────────────────────────────────────
THEME_CONTEXT = r"""'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// ── THEME DEFINITIONS ────────────────────────────────────────────
export const OCEAN = {
  id: 'ocean',
  name: '🌊 Ocean',
  // Backgrounds
  bg:         '#EEF6FF',
  bgCard:     'rgba(255,255,255,0.80)',
  bgCardSolid:'#FFFFFF',
  bgElevated: 'rgba(255,255,255,0.95)',
  bgDeep:     '#E0EEFA',
  bgHero:     'linear-gradient(135deg,rgba(0,184,169,0.10),rgba(10,132,255,0.08))',
  bgInput:    'rgba(255,255,255,0.70)',
  bgBadge:    'rgba(10,132,255,0.08)',
  // Text
  text:       '#0A1F3C',
  textSub:    'rgba(10,31,60,0.65)',
  textMuted:  'rgba(10,31,60,0.40)',
  textInverse:'#FFFFFF',
  // Borders
  border:     'rgba(10,132,255,0.12)',
  borderCard: 'rgba(10,132,255,0.10)',
  // Accents
  accent:     '#00B8A9',
  accentBlue: '#0A84FF',
  accentCoral:'#FF6B6B',
  accentAmber:'#FFB347',
  accentMint: '#30D158',
  accentViolet:'#7C5CFC',
  // Vitals
  vitalCrit:  '#E53E3E',
  vitalCritBg:'rgba(255,107,107,0.10)',
  vitalCritBorder:'rgba(255,107,107,0.30)',
  vitalNorm:  '#1A7F37',
  vitalNormBg:'rgba(48,209,88,0.08)',
  // Nav
  navBg:      'rgba(255,255,255,0.90)',
  navBorder:  'rgba(10,132,255,0.10)',
  navActive:  '#0A84FF',
  navInactive:'rgba(10,31,60,0.35)',
  // ECG
  ecgLine:    '#00B8A9',
  ecgBg:      'rgba(0,184,169,0.06)',
  ecgBorder:  'rgba(0,184,169,0.20)',
  // Cards
  glass: {
    background:           'rgba(255,255,255,0.80)',
    backdropFilter:       'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius:         20,
    border:               '1px solid rgba(10,132,255,0.10)',
    boxShadow:            '0 4px 24px rgba(10,132,255,0.08), 0 1px 4px rgba(0,0,0,0.04)',
  },
  // Shadows
  shadow:    '0 2px 20px rgba(10,132,255,0.08)',
  shadowMd:  '0 8px 32px rgba(10,132,255,0.12)',
  shadowLg:  '0 20px 60px rgba(10,132,255,0.18)',
  // Dark flag
  isDark: false,
}

export const MIDNIGHT = {
  id: 'midnight',
  name: '🌙 Midnight',
  // Backgrounds
  bg:         '#050E1F',
  bgCard:     'rgba(255,255,255,0.05)',
  bgCardSolid:'#0D1A30',
  bgElevated: 'rgba(255,255,255,0.08)',
  bgDeep:     '#020810',
  bgHero:     'linear-gradient(135deg,rgba(0,184,169,0.15),rgba(10,132,255,0.10))',
  bgInput:    'rgba(255,255,255,0.07)',
  bgBadge:    'rgba(0,184,169,0.12)',
  // Text
  text:       '#E8F4FF',
  textSub:    'rgba(232,244,255,0.65)',
  textMuted:  'rgba(232,244,255,0.38)',
  textInverse:'#050E1F',
  // Borders
  border:     'rgba(0,184,169,0.15)',
  borderCard: 'rgba(255,255,255,0.08)',
  // Accents
  accent:     '#00C8B8',
  accentBlue: '#1A8CFF',
  accentCoral:'#FF6B6B',
  accentAmber:'#FFB347',
  accentMint: '#30D158',
  accentViolet:'#BF5AF2',
  // Vitals
  vitalCrit:  '#FF453A',
  vitalCritBg:'rgba(255,69,58,0.12)',
  vitalCritBorder:'rgba(255,69,58,0.35)',
  vitalNorm:  '#30D158',
  vitalNormBg:'rgba(48,209,88,0.10)',
  // Nav
  navBg:      'rgba(5,14,31,0.95)',
  navBorder:  'rgba(0,200,184,0.20)',
  navActive:  '#00C8B8',
  navInactive:'rgba(232,244,255,0.35)',
  // ECG
  ecgLine:    '#00C8B8',
  ecgBg:      'rgba(0,200,184,0.08)',
  ecgBorder:  'rgba(0,200,184,0.25)',
  // Cards
  glass: {
    background:           'rgba(255,255,255,0.05)',
    backdropFilter:       'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius:         20,
    border:               '1px solid rgba(255,255,255,0.08)',
    boxShadow:            '0 4px 24px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.20)',
  },
  // Shadows
  shadow:    '0 2px 20px rgba(0,0,0,0.30)',
  shadowMd:  '0 8px 32px rgba(0,0,0,0.40)',
  shadowLg:  '0 20px 60px rgba(0,0,0,0.50)',
  // Dark flag
  isDark: true,
}

export type Theme = typeof OCEAN
export type ThemeId = 'ocean' | 'midnight'

// ── CONTEXT ─────────────────────────────────────────────────────
const ThemeCtx = createContext<{
  T: Theme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
  toggle: () => void
}>({
  T: OCEAN,
  themeId: 'ocean',
  setTheme: () => {},
  toggle: () => {},
})

export function useTheme() { return useContext(ThemeCtx) }

// ── PROVIDER ─────────────────────────────────────────────────────
export function ClinicalThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('ocean')

  useEffect(() => {
    const saved = localStorage.getItem('cliniverse-theme-v2') as ThemeId
    if (saved === 'ocean' || saved === 'midnight') {
      setThemeId(saved)
    }
  }, [])

  const setTheme = (id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem('cliniverse-theme-v2', id)
    // Also update DOM for any CSS that reads data-theme
    document.documentElement.setAttribute('data-theme', id)
    document.documentElement.setAttribute('data-mode', id === 'midnight' ? 'dark' : 'light')
  }

  const toggle = () => setTheme(themeId === 'ocean' ? 'midnight' : 'ocean')

  const T = themeId === 'midnight' ? MIDNIGHT : OCEAN

  // Sync DOM on mount and theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    document.documentElement.setAttribute('data-mode', themeId === 'midnight' ? 'dark' : 'light')
    document.body.style.background = T.bg
    document.body.style.color = T.text
  }, [themeId, T])

  return (
    <ThemeCtx.Provider value={{ T, themeId, setTheme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

// ── THEME TOGGLE BUTTON (mini) ───────────────────────────────────
export function ThemeToggleBtn() {
  const { themeId, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      style={{
        background: themeId === 'ocean' ? 'rgba(10,132,255,0.10)' : 'rgba(0,200,184,0.10)',
        border: themeId === 'ocean' ? '1px solid rgba(10,132,255,0.20)' : '1px solid rgba(0,200,184,0.20)',
        borderRadius: 12,
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 700,
        color: themeId === 'ocean' ? '#0A84FF' : '#00C8B8',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {themeId === 'ocean' ? '🌙 Midnight' : '🌊 Ocean'}
    </button>
  )
}
"""

# ─────────────────────────────────────────────────────────────────
# 2. Updated ThemeProvider.tsx — wraps ClinicalThemeProvider
# ─────────────────────────────────────────────────────────────────
THEME_PROVIDER = r"""'use client'
import { ClinicalThemeProvider } from './ClinicalTheme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClinicalThemeProvider>
      {children}
    </ClinicalThemeProvider>
  )
}
"""

# ─────────────────────────────────────────────────────────────────
# 3. Updated globals.css bridge
# ─────────────────────────────────────────────────────────────────
GLOBALS_ADDITION = """
/* ══ OCEAN THEME ══ */
[data-theme='ocean'], [data-mode='light'] {
  --bg-base:        #EEF6FF;
  --bg-card:        rgba(255,255,255,0.80);
  --bg-elevated:    #FFFFFF;
  --text-primary:   #0A1F3C;
  --text-secondary: rgba(10,31,60,0.65);
  --text-muted:     rgba(10,31,60,0.40);
  --border-card:    rgba(10,132,255,0.10);
  --accent:         #00B8A9;
}

/* ══ MIDNIGHT THEME ══ */
[data-theme='midnight'], [data-mode='dark'] {
  --bg-base:        #050E1F;
  --bg-card:        rgba(255,255,255,0.05);
  --bg-elevated:    rgba(255,255,255,0.08);
  --text-primary:   #E8F4FF;
  --text-secondary: rgba(232,244,255,0.65);
  --text-muted:     rgba(232,244,255,0.38);
  --border-card:    rgba(255,255,255,0.08);
  --accent:         #00C8B8;
}

body {
  background: var(--bg-base, #EEF6FF);
  color: var(--text-primary, #0A1F3C);
  transition: background 0.3s ease, color 0.2s ease;
}
"""

def write_file(path: Path, content: str, backup: bool = True):
    if backup and path.exists():
        bak = BACKUP / path.name
        if not bak.exists():
            shutil.copy2(path, bak)
    path.write_text(content, encoding='utf-8')
    print(f"✅ Written: {path.name} ({len(content):,} chars)")

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — Final Theme System")
    print("  2 themes via React Context")
    print("═"*60 + "\n")

    # 1. Write ClinicalTheme.tsx
    write_file(COMP / 'ClinicalTheme.tsx', THEME_CONTEXT)

    # 2. Update ThemeProvider.tsx
    write_file(COMP / 'ThemeProvider.tsx', THEME_PROVIDER)

    # 3. Update globals.css
    globals_path = PROJECT / 'app' / 'globals.css'
    css = globals_path.read_text(encoding='utf-8')
    if 'OCEAN THEME' not in css:
        css = GLOBALS_ADDITION + '\n' + css
        globals_path.write_text(css, encoding='utf-8')
        print(f"✅ globals.css updated")
    else:
        print(f"✓  globals.css already has ocean/midnight")

    print(f"""
═══════════════════════════════════════════════════
✅ Theme system ready!

Next steps:
  1. npx next build
  2. git add -A && git commit -m "feat: 2-theme system Ocean/Midnight via React Context"
  3. git push

Then update components to use useTheme():
  import {{ useTheme }} from './ClinicalTheme'
  const {{ T }} = useTheme()
  // Use T.text, T.bgCard, T.accent etc.
═══════════════════════════════════════════════════
""")

if __name__ == '__main__':
    main()
