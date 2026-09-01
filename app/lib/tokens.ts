export const BRAND = {
  company: 'NeuraOps',
  product: 'Cliniverse AI',
  relationship: 'A NeuraOps product',
  marks: {
    company: 'Edge N',
    product: 'Geometric C Intelligence',
  },
  corporate: {
    deepNavy: '#0B0F19',
    navy: '#111827',
    neuraBlue: '#2563EB',
    electricBlue: '#3B82F6',
    violet: '#7C3AED',
    lightGray: '#E5E7EB',
    white: '#FFFFFF',
  },
  cliniverse: {
    clinicalTeal: '#06B6D4',
    operationalTeal: '#0D9488',
  },
  font: '-apple-system,BlinkMacSystemFont,"SF Pro Display",Inter,sans-serif',
} as const

// Compatibility tokens used by existing clinical surfaces.
// Keep these names stable while components are migrated incrementally to BRAND.
export const L = {
  canvas:   '#F8FAFC',
  surface:  '#FFFFFF',
  raised:   '#F1F5F9',
  border:   '#E2E8F0',
  borderHi: '#CBD5E1',
  text:     '#0F172A',
  textSub:  '#475569',
  textMuted:'#94A3B8',
  teal:     '#0D9488',
  tealDim:  'rgba(13,148,136,0.10)',
  tealBd:   'rgba(13,148,136,0.20)',
  cobalt:   '#1E40AF',
  sage:     '#10B981',
  critical: '#FCA5A5',
  critBg:   'rgba(252,165,165,0.12)',
  warning:  '#FCD34D',
  warnBg:   'rgba(252,211,77,0.12)',
  gradPrimary: 'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm: '0 1px 3px rgba(15,23,42,0.08)',
  shadowMd: '0 4px 16px rgba(15,23,42,0.08)',
  shadowLg: '0 12px 40px rgba(15,23,42,0.10)',
  rSm:10, rMd:16, rLg:22, rXl:28,
  font: BRAND.font,
}
