import { L } from '../../lib/tokens'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  full?: boolean
  style?: React.CSSProperties
}

export function Button({ children, variant='primary', size='md', onClick, disabled, full, style={} }: ButtonProps) {
  const bg = {
    primary:   L.gradPrimary,
    secondary: L.surface,
    ghost:     'transparent',
    danger:    'rgba(252,165,165,0.15)',
  }[variant]

  const color = {
    primary:   '#FFFFFF',
    secondary: L.text,
    ghost:     L.teal,
    danger:    '#DC2626',
  }[variant]

  const border = {
    primary:   'none',
    secondary: `1px solid ${L.border}`,
    ghost:     `1px solid ${L.tealBd}`,
    danger:    '1px solid rgba(252,165,165,0.30)',
  }[variant]

  const pad = { sm:'8px 16px', md:'12px 22px', lg:'16px 28px' }[size]
  const fs  = { sm:12, md:14, lg:16 }[size]

  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg,
      color, border,
      borderRadius: L.rFull,
      padding: pad,
      fontSize: fs,
      fontWeight: 700,
      fontFamily: L.font,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      width: full ? '100%' : 'auto',
      boxShadow: variant==='primary' ? L.shadowMd : 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...style,
    }}>
      {children}
    </button>
  )
}
