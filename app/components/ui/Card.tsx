import { L } from '../../lib/tokens'

interface CardProps {
  children: React.ReactNode
  accent?: string
  elevated?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, accent, elevated, onClick, style={} }: CardProps) {
  return (
    <div onClick={onClick} style={{
      background: elevated ? L.raised : L.surface,
      border: `1px solid ${accent ? accent+'30' : L.border}`,
      borderRadius: L.rLg,
      boxShadow: accent ? `${L.shadowMd}, 0 0 0 1px ${accent}15` : L.shadowSm,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      ...style,
    }}>
      {children}
    </div>
  )
}
