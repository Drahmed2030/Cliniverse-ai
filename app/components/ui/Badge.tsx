import { L } from '../../lib/tokens'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'soft' | 'solid' | 'outline'
}

export function Badge({ children, color=L.teal, variant='soft' }: BadgeProps) {
  const bg = {
    soft:    `${color}18`,
    solid:   color,
    outline: 'transparent',
  }[variant]

  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      background: bg,
      color: variant==='solid' ? 'white' : color,
      border: `1px solid ${color}30`,
      borderRadius: L.rFull,
      padding:'3px 10px',
      fontSize:10, fontWeight:700,
      letterSpacing:0.5,
      fontFamily:L.font,
    }}>
      {children}
    </span>
  )
}
