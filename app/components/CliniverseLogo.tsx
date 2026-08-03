'use client'
import { useEffect, useRef } from 'react'

interface LogoProps {
  size?: number
  animated?: boolean
  showText?: boolean
  textColor?: string
}

export default function CliniverseLogo({ size = 64, animated = true, showText = false, textColor = '#0A1628' }: LogoProps) {
  const ecgRef = useRef<SVGPolylineElement>(null)

  useEffect(() => {
    if (!animated || !ecgRef.current) return
    const el = ecgRef.current
    const len = el.getTotalLength?.() ?? 300
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    el.style.animation = 'ecgPulse 2.4s ease-in-out infinite'
  }, [animated])

  const s = size
  const r = s * 0.18  // corner radius

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: s * 0.12 }}>
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A2540"/>
            <stop offset="100%" stopColor="#0D1F35"/>
          </linearGradient>
          <linearGradient id="ecgGrad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00C2B2"/>
            <stop offset="50%" stopColor="#38E8D8"/>
            <stop offset="100%" stopColor="#0A84FF"/>
          </linearGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00C2B2" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0.6"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <style>{`
            @keyframes ecgPulse {
              0%   { stroke-dashoffset: 300; opacity: 0.4; }
              40%  { stroke-dashoffset: 0;   opacity: 1; }
              70%  { stroke-dashoffset: 0;   opacity: 1; }
              100% { stroke-dashoffset: -300; opacity: 0.4; }
            }
            @keyframes ringPulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.04); }
            }
            @keyframes dotPulse {
              0%, 100% { opacity: 0.5; r: 2.5; }
              50%       { opacity: 1;   r: 3.5; }
            }
          `}</style>
        </defs>

        {/* Background pill */}
        <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#logoGrad)"/>

        {/* Outer glow ring */}
        <rect x="4" y="4" width="92" height="92" rx="22"
          fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" opacity="0.7"
          style={{ animation: animated ? 'ringPulse 3s ease-in-out infinite' : 'none' }}
        />

        {/* Inner subtle border */}
        <rect x="7" y="7" width="86" height="86" rx="19"
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

        {/* C letter — bold medical C */}
        <path
          d="M62 32 C54 26, 38 26, 32 38 C26 50, 30 66, 42 72 C52 77, 64 74, 68 66"
          stroke="white" strokeWidth="8.5" strokeLinecap="round" fill="none"
          filter="url(#glow)"
        />

        {/* ECG line across middle */}
        <polyline
          ref={ecgRef}
          points="18,52 28,52 33,52 37,38 41,68 45,42 49,60 53,52 62,52 66,52 70,40 74,64 78,44 82,52"
          stroke="url(#ecgGrad)" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round"
          fill="none" filter="url(#glow)"
        />

        {/* Glowing dot at end */}
        <circle cx="82" cy="52" r="3" fill="#38E8D8" filter="url(#softglow)"
          style={{ animation: animated ? 'dotPulse 2.4s ease-in-out infinite' : 'none' }}
        />
      </svg>

      {showText && (
        <div style={{
          fontSize: s * 0.22, fontWeight: 900, letterSpacing: s * 0.008,
          color: textColor,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        }}>
          C<span style={{ color: '#00C2B2' }}>AI</span>
        </div>
      )}
    </div>
  )
}
