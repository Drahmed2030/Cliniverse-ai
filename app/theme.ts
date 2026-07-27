// Cliniverse AI — Central Theme System
// Import this in every component: import { T, C } from '../theme'

export const T = {
  // ── BACKGROUNDS ──
  bg:           '#0f1117',
  bgSecondary:  '#1a1d27',
  card:         'rgba(255,255,255,0.04)',
  cardHover:    'rgba(255,255,255,0.07)',
  border:       'rgba(255,255,255,0.08)',
  borderLight:  'rgba(255,255,255,0.05)',

  // ── TEXT ──
  text:         '#ffffff',
  sub:          'rgba(148,163,184,0.85)',
  muted:        'rgba(148,163,184,0.45)',
  faint:        'rgba(148,163,184,0.25)',

  // ── ACCENT COLORS ──
  teal:         '#38bdf8',
  blue:         '#4fc3f7',
  green:        '#4ade80',
  amber:        '#fbbf24',
  rose:         '#f87171',
  purple:       '#a78bfa',
  pink:         '#f9a8d4',
  orange:       '#fb923c',
  gold:         '#ffd700',

  // ── MEDICAL SPECIALTIES ──
  emergency:    '#f87171',
  cardiac:      '#38bdf8',
  neuro:        '#a78bfa',
  respiratory:  '#67e8f9',
  pharmacy:     '#4ade80',
  radiology:    '#fbbf24',
  pediatrics:   '#f9a8d4',
  infectious:   '#86efac',
  nephrology:   '#c4b5fd',
  endocrine:    '#fb923c',

  // ── STATUS ──
  critical:     '#f87171',
  urgent:       '#fbbf24',
  stable:       '#4ade80',
  info:         '#38bdf8',

  // ── FONT ──
  F: '"Inter", -apple-system, "SF Pro Display", sans-serif',

  // ── RADIUS ──
  rSm:  12,
  rMd:  16,
  rLg:  20,
  rXl:  24,
  rFull: 999,

  // ── NAV ──
  navBg:     'rgba(15,17,23,0.92)',
  navBorder: 'rgba(255,255,255,0.07)',
}

// ── GRADIENTS ──
export const G = {
  primary:    'linear-gradient(135deg, #38bdf8, #a78bfa)',
  success:    'linear-gradient(135deg, #4ade80, #38bdf8)',
  danger:     'linear-gradient(135deg, #f87171, #fbbf24)',
  gold:       'linear-gradient(135deg, #fbbf24, #fb923c)',
  purple:     'linear-gradient(135deg, #a78bfa, #38bdf8)',
  dark:       'linear-gradient(145deg, #0f1117, #1a1d27)',
  cardGlow:   (color: string) => `linear-gradient(135deg, ${color}10, rgba(15,17,23,0.8))`,
  ambientBg:  (color: string) => `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
}

// ── SHADOWS ──
export const S = {
  card:       '0 2px 20px rgba(0,0,0,0.3)',
  cardHover:  '0 8px 32px rgba(0,0,0,0.5)',
  glow:       (color: string) => `0 0 20px ${color}40`,
  neon:       (color: string) => `0 0 10px ${color}, 0 0 20px ${color}60`,
  float:      '0 8px 40px rgba(0,0,0,0.6)',
}

// ── CARD STYLE HELPER ──
export const card = (color?: string) => ({
  background: color ? G.cardGlow(color) : T.card,
  border: `1px solid ${color ? color + '20' : T.border}`,
  borderRadius: T.rLg,
  padding: '16px 18px',
  position: 'relative' as const,
  overflow: 'hidden' as const,
})

// ── BADGE STYLE HELPER ──
export const badge = (color: string) => ({
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: 1.5,
  color,
  background: color + '15',
  border: `1px solid ${color}25`,
  padding: '3px 8px',
  borderRadius: 8,
  textTransform: 'uppercase' as const,
  fontFamily: T.F,
})
