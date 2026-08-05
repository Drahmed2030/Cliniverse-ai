import { C } from './ds'

// Glass card preset — Apple Liquid Glass style
export const glass = (accent?: string, elevated?: boolean) => ({
  background: accent
    ? `linear-gradient(160deg, ${accent}12, ${accent}04)`
    : elevated
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: `1px solid ${accent ? accent+'25' : C.borderCard}`,
  boxShadow: accent
    ? `0 8px 32px ${accent}18, 0 1px 4px rgba(0,0,0,0.35)`
    : C.shadowMd,
})

// Spacing scale
export const S = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  section: 36,
}
