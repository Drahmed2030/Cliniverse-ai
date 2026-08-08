
'use client';
import { useState, useEffect, useRef } from 'react';

export type Tab = 'pulse' | 'ward' | 'atlas' | 'oracle' | 'life';

interface Props { active: Tab; onChange: (t: Tab) => void; }

const GRAD = (id: string) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0D9488"/>
      <stop offset="100%" stopColor="#1E40AF"/>
    </linearGradient>
  </defs>
);

const TABS = [
  {
    id: 'pulse', label: 'Today',
    svg: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={a ? 'url(#g1)' : '#94A3B8'} strokeWidth="2.2" strokeLinecap="round">
        {GRAD('g1')}
        <path d="M3 12h4l3-9 4 18 3-9h4"/>
      </svg>
    ),
  },
  {
    id: 'ward', label: 'Ward',
    svg: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={a ? 'url(#g2)' : '#94A3B8'} strokeWidth="2.2" strokeLinecap="round">
        {GRAD('g2')}
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
    ),
  },
  {
    id: 'oracle', label: '', center: true,
    svg: (a: boolean) => (
      <svg width="56" height="56" viewBox="0 0 56 56">
        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx="28" cy="28" r="26"
          fill={a ? 'url(#og)' : '#F1F5F9'}
          stroke={a ? 'none' : '#E2E8F0'} strokeWidth="1.5"
          filter={a ? 'url(#glow)' : 'none'}
        />
        <text x="28" y="36" textAnchor="middle" fontSize="22">🔮</text>
      </svg>
    ),
  },
  {
    id: 'atlas', label: 'Atlas',
    svg: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={a ? 'url(#g3)' : '#94A3B8'} strokeWidth="2.2" strokeLinecap="round">
        {GRAD('g3')}
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
      </svg>
    ),
  },
  {
    id: 'life', label: 'Life',
    svg: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={a ? 'url(#g4)' : '#94A3B8'} strokeWidth="2.2" strokeLinecap="round">
        {GRAD('g4')}
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
] as const;

export default function FloatingNav({ active, onChange }: Props) {
  const [visible, setVisible] = useState(true);
  const last = useRef(0);

  useEffect(() => {
    const h = () => {
      const y = window.scrollY;
      setVisible(y < last.current || y < 60);
      last.current = y;
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{
      position:'fixed', bottom:20, left:'50%',
      transform:`translateX(-50%) translateY(${visible?0:120}px)`,
      transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      zIndex:9999,
      display:'flex', alignItems:'center', gap:2,
      background:'rgba(255,255,255,0.92)',
      backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
      border:'1px solid #E2E8F0', borderRadius:50,
      padding:'8px 10px',
      boxShadow:'0 8px 40px rgba(15,23,42,0.14)',
    }}>
      {TABS.map(tab => {
        const a = active === tab.id;
        const isCenter = 'center' in tab && tab.center;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id as Tab)}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:2,
              padding: isCenter ? '0' : '4px 10px',
              marginTop: isCenter ? -24 : 0,
              background: isCenter ? 'none' : a ? '#0D948812' : 'transparent',
              border:'none', borderRadius: isCenter ? '50%' : 22,
              cursor:'pointer',
              transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              transform: a && !isCenter ? 'scale(1.06)' : 'scale(1)',
              minWidth: isCenter ? 56 : 52,
            }}>
            {tab.svg(a)}
            {!isCenter && (
              <>
                <span style={{
                  fontSize:10, fontWeight: a ? 700 : 500,
                  color: a ? '#0D9488' : '#94A3B8',
                  fontFamily:'-apple-system,"SF Pro Text",sans-serif',
                }}>{tab.label}</span>
                {a && <div style={{
                  width:4, height:4, borderRadius:'50%',
                  background:'linear-gradient(135deg,#0D9488,#1E40AF)',
                }}/>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
