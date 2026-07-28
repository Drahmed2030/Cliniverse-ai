'use client'

export default function CliniverseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="gg3gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDE7"/>
          <stop offset="20%" stopColor="#FFD54F"/>
          <stop offset="60%" stopColor="#FF8F00"/>
          <stop offset="100%" stopColor="#E65100"/>
        </linearGradient>
        <linearGradient id="gg3teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0FFFD"/>
          <stop offset="30%" stopColor="#00E5FF"/>
          <stop offset="100%" stopColor="#00796B"/>
        </linearGradient>
        <linearGradient id="gg3bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,213,79,0.20)"/>
          <stop offset="50%" stopColor="rgba(30,61,82,0.85)"/>
          <stop offset="100%" stopColor="rgba(0,180,166,0.15)"/>
        </linearGradient>
        <radialGradient id="gg3radial" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)"/>
        </radialGradient>
        <filter id="ff3mega">
          <feGaussianBlur stdDeviation="4.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ff3soft">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ff3teal">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="26" fill="none" stroke="url(#gg3gold)" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#ff3soft)"/>
      <rect x="5" y="5" width="90" height="90" rx="23" fill="url(#gg3bg)" stroke="url(#gg3gold)" strokeWidth="2" strokeOpacity="0.9"/>
      <rect x="5" y="5" width="90" height="90" rx="23" fill="url(#gg3radial)"/>
      <rect x="8" y="8" width="84" height="84" rx="20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      <ellipse cx="43" cy="50" rx="30" ry="30" fill="#FFD54F" fillOpacity="0.10" filter="url(#ff3mega)"/>
      <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="#FFD54F" strokeWidth="16" strokeLinecap="round" fill="none" strokeOpacity="0.2" filter="url(#ff3mega)"/>
      <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="#FFB300" strokeWidth="11" strokeLinecap="round" fill="none" strokeOpacity="0.4" filter="url(#ff3soft)"/>
      <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="url(#gg3gold)" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M36 50L46 63L70 36" stroke="#00E5FF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.25" filter="url(#ff3teal)"/>
      <path d="M36 50L46 63L70 36" stroke="#00E5FF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" filter="url(#ff3soft)"/>
      <path d="M36 50L46 63L70 36" stroke="url(#gg3teal)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="69" cy="32" r="5.5" fill="#FFD54F" opacity="1" filter="url(#ff3soft)"/>
      <circle cx="69" cy="32" r="3.5" fill="#FFFDE7"/>
      <circle cx="69" cy="68" r="5.5" fill="#FFD54F" opacity="1" filter="url(#ff3soft)"/>
      <circle cx="69" cy="68" r="3.5" fill="#FFFDE7"/>
      <g opacity="0.8">
        <line x1="16" y1="16" x2="16" y2="10" stroke="#FFD54F" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="13" y1="16" x2="19" y2="16" stroke="#FFD54F" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      <g opacity="0.6">


<line x1="84" y1="84" x2="84" y2="79" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="81" y1="84" x2="87" y2="84" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}