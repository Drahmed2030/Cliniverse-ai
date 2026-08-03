'use client'
import { useState, useEffect, useRef } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── Animated Heart SVG ───────────────────────────────────────────
function HeartSVG({ stability, beats }: { stability: number, beats: boolean }) {
  const color = stability > 60 ? '#FF6B6B' : stability > 30 ? '#FFB347' : '#FF453A'
  const glow  = stability > 60 ? 'rgba(255,107,107,0.40)' : stability > 30 ? 'rgba(255,179,71,0.40)' : 'rgba(255,69,58,0.60)'
  const scale = beats ? 1.08 : 1.0

  return (
    <div style={{
      position:'relative', display:'flex',
      alignItems:'center', justifyContent:'center',
      width:180, height:180,
    }}>
      {/* Glow rings */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:`radial-gradient(circle,${glow},transparent 65%)`,
        animation: beats ? 'glowPulse 0.6s ease-out' : 'none',
      }}/>

      {/* Heart */}
      <svg
        width="140" height="130" viewBox="0 0 100 90"
        style={{
          filter:`drop-shadow(0 0 12px ${glow})`,
          transform:`scale(${scale})`,
          transition:'transform 0.15s ease',
        }}
      >
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stability > 60 ? '#FF8FAB' : '#FF6B6B'}/>
            <stop offset="100%" stopColor={color}/>
          </linearGradient>
          <linearGradient id="blockGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFD60A"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
        </defs>

        {/* Main heart shape */}
        <path
          d="M50 80 C50 80 10 55 10 30 C10 15 22 5 35 8 C42 10 47 15 50 20 C53 15 58 10 65 8 C78 5 90 15 90 30 C90 55 50 80 50 80Z"
          fill="url(#heartGrad)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="1"
        />

        {/* Coronary arteries */}
        <path d="M50 20 C45 28 38 32 32 38" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M50 20 C55 28 62 32 68 38" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* LAD occlusion — the STEMI culprit */}
        {stability < 80 && (
          <>
            {/* Blocked segment */}
            <circle cx="50" cy="35" r="5" fill="url(#blockGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            {/* Thrombus symbol */}
            <text x="50" y="39" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">✕</text>
          </>
        )}

        {/* Ischaemic zone — anterior wall */}
        {stability < 50 && (
          <path
            d="M50 20 C53 28 58 34 60 42 C55 45 50 46 45 42 C47 34 48 28 50 20Z"
            fill="rgba(255,214,10,0.35)"
            stroke="rgba(255,214,10,0.60)"
            strokeWidth="1"
          />
        )}

        {/* Necrosis zone */}
        {stability < 25 && (
          <path
            d="M50 25 C52 32 55 37 56 42 C53 43 50 44 47 42 C48 37 48 32 50 25Z"
            fill="rgba(100,100,100,0.50)"
          />
        )}
      </svg>

      {/* Stability % */}
      <div style={{
        position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
        fontSize:11, fontWeight:800, color,
        background:'rgba(0,0,0,0.30)', borderRadius:8, padding:'2px 8px',
      }}>{stability}% stable</div>
    </div>
  )
}

// ── Live ECG ─────────────────────────────────────────────────────
function ECGTrace({ stability }: { stability: number }) {
  const stElevation = stability < 60 ? 18 : stability < 80 ? 10 : 4
  const color = stability > 60 ? '#30D158' : '#FF6B6B'
  const w = 320

  // Build ECG path with ST elevation
  const buildPath = () => {
    const pts: string[] = []
    const cycles = 2
    const cw = w / cycles

    for (let c = 0; c < cycles; c++) {
      const x0 = c * cw
      pts.push(`${x0},30`)                          // baseline
      pts.push(`${x0 + cw*0.15},30`)               // P wave start
      pts.push(`${x0 + cw*0.18},22`)               // P wave peak
      pts.push(`${x0 + cw*0.21},30`)               // P wave end
      pts.push(`${x0 + cw*0.25},30`)               // PR segment
      pts.push(`${x0 + cw*0.28},48`)               // Q wave
      pts.push(`${x0 + cw*0.30},2`)                // R wave (sharp)
      pts.push(`${x0 + cw*0.32},40`)               // S wave
      pts.push(`${x0 + cw*0.35},30 - ${stElevation}`)  // ST segment elevated!
      pts.push(`${x0 + cw*0.48},30 - ${stElevation}`)  // ST plateau
      pts.push(`${x0 + cw*0.52},22`)               // T wave peak
      pts.push(`${x0 + cw*0.58},30`)               // T wave end
      pts.push(`${x0 + cw*0.85},30`)               // baseline
    }
    return pts.join(' ')
  }

  // Simpler deterministic path
  const path = `
    M0,30 L${w*.08},30 L${w*.11},23 L${w*.14},30
    L${w*.18},30 L${w*.20},46 L${w*.22},2 L${w*.24},38
    L${w*.27},${30-stElevation} L${w*.40},${30-stElevation}
    L${w*.44},${stElevation > 8 ? 16 : 22} L${w*.50},30 L${w*.62},30
    L${w*.70},23 L${w*.73},30 L${w*.77},30
    L${w*.79},46 L${w*.81},2 L${w*.83},38
    L${w*.86},${30-stElevation} L${w*.99},${30-stElevation}
  `

  return (
    <div style={{
      background:'rgba(0,0,0,0.08)', borderRadius:14,
      padding:'10px 12px', border:`1px solid ${color}25`,
      overflow:'hidden',
    }}>
      <div style={{fontSize:9,color,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>
        📈 LIVE ECG — {stability < 60 ? 'ST ELEVATION V1-V4 ⚠️' : 'MONITORING'}
      </div>
      <svg width={w} height={60} viewBox={`0 0 ${w} 60`} style={{display:'block'}}>
        <path d={path} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
        {/* ST elevation annotation */}
        {stElevation > 8 && (
          <>
            <line x1={w*.27} y1={30-stElevation} x2={w*.27} y2={30}
              stroke="#FFD60A" strokeWidth="1" strokeDasharray="3,2"/>
            <text x={w*.29} y={30-stElevation/2} fontSize="7" fill="#FFD60A" fontWeight="bold">
              +{Math.round(stElevation/3)}mm
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

// ── Stability Bar ─────────────────────────────────────────────────
function StabilityBar({ value }: { value: number }) {
  const color = value > 60 ? '#30D158' : value > 30 ? '#FFB347' : '#FF453A'
  const label = value > 60 ? 'STABLE' : value > 30 ? 'DETERIORATING' : 'CRITICAL'

  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:10,fontWeight:800,color,letterSpacing:1}}>
          ⚡ CLINICAL STABILITY
        </span>
        <span style={{fontSize:12,fontWeight:900,color}}>
          {value}% · {label}
        </span>
      </div>
      <div style={{height:10,background:'rgba(10,31,60,0.08)',borderRadius:5,overflow:'hidden'}}>
        <div style={{
          height:'100%', width:`${value}%`,
          background:`linear-gradient(90deg,${value>60?'#30D158':value>30?'#FFB347':'#FF453A'},${color})`,
          borderRadius:5,
          transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow:`0 0 10px ${color}60`,
        }}/>
      </div>
      {value < 30 && (
        <div style={{fontSize:10,color:'#FF453A',fontWeight:700,marginTop:4,textAlign:'center',animation:'blink 0.8s ease-in-out infinite'}}>
          ⚠️ PATIENT IN DANGER — ACT NOW
        </div>
      )}
    </div>
  )
}

// ── Vital badge ───────────────────────────────────────────────────
function Vital({ label, value, unit, critical }: any) {
  return (
    <div style={{
      background: critical ? 'rgba(255,69,58,0.08)' : 'rgba(255,255,255,0.70)',
      borderRadius:14, padding:'10px 8px', textAlign:'center',
      border:`1.5px solid ${critical ? 'rgba(255,69,58,0.30)' : 'rgba(10,132,255,0.10)'}`,
      boxShadow: critical ? '0 4px 16px rgba(255,69,58,0.15)' : '0 2px 8px rgba(10,132,255,0.06)',
      transition:'all 0.6s ease',
    }}>
      <div style={{fontSize:9,fontWeight:700,color:critical?'#FF453A':'rgba(10,31,60,0.45)',letterSpacing:1,marginBottom:3}}>{label}</div>
      <div style={{fontSize:18,fontWeight:900,color:critical?'#E53E3E':'#0A1F3C',lineHeight:1}}>{value}</div>
      <div style={{fontSize:9,color:critical?'rgba(229,62,62,0.70)':'rgba(10,31,60,0.40)',marginTop:2}}>{unit}</div>
    </div>
  )
}

// ── Decision option ───────────────────────────────────────────────
function Decision({ action, onClick, disabled }: any) {
  const [pressed, setPressed] = useState(false)
  return (
    <div
      onClick={() => { if (!disabled) { setPressed(true); onClick() } }}
      style={{
        background: pressed
          ? action.correct ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.10)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter:'blur(16px)',
        borderRadius:16, padding:'14px 16px',
        border: pressed
          ? action.correct ? '2px solid rgba(48,209,88,0.40)' : '1.5px solid rgba(255,69,58,0.30)'
          : '1px solid rgba(10,132,255,0.12)',
        cursor: disabled ? 'default' : 'pointer',
        display:'flex', alignItems:'center', gap:12,
        transition:'all 0.25s ease',
        opacity: disabled && !pressed ? 0.5 : 1,
        boxShadow: pressed
          ? action.correct ? '0 4px 20px rgba(48,209,88,0.20)' : '0 4px 16px rgba(255,69,58,0.15)'
          : '0 2px 12px rgba(10,132,255,0.06)',
      }}
    >
      <div style={{
        width:32, height:32, borderRadius:10, flexShrink:0,
        background: pressed
          ? action.correct ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.12)'
          : 'rgba(10,132,255,0.08)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
      }}>
        {pressed ? (action.correct ? '✅' : '❌') : '▷'}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:'#0A1F3C',marginBottom:2}}>{action.label}</div>
        {pressed && (
          <div style={{fontSize:11,color:action.correct?'#1A7F37':'#C0392B',lineHeight:1.5,marginTop:4,animation:'fadeUp 0.3s ease'}}>
            {action.feedback}
          </div>
        )}
      </div>
      {!pressed && (
        <div style={{fontSize:11,color:'rgba(10,31,60,0.35)',fontWeight:600}}>
          {action.impact > 0 ? `+${action.impact}%` : `${action.impact}%`}
        </div>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function STEMICase({ onXP }: { onXP?: (n:number)=>void }) {
  const [phase, setPhase]         = useState<'intro'|'active'|'complete'>('intro')
  const [stability, setStability] = useState(72)
  const [beats, setBeats]         = useState(false)
  const [decided, setDecided]     = useState(false)
  const [score, setScore]         = useState(0)
  const [timeLeft, setTimeLeft]   = useState(90)
  const [timerActive, setTimerActive] = useState(false)
  const [showFeedback, setShowFeedback] = useState('')

  // Vitals — change with stability
  const vitals = {
    bp:   stability > 60 ? '88/58' : stability > 40 ? '96/64' : '108/70',
    hr:   stability > 60 ? '118' : stability > 40 ? '108' : '98',
    o2:   stability > 60 ? '91' : stability > 40 ? '94' : '97',
    rr:   stability > 60 ? '26' : stability > 40 ? '22' : '18',
    temp: '36.8',
    gcs:  stability > 40 ? '15' : '14',
  }

  // Heartbeat animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBeats(true)
      setTimeout(() => setBeats(false), 200)
    }, stability > 60 ? 600 : stability > 30 ? 800 : 1100)
    return () => clearInterval(interval)
  }, [stability])

  // Countdown timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t)
          setTimerActive(false)
          // Time penalty
          setStability(s => Math.max(s - 15, 5))
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [timerActive, timeLeft])

  const actions = [
    {
      id:'pci',
      label:'Aspirin 300mg + activate Cath Lab NOW',
      feedback:'✅ Correct! Dual antiplatelet + immediate PCI. Door-to-balloon < 90 min. BP stabilising.',
      correct:true, impact:+25,
    },
    {
      id:'thrombo',
      label:'IV Thrombolysis (tPA) — no cath lab available',
      feedback:'⚠️ Acceptable if PCI > 120 min away. Risk of haemorrhage. Monitor closely.',
      correct:true, impact:+12,
    },
    {
      id:'nitro',
      label:'GTN spray for chest pain relief',
      feedback:'❌ Contraindicated! SBP 88 mmHg — GTN will worsen hypotension. Dangerous.',
      correct:false, impact:-20,
    },
    {
      id:'wait',
      label:'Wait for troponin result before acting',
      feedback:'❌ STEMI is a clinical + ECG diagnosis. Do NOT wait for troponin. Time = myocardium.',
      correct:false, impact:-30,
    },
  ]

  const handleDecision = (action: typeof actions[0]) => {
    if (decided) return
    setDecided(true)
    setTimerActive(false)
    const newStability = Math.max(5, Math.min(100, stability + action.impact))
    setTimeout(() => setStability(newStability), 400)
    const xpEarned = action.correct ? 50 : 10
    setScore(xpEarned)
    setShowFeedback(action.feedback)
    setTimeout(() => {
      setPhase('complete')
      onXP && onXP(xpEarned)
    }, 2500)
  }

  // ── INTRO ──────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{fontFamily:F, paddingBottom:20}}>
      {/* Hero */}
      <div style={{
        background:'linear-gradient(145deg,rgba(255,107,107,0.08),rgba(10,132,255,0.05))',
        backdropFilter:'blur(20px)',
        borderRadius:24, padding:'24px 20px',
        border:'1px solid rgba(255,107,107,0.15)',
        marginBottom:16, textAlign:'center',
        boxShadow:'0 8px 32px rgba(255,107,107,0.10)',
      }}>
        <div style={{fontSize:10,color:'#FF6B6B',fontWeight:800,letterSpacing:2,marginBottom:8}}>🚨 EMERGENCY CASE</div>
        <h1 style={{fontSize:26,fontWeight:900,color:'#0A1F3C',margin:'0 0 6px',letterSpacing:-0.8}}>Anterior STEMI</h1>
        <p style={{fontSize:13,color:'rgba(10,31,60,0.60)',margin:'0 0 16px'}}>52M · Chest pain 45 min · ST elevation V1–V4</p>

        {/* Heart preview */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <HeartSVG stability={72} beats={beats}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
          <Vital label="BP" value="88/58" unit="mmHg" critical={true}/>
          <Vital label="HR" value="118" unit="bpm" critical={true}/>
          <Vital label="SpO2" value="91" unit="%" critical={true}/>
        </div>

        <div style={{
          background:'rgba(255,107,107,0.06)',
          borderRadius:12, padding:'10px 14px',
          border:'1px solid rgba(255,107,107,0.15)',
          fontSize:12, color:'rgba(10,31,60,0.70)', lineHeight:1.6, textAlign:'left',
        }}>
          <b style={{color:'#FF6B6B'}}>Presentation:</b> 52-year-old male, crushing chest pain radiating to left arm × 45 minutes. Diaphoretic. BP 88/58 mmHg. HR 118 bpm irregular. SpO2 91% on air. ECG: ST elevation 3mm V1–V4.
        </div>
      </div>

      <button onClick={() => { setPhase('active'); setTimerActive(true) }} style={{
        width:'100%', padding:16, borderRadius:18, border:'none',
        background:'linear-gradient(135deg,#FF6B6B,#FF453A)',
        color:'#0A1628', fontSize:15, fontWeight:800, cursor:'pointer',
        boxShadow:'0 8px 24px rgba(255,107,107,0.35)', fontFamily:F,
      }}>
        🚨 Start Emergency Protocol
      </button>
    </div>
  )

  // ── ACTIVE ─────────────────────────────────────────────────────
  if (phase === 'active') return (
    <div style={{fontFamily:F, paddingBottom:20}}>

      {/* Timer + header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:14,
        background:'rgba(255,255,255,0.75)', backdropFilter:'blur(16px)',
        borderRadius:16, padding:'10px 16px',
        border:'1px solid rgba(10,132,255,0.10)',
        boxShadow:'0 2px 12px rgba(10,132,255,0.06)',
      }}>
        <div>
          <div style={{fontSize:10,color:'rgba(10,31,60,0.50)',fontWeight:700}}>ANTERIOR STEMI</div>
          <div style={{fontSize:13,fontWeight:800,color:'#0A1F3C'}}>52M · ED Resus Bay 1</div>
        </div>
        <div style={{
          width:52, height:52, borderRadius:'50%', position:'relative',
          background:`conic-gradient(${timeLeft > 30 ? '#30D158' : '#FF453A'} ${(timeLeft/90)*360}deg, rgba(10,31,60,0.08) 0deg)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 0 12px ${timeLeft > 30 ? 'rgba(48,209,88,0.40)' : 'rgba(255,69,58,0.50)'}`,
        }}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:14,fontWeight:900,color:timeLeft>30?'#30D158':'#FF453A'}}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Stability */}
      <StabilityBar value={stability}/>

      {/* Heart + ECG side by side */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
        <HeartSVG stability={stability} beats={beats}/>
        <div style={{flex:1}}>
          <ECGTrace stability={stability}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
            <Vital label="BP" value={vitals.bp} unit="mmHg" critical={parseInt(vitals.bp)<90}/>
            <Vital label="HR" value={vitals.hr} unit="bpm" critical={parseInt(vitals.hr)>110}/>
            <Vital label="SpO2" value={vitals.o2} unit="%" critical={parseInt(vitals.o2)<94}/>
            <Vital label="RR" value={vitals.rr} unit="/min" critical={parseInt(vitals.rr)>24}/>
          </div>
        </div>
      </div>

      {/* Decisions */}
      <div style={{fontSize:10,color:'rgba(10,31,60,0.50)',fontWeight:700,letterSpacing:1.5,marginBottom:10}}>
        ⚡ WHAT IS YOUR NEXT ACTION?
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {actions.map(a => (
          <Decision key={a.id} action={a} onClick={() => handleDecision(a)} disabled={decided}/>
        ))}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%{opacity:0.8}100%{opacity:0}}
      `}</style>
    </div>
  )

  // ── COMPLETE ───────────────────────────────────────────────────
  return (
    <div style={{fontFamily:F, paddingBottom:20, textAlign:'center'}}>
      <div style={{
        background: stability > 60
          ? 'linear-gradient(145deg,rgba(48,209,88,0.08),rgba(10,132,255,0.05))'
          : 'linear-gradient(145deg,rgba(255,107,107,0.08),rgba(255,69,58,0.05))',
        borderRadius:24, padding:'28px 20px', marginBottom:16,
        border:`1px solid ${stability>60?'rgba(48,209,88,0.20)':'rgba(255,69,58,0.20)'}`,
      }}>
        <div style={{fontSize:56,marginBottom:12}}>
          {stability > 60 ? '🏆' : stability > 30 ? '📋' : '😰'}
        </div>
        <div style={{fontSize:22,fontWeight:900,color:'#0A1F3C',marginBottom:6}}>
          {stability > 60 ? 'Excellent Clinical Decision!' : stability > 30 ? 'Acceptable — Review Guidelines' : 'Critical Error — Study STEMI Protocol'}
        </div>
        <div style={{fontSize:16,fontWeight:700,color:stability>60?'#30D158':'#FF6B6B',marginBottom:16}}>
          +{score} XP · Patient Stability: {stability}%
        </div>

        {/* Final heart */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <HeartSVG stability={stability} beats={beats}/>
        </div>

        {showFeedback && (
          <div style={{
            background:'rgba(10,31,60,0.05)', borderRadius:14,
            padding:'12px 16px', textAlign:'left',
            border:'1px solid rgba(10,132,255,0.10)',
            fontSize:13, color:'rgba(10,31,60,0.75)', lineHeight:1.7,
          }}>{showFeedback}</div>
        )}
      </div>

      {/* Key learning */}
      <div style={{
        background:'rgba(255,255,255,0.75)', backdropFilter:'blur(16px)',
        borderRadius:20, padding:16, textAlign:'left',
        border:'1px solid rgba(10,132,255,0.10)',
        boxShadow:'0 4px 20px rgba(10,132,255,0.08)',
        marginBottom:16,
      }}>
        <div style={{fontSize:10,color:'#0A84FF',fontWeight:800,letterSpacing:1.5,marginBottom:10}}>📚 KEY LEARNING POINT</div>
        <p style={{fontSize:13,color:'rgba(10,31,60,0.75)',lineHeight:1.75,margin:0}}>
          <b>STEMI = Time-Critical Emergency.</b> Immediate dual antiplatelet (Aspirin 300mg + Clopidogrel/Ticagrelor) and emergent PCI within 90 minutes. GTN is contraindicated when SBP &lt; 90 mmHg. Troponin result should NEVER delay reperfusion.
        </p>
      </div>

      <button onClick={() => {
        setPhase('intro'); setStability(72); setDecided(false)
        setScore(0); setTimeLeft(90); setShowFeedback('')
      }} style={{
        width:'100%', padding:16, borderRadius:18, border:'none',
        background:'linear-gradient(135deg,#0A84FF,#00C8B8)',
        color:'#0A1628', fontSize:15, fontWeight:800, cursor:'pointer',
        boxShadow:'0 8px 24px rgba(10,132,255,0.30)', fontFamily:F,
      }}>
        🔄 Try Again
      </button>
    </div>
  )
}
