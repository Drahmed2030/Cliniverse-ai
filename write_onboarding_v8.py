#!/usr/bin/env python3
"""
write_onboarding_v8.py — Cliniverse AI
════════════════════════════════════════
Dark Cinematic Story Mode Onboarding
- Tap right half → next screen
- Tap left half → previous screen  
- Progress bar at top (Instagram style)
- Auto-advance every 5 seconds
- Dark backgrounds + glowing text
- No buttons except PRO paywall
"""

from pathlib import Path
import shutil

PROJECT = Path('/Users/macbook/cliniverse-ai')
COMP    = PROJECT / 'app' / 'components'
BACKUP  = PROJECT / '_theme_backups'
BACKUP.mkdir(exist_ok=True)

ONBOARDING = r"""'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── Story progress bar ───────────────────────────────────────────
function StoryBar({ total, current, progress }: { total:number, current:number, progress:number }) {
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0,
      display:'flex', gap:4, padding:'14px 16px 0',
      zIndex:100,
    }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{
          flex:1, height:2.5, borderRadius:2,
          background:'rgba(255,255,255,0.25)',
          overflow:'hidden',
        }}>
          <div style={{
            height:'100%', borderRadius:2,
            background:'rgba(255,255,255,0.90)',
            width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
            transition: i === current ? 'none' : 'none',
          }}/>
        </div>
      ))}
    </div>
  )
}

// ── Animated ECG ─────────────────────────────────────────────────
function ECGLine({ color='#00C8B8', width=220 }: { color?:string, width?:number }) {
  return (
    <svg width={width} height={44} viewBox={`0 0 ${width} 44`} style={{overflow:'visible'}}>
      <polyline
        points={`0,22 ${width*.12},22 ${width*.19},22 ${width*.24},5 ${width*.29},39 ${width*.34},9 ${width*.39},30 ${width*.44},22 ${width*.58},22 ${width*.65},22 ${width*.70},5 ${width*.75},39 ${width*.80},9 ${width*.85},30 ${width*.90},22 ${width},22`}
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter:`drop-shadow(0 0 6px ${color})`,
          strokeDasharray: width*3,
          strokeDashoffset: width*3,
          animation:'ecgDraw 1.8s ease forwards',
        }}
      />
    </svg>
  )
}

// ── Floating particles ───────────────────────────────────────────
function Particles({ color }: { color: string }) {
  const dots = [
    {x:8,y:20,s:5,d:0},{x:88,y:15,s:4,d:.6},{x:15,y:75,s:6,d:1.2},
    {x:85,y:70,s:4,d:.3},{x:50,y:8,s:3,d:.9},{x:92,y:50,s:5,d:1.5},
  ]
  return (
    <>
      {dots.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:p.s, height:p.s, borderRadius:'50%',
          background:color, opacity:0.25,
          animation:`float 4s ease-in-out ${p.d}s infinite alternate`,
          pointerEvents:'none',
        }}/>
      ))}
    </>
  )
}

// ── Glow orb ─────────────────────────────────────────────────────
function Orb({ color, top, left, size=300 }: any) {
  return (
    <div style={{
      position:'absolute', top, left,
      width:size, height:size, borderRadius:'50%',
      background:`radial-gradient(circle,${color}20,transparent 65%)`,
      filter:'blur(50px)', pointerEvents:'none', zIndex:0,
    }}/>
  )
}

interface Props { onComplete: () => void }

export default function OnboardingFunnel({ onComplete }: Props) {
  const [screen, setScreen]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused]     = useState(false)
  const timerRef  = useRef<any>(null)
  const startRef  = useRef<number>(0)
  const TOTAL     = 7
  const DURATION  = 5000 // 5s per screen

  // ── Auto-advance timer ────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    startRef.current = Date.now()
    setProgress(0)

    timerRef.current = setInterval(() => {
      if (paused) return
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timerRef.current)
        setScreen(s => {
          if (s >= TOTAL - 1) { onComplete(); return s }
          return s + 1
        })
      }
    }, 50)
  }, [paused, onComplete])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [screen])

  // ── Tap handler ───────────────────────────────────────────────
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX
    const w = window.innerWidth
    if (x > w * 0.35) {
      // Right tap → next
      if (screen >= TOTAL - 1) { onComplete(); return }
      setScreen(s => s + 1)
    } else {
      // Left tap → prev
      if (screen > 0) setScreen(s => s - 1)
    }
  }

  // ── Touch/swipe ───────────────────────────────────────────────
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 60) {
      if (dx < 0 && screen < TOTAL - 1) setScreen(s => s + 1)
      if (dx > 0 && screen > 0) setScreen(s => s - 1)
    }
  }

  // ── Screens data ──────────────────────────────────────────────
  const screens = [
    // 0 — Splash
    {
      bg: 'linear-gradient(160deg,#050E1F 0%,#0A1628 60%,#050E1F 100%)',
      orbs: [{color:'#0A84FF',top:-80,left:-60},{color:'#00C8B8',top:'60%',left:'60%',size:250}],
      content: (
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
          {/* Logo */}
          <div style={{
            width:130,height:130,borderRadius:38,
            background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',
            display:'flex',alignItems:'center',justifyContent:'center',
            marginBottom:28, position:'relative',
            boxShadow:'0 0 0 1px rgba(10,132,255,0.25),0 24px 60px rgba(10,132,255,0.30),0 0 100px rgba(0,200,184,0.15)',
            animation:'logoIn 1s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}>
            <svg width="78" height="78" viewBox="0 0 72 72">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00C8B8"/>
                  <stop offset="100%" stopColor="#0A84FF"/>
                </linearGradient>
              </defs>
              <path d="M52 20C46 14 38 10 29 10C14 10 2 22 2 36C2 50 14 62 29 62C38 62 46 58 52 52"
                stroke="url(#g1)" strokeWidth="8" strokeLinecap="round" fill="none"
                style={{strokeDasharray:120,strokeDashoffset:120,animation:'draw 1.4s ease 0.3s forwards'}}/>
              <circle cx="52" cy="52" r="6" fill="#0A84FF"
                style={{opacity:0,animation:'pop 0.4s ease 1.5s forwards'}}/>
            </svg>
            <div style={{position:'absolute',inset:-22,borderRadius:'50%',border:'1px solid rgba(10,132,255,0.12)',animation:'ring 2.5s ease-out 1s infinite'}}/>
            <div style={{position:'absolute',inset:-42,borderRadius:'50%',border:'1px solid rgba(0,200,184,0.07)',animation:'ring 2.5s ease-out 1.4s infinite'}}/>
          </div>

          <div style={{animation:'fadeUp 0.6s ease 1s both'}}>
            <div style={{fontSize:40,fontWeight:900,color:'#FFFFFF',letterSpacing:-1.5,lineHeight:1,marginBottom:6}}>
              Cliniverse <span style={{background:'linear-gradient(135deg,#00C8B8,#0A84FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span>
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',letterSpacing:3,textTransform:'uppercase'}}>Medical AI · 2026</div>
          </div>

          <div style={{marginTop:32,animation:'fadeUp 0.6s ease 1.4s both'}}>
            <ECGLine color="#00C8B8" width={200}/>
          </div>
        </div>
      )
    },
    // 1 — Welcome
    {
      bg: 'linear-gradient(160deg,#050E1F 0%,#0A1628 60%,#060D1E 100%)',
      orbs: [{color:'#0A84FF',top:-60,left:'30%',size:350}],
      content: (
        <div style={{textAlign:'center',maxWidth:340}}>
          <div style={{
            width:90,height:90,borderRadius:26,
            background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 20px',fontSize:46,
            boxShadow:'0 16px 48px rgba(10,132,255,0.25)',
          }}>🏥</div>
          <div style={{fontSize:10,color:'rgba(10,132,255,0.9)',fontWeight:800,letterSpacing:2,marginBottom:14}}>BUILT BY A PHYSICIAN</div>
          <h1 style={{fontSize:36,fontWeight:900,color:'#FFFFFF',lineHeight:1.15,margin:'0 0 16px',letterSpacing:-1.2}}>
            The Clinical Brain<br/>
            <span style={{background:'linear-gradient(135deg,#00C8B8,#0A84FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>You Always Needed.</span>
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.55)',lineHeight:1.7,margin:'0 0 28px'}}>
            Your AI consultant, SOAP note writer, MCQ tutor, and shift partner — all in one app.
          </p>
          <div style={{display:'flex',gap:10}}>
            {[{v:'50K+',l:'Physicians',c:'#0A84FF'},{v:'40+',l:'AI Modules',c:'#00C8B8'},{v:'EN·AR',l:'Languages',c:'#7C5CFC'}].map(s=>(
              <div key={s.l} style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:16,border:'1px solid rgba(255,255,255,0.08)',padding:'14px 8px',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.40)',marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 2 — Live Cases
    {
      bg: 'linear-gradient(160deg,#1a0508 0%,#200A0A 60%,#150305 100%)',
      orbs: [{color:'#FF6B6B',top:-60,left:-40,size:320},{color:'#FFB347',top:'50%',left:'60%',size:200}],
      content: (
        <div style={{width:'100%',maxWidth:340}}>
          <div style={{fontSize:10,color:'#FF6B6B',fontWeight:800,letterSpacing:2,marginBottom:14}}>🔴 LIVE RIGHT NOW</div>
          {[
            {tag:'STEMI', city:'Riyadh', title:'52M — Chest pain 2 hours', sub:'Door-to-balloon: 67 min', color:'#FF6B6B'},
            {tag:'SEPSIS',city:'Dubai',  title:'67F — Fever + Hypotension', sub:'Lactate 4.2 · ICU',color:'#FFB347'},
            {tag:'DKA',   city:'London', title:'19M — pH 7.1 · K+ 2.8', sub:'Insulin infusion',color:'#7C5CFC'},
          ].map((c,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(16px)',borderRadius:16,padding:'12px 14px',marginBottom:8,border:`1px solid ${c.color}20`,display:'flex',alignItems:'center',gap:12}}>
              <div style={{background:`${c.color}15`,border:`1px solid ${c.color}30`,borderRadius:8,padding:'3px 8px',flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:800,color:c.color}}>{c.tag}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:'#FFFFFF'}}>{c.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.40)'}}>{c.sub}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:c.color,animation:'blink 1.2s ease-in-out infinite'}}/>
                <span style={{fontSize:9,fontWeight:700,color:c.color}}>LIVE</span>
              </div>
            </div>
          ))}
          <div style={{textAlign:'center',marginTop:20}}>
            <h2 style={{fontSize:32,fontWeight:900,color:'#FFFFFF',lineHeight:1.2,margin:'0 0 10px',letterSpacing:-1}}>Train on Real<br/><span style={{color:'#FF6B6B'}}>Clinical Scenarios.</span></h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.50)',lineHeight:1.6,margin:'0 0 20px'}}>1,200+ physicians training live. Every second counts.</p>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              {[{v:'1.2K+',l:'Live Now',c:'#FF6B6B'},{v:'25+',l:'Cases/Day',c:'#FFB347'},{v:'AI',l:'Generated',c:'#0A84FF'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // 3 — AI Scribe
    {
      bg: 'linear-gradient(160deg,#021a14 0%,#041f18 60%,#021510 100%)',
      orbs: [{color:'#00C8B8',top:-80,left:'20%',size:360},{color:'#30D158',top:'60%',left:'70%',size:200}],
      content: (
        <div style={{textAlign:'center',maxWidth:340}}>
          <div style={{width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,200,184,0.15),rgba(0,200,184,0.04))',border:'1.5px solid rgba(0,200,184,0.20)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',position:'relative',animation:'breathe 3s ease-in-out infinite'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,200,184,0.20),rgba(0,200,184,0.06))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:42}}>🎙️</div>
            {[0,1,2].map(i=>(
              <div key={i} style={{position:'absolute',inset:-(i+1)*18,borderRadius:'50%',border:`1px solid rgba(0,200,184,${['.15','.10','.06'][i]})`,animation:`wave 2.5s ease-out ${i*0.5}s infinite`}}/>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:3,marginBottom:6}}>
            {[4,8,14,22,30,22,14,8,22,30,14,8,4].map((h,i)=>(
              <div key={i} style={{width:3,height:h,borderRadius:2,background:'#00C8B8',opacity:0.8,animation:`bar 1s ease-in-out ${i*0.08}s infinite alternate`}}/>
            ))}
          </div>
          <div style={{fontSize:10,color:'#00C8B8',fontWeight:700,letterSpacing:2,marginBottom:20}}>AI IS LISTENING...</div>
          <h2 style={{fontSize:34,fontWeight:900,color:'#FFFFFF',lineHeight:1.2,margin:'0 0 12px',letterSpacing:-1}}>Record. Speak.<br/><span style={{color:'#00C8B8'}}>SOAP Note Done.</span></h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.50)',lineHeight:1.65,margin:'0 0 24px'}}>Speak naturally. AI generates a complete SOAP note in English and Arabic. 2 hours saved every shift.</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            {[{v:'2h',l:'Saved/Day',c:'#00C8B8'},{v:'94%',l:'Accuracy',c:'#30D158'},{v:'Live',l:'EN + AR',c:'#0A84FF'}].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 4 — Board Prep
    {
      bg: 'linear-gradient(160deg,#0e0720 0%,#130a2a 60%,#0a0518 100%)',
      orbs: [{color:'#7C5CFC',top:-80,left:'10%',size:380},{color:'#0A84FF',top:'55%',left:'65%',size:220}],
      content: (
        <div style={{textAlign:'center',maxWidth:340}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:22}}>
            {[
              {flag:'🇸🇦',name:'Saudi Board',color:'#30D158'},
              {flag:'🇺🇸',name:'USMLE',      color:'#0A84FF'},
              {flag:'🇬🇧',name:'MRCP UK',    color:'#7C5CFC'},
              {flag:'🌙', name:'Arab Board', color:'#FFB347'},
              {flag:'❤️', name:'PALS · ATLS',color:'#FF6B6B'},
              {flag:'🫀', name:'AHA · ESC',  color:'#00C8B8'},
            ].map(b=>(
              <div key={b.name} style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(12px)',borderRadius:14,padding:'12px',border:`1px solid ${b.color}20`,display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>{b.flag}</span>
                <span style={{fontSize:12,fontWeight:700,color:b.color}}>{b.name}</span>
              </div>
            ))}
          </div>
          <h2 style={{fontSize:34,fontWeight:900,color:'#FFFFFF',lineHeight:1.2,margin:'0 0 12px',letterSpacing:-1}}>Pass Your Boards.<br/><span style={{color:'#7C5CFC'}}>First Time.</span></h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.50)',lineHeight:1.65,margin:'0 0 24px'}}>AI adapts to your weak areas automatically. 92% pass rate among Cliniverse users.</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            {[{v:'4',l:'Boards',c:'#7C5CFC'},{v:'AI',l:'Adaptive',c:'#0A84FF'},{v:'92%',l:'Pass Rate',c:'#30D158'}].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,0.05)',borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',padding:'12px 16px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 5 — PRO Paywall (has buttons)
    {
      bg: 'linear-gradient(180deg,#050E1F 0%,#081525 60%,#050E1F 100%)',
      orbs: [{color:'#0A84FF',top:-60,left:'20%',size:300},{color:'#00C8B8',top:'70%',left:'60%',size:200}],
      isPro: true,
      content: (
        <div style={{width:'100%',maxWidth:340}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.40)',letterSpacing:2,marginBottom:10}}>CLINIVERSE AI PRO</div>
            <h2 style={{fontSize:30,fontWeight:900,color:'#FFFFFF',lineHeight:1.2,margin:'0 0 8px',letterSpacing:-0.8}}>Unlock Everything.<br/><span style={{background:'linear-gradient(135deg,#00C8B8,#0A84FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Elevate Your Practice.</span></h2>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.6,margin:0}}>Full access to all AI tools, unlimited cases, Ambient Scribe, and FHIR integration.</p>
          </div>
          {[
            {icon:'∞', label:'Unlimited Cases & MCQ',       color:'#00C8B8'},
            {icon:'🎙️',label:'Ambient AI Scribe — EN + AR', color:'#30D158'},
            {icon:'🌐',label:'FHIR EHR Integration',        color:'#0A84FF'},
            {icon:'📓',label:'Clinical Memory & Logbook',   color:'#7C5CFC'},
            {icon:'🤝',label:'Enterprise & Team Access',    color:'#FFB347'},
          ].map(f=>(
            <div key={f.label} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',marginBottom:6,background:'rgba(255,255,255,0.04)',borderRadius:14,border:'1px solid rgba(255,255,255,0.07)'}}>
              <span style={{fontSize:18,width:26,textAlign:'center'}}>{f.icon}</span>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.80)',fontWeight:600,flex:1}}>{f.label}</span>
              <span style={{color:'#30D158',fontSize:14}}>✓</span>
            </div>
          ))}
          <div style={{display:'flex',gap:8,margin:'16px 0 12px'}}>
            {[{p:'Monthly',v:'$14.99',s:'/month',hi:true},{p:'Annual',v:'$99',s:'Save 45% 🎉',hi:false}].map(p=>(
              <div key={p.p} style={{flex:1,borderRadius:18,padding:'14px 10px',textAlign:'center',background:p.hi?'linear-gradient(135deg,#00C8B8,#0A84FF)':'rgba(255,255,255,0.06)',border:p.hi?'none':'1px solid rgba(255,255,255,0.10)',cursor:'pointer',position:'relative',boxShadow:p.hi?'0 8px 24px rgba(10,132,255,0.35)':'none'}}>
                {p.hi&&<div style={{position:'absolute',top:-9,left:'50%',transform:'translateX(-50%)',background:'#30D158',borderRadius:8,padding:'2px 8px',fontSize:8,fontWeight:900,color:'#000',whiteSpace:'nowrap'}}>MOST POPULAR</div>}
                <div style={{fontSize:9,color:p.hi?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.40)',marginBottom:3}}>{p.p}</div>
                <div style={{fontSize:24,fontWeight:900,color:'#FFFFFF',lineHeight:1}}>{p.v}</div>
                <div style={{fontSize:9,color:p.hi?'rgba(255,255,255,0.65)':'#30D158',marginTop:2}}>{p.s}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 6 — Final CTA
    {
      bg: 'linear-gradient(160deg,#050E1F 0%,#0A1628 60%,#050E1F 100%)',
      orbs: [{color:'#00C8B8',top:-80,left:'50%',size:400,transform:'translateX(-50%)'},{color:'#0A84FF',top:'65%',left:'20%',size:250}],
      content: (
        <div style={{textAlign:'center',maxWidth:340}}>
          <div style={{width:100,height:100,borderRadius:28,background:'linear-gradient(145deg,#0d1a2e,#1a2d4a)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',boxShadow:'0 0 0 1px rgba(10,132,255,0.20),0 20px 50px rgba(10,132,255,0.25),0 0 80px rgba(0,200,184,0.12)'}}>
            <svg width="58" height="58" viewBox="0 0 72 72">
              <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00C8B8"/><stop offset="100%" stopColor="#0A84FF"/></linearGradient></defs>
              <path d="M52 20C46 14 38 10 29 10C14 10 2 22 2 36C2 50 14 62 29 62C38 62 46 58 52 52" stroke="url(#g2)" strokeWidth="8" strokeLinecap="round" fill="none"/>
              <circle cx="52" cy="52" r="5" fill="#0A84FF"/>
            </svg>
          </div>
          <h1 style={{fontSize:36,fontWeight:900,color:'#FFFFFF',lineHeight:1.15,margin:'0 0 14px',letterSpacing:-1.2}}>
            Your Clinical AI<br/>
            <span style={{background:'linear-gradient(135deg,#00C8B8,#0A84FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Starts Now.</span>
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.50)',lineHeight:1.65,margin:'0 0 28px'}}>Join 50,000+ physicians who train smarter, document faster, and practice safer — every shift.</p>
          <div style={{marginBottom:32}}><ECGLine color="#0A84FF" width={220}/></div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',letterSpacing:1}}>TAP TO BEGIN YOUR JOURNEY</div>
        </div>
      )
    },
  ]

  const s = screens[screen] as any

  return (
    <div
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight:'100vh', width:'100%',
        background:s.bg,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding: s.isPro ? '64px 24px 24px' : '80px 24px 48px',
        position:'relative', overflow:'hidden',
        fontFamily:F, userSelect:'none', cursor:'pointer',
      }}
    >
      {/* Story bar */}
      <StoryBar total={TOTAL} current={screen} progress={progress}/>

      {/* Orbs */}
      {s.orbs?.map((o: any, i: number) => <Orb key={i} {...o}/>)}

      {/* Particles */}
      <Particles color={screen===2?'#FF6B6B':screen===3?'#00C8B8':screen===4?'#7C5CFC':'#0A84FF'}/>

      {/* Content */}
      <div style={{position:'relative',zIndex:10,width:'100%',display:'flex',justifyContent:'center'}}>
        {s.content}
      </div>

      {/* PRO buttons */}
      {s.isPro && (
        <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:340,marginTop:12}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>{onComplete();window.open('https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly','_blank')}} style={{width:'100%',padding:'17px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#00C8B8,#0A84FF)',color:'white',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:'0 10px 32px rgba(10,132,255,0.40)',fontFamily:F,marginBottom:10,letterSpacing:-0.3}}>
            🚀 Start Free — Upgrade Anytime
          </button>
          <button onClick={onComplete} style={{width:'100%',padding:'14px',borderRadius:18,border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'rgba(255,255,255,0.50)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F}}>
            ⭐ See Pro Plans
          </button>
          <div style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.22)',marginTop:10}}>Cancel anytime · No hidden fees</div>
        </div>
      )}

      {/* Final screen button */}
      {screen === TOTAL-1 && (
        <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:340,marginTop:0}} onClick={e=>e.stopPropagation()}>
          <button onClick={onComplete} style={{width:'100%',padding:'18px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#00C8B8,#0A84FF)',color:'white',fontSize:17,fontWeight:800,cursor:'pointer',boxShadow:'0 12px 36px rgba(10,132,255,0.40)',fontFamily:F,letterSpacing:-0.3}}>
            Enter the Hospital →
          </button>
          <button onClick={onComplete} style={{width:'100%',padding:'14px',borderRadius:18,border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'rgba(255,255,255,0.45)',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F,marginTop:10}}>
            Sign in with existing account
          </button>
        </div>
      )}

      <style>{`
        @keyframes draw{to{stroke-dashoffset:0}}
        @keyframes pop{to{opacity:1;transform:scale(1)}}
        @keyframes logoIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
        @keyframes ring{0%{opacity:0.5;transform:scale(0.85)}100%{opacity:0;transform:scale(1.4)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{from{transform:translateY(0)}to{transform:translateY(-14px)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes wave{0%{opacity:0.5;transform:scale(0.85)}100%{opacity:0;transform:scale(1.5)}}
        @keyframes bar{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}
        @keyframes ecgDraw{to{stroke-dashoffset:0}}
      `}</style>
    </div>
  )
}
"""

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — Onboarding v8 Dark Story Mode")
    print("═"*60 + "\n")

    target = COMP / 'OnboardingFunnel.tsx'
    if target.exists():
        shutil.copy2(target, BACKUP / 'OnboardingFunnel.tsx.v7.bak')
        print("📁 Backup saved")

    target.write_text(ONBOARDING, encoding='utf-8')
    print(f"✅ OnboardingFunnel.tsx written ({len(ONBOARDING):,} chars)")
    print("""
7 Screens — Story Mode:
  0. Splash      — Logo glow + ECG draw
  1. Welcome     — Dark blue + stats
  2. Live Cases  — Dark red + live cards  
  3. AI Scribe   — Dark green + mic waves
  4. Board Prep  — Dark violet + 6 boards
  5. PRO Paywall — Pricing + features
  6. Final CTA   — Enter the Hospital

Controls:
  → Tap right half = next
  ← Tap left half  = previous
  ⟵ Swipe left     = next
  ⟶ Swipe right    = previous
  ⏱ Auto-advance   = 5 seconds

Next:
  npx next build
  git add -A && git commit -m "feat: Onboarding v8 dark story mode"
  git push
""")

if __name__ == '__main__':
    main()
