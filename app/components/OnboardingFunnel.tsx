'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Props { onComplete: () => void }

const STORY_DURATION = 5000 // 5s per screen (screens 0-3 auto-advance)
const AUTO_SCREENS = 4      // first 4 screens auto-advance like stories

export default function OnboardingFunnel({ onComplete }: Props) {
  const [screen, setScreen] = useState(0)
  const [progress, setProgress] = useState(0)      // 0-100 for current screen
  const [paused, setPaused] = useState(false)
  const [dragX, setDragX] = useState(0)            // live drag offset
  const [isDragging, setIsDragging] = useState(false)
  const [countdown, setCountdown] = useState(599)
  const [promoShown, setPromoShown] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const progressRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const screenRef = useRef(0)
  const TOTAL = 7

  screenRef.current = screen

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window))
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── STORY PROGRESS ENGINE ──
  useEffect(() => {
    setProgress(0)
    progressRef.current = 0
    lastTimeRef.current = 0
    cancelAnimationFrame(rafRef.current)

    // Only auto-advance first AUTO_SCREENS
    if (screen >= AUTO_SCREENS) return

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const delta = time - lastTimeRef.current
      lastTimeRef.current = time

      if (!paused) {
        progressRef.current += (delta / STORY_DURATION) * 100
        setProgress(Math.min(progressRef.current, 100))

        if (progressRef.current >= 100) {
          // Auto-advance
          const next = screenRef.current + 1
          if (next < TOTAL) {
            setScreen(next)
          }
          return
        }
      } else {
        lastTimeRef.current = time // reset delta when paused
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [screen, paused])

  // Countdown for screen 5
  useEffect(() => {
    if (screen < 5) return
    const t = setInterval(() => setCountdown(c => c > 0 ? c-1 : 0), 1000)
    return () => clearInterval(t)
  }, [screen])

  useEffect(() => {
    if (screen === 4) setTimeout(() => setPromoShown(true), 500)
  }, [screen])

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= TOTAL) return
    cancelAnimationFrame(rafRef.current)
    setScreen(idx)
    setProgress(0)
    setDragX(0)
    setIsDragging(false)
  }, [])

  // ── TOUCH HANDLERS — live drag like Instagram ──
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    setPaused(true)
    setIsDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dy > 40) return // vertical scroll — ignore
    setDragX(dx)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    const dt = Date.now() - touchStartTime.current
    setIsDragging(false)
    setDragX(0)
    setPaused(false)

    if (dy > 60) return // was scrolling vertically

    // Tap zones (left 35% = back, right 65% = forward) — like Instagram Stories
    if (dt < 200 && Math.abs(dx) < 20) {
      const tapX = touchStartX.current
      const w = window.innerWidth
      if (tapX < w * 0.35) goTo(screen - 1)
      else goTo(screen + 1)
      return
    }

    // Swipe
    if (Math.abs(dx) > 60) {
      if (dx < 0) goTo(screen + 1)
      else goTo(screen - 1)
    }
  }

  const handleInstall = async () => {
    if (isIOS) { setShowIOSModal(true); return }
    if (deferredPrompt) {
      setInstalling(true)
      try {
        await deferredPrompt.prompt()
        await deferredPrompt.userChoice
        setInstalling(false)
      } catch(e) { setInstalling(false) }
    }
    onComplete()
  }

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // Live drag transform
  const dragTransform = isDragging && Math.abs(dragX) > 10
    ? `translateX(${dragX * 0.3}px) scale(${1 - Math.abs(dragX) * 0.0003})`
    : 'translateX(0) scale(1)'

  // ── SCREENS ──
  const screens = [

    // 0 — HERO
    <div key="s0" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 28px',gap:14}}>
        {[
          {file:'cardiology.ts',imp:'import',name:'Cardiology Cases',comment:'// 150+ Clinical Scenarios',c:'#ff453a'},
          {file:'emergency.ts',imp:'import',name:'Acute Care',comment:'// 90+ ECG & ER Cases',c:'#ff9f0a'},
          {file:'quizzes.ts',imp:'import',name:'Board Review',comment:'// 300+ Exam Questions',c:'#30d158'},
        ].map((d,i)=>(
          <div key={i} style={{
            background:'rgba(255,255,255,0.055)',
            backdropFilter:'blur(24px)',
            WebkitBackdropFilter:'blur(24px)',
            borderRadius:20,padding:'16px 20px',
            border:`1px solid ${d.c}28`,
            boxShadow:`0 8px 32px ${d.c}10, 0 0 0 1px rgba(255,255,255,0.05) inset`,
            animation:`rise 0.6s cubic-bezier(.34,1.56,.64,1) ${i*0.12}s both`,
          }}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontFamily:'monospace',marginBottom:6,letterSpacing:0.5}}>{d.file}</div>
            <div style={{fontFamily:'SF Mono, monospace',fontSize:14,lineHeight:1.7}}>
              <span style={{color:'#c084fc'}}>{d.imp} </span>
              <span style={{color:'white',fontWeight:700}}>{d.name}</span>
              <br/>
              <span style={{color:d.c,fontSize:12}}>{d.comment}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 28px 44px',textAlign:'center'}}>
        <p style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:3,textTransform:'uppercase',marginBottom:10,fontWeight:600}}>Clinical Intelligence</p>
        <h1 style={{fontSize:36,fontWeight:900,letterSpacing:-1.5,margin:'0 0 6px',lineHeight:1}}>
          <span style={{color:'white'}}>Clini</span>
          <span style={{background:'linear-gradient(135deg,#a78bfa,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>verse</span>
          <span style={{color:'rgba(255,255,255,0.5)',fontSize:22,fontWeight:500,letterSpacing:0}}> AI</span>
        </h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.45)',margin:'10px 0 28px',lineHeight:1.7}}>محاكاة سريرية تفاعلية مدعومة بالذكاء الاصطناعي</p>
        <button onClick={()=>goTo(1)} style={CTA_STYLE}>Get Started →</button>
        <p style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:12}}>Swipe or tap to explore</p>
      </div>
    </div>,

    // 1 — AI TEAM
    <div key="s1" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 28px',gap:12}}>
        {[
          {icon:'🩺',label:'Clinical Case Simulator',desc:'Real patient encounters with AI responses',c:'#0a84ff'},
          {icon:'📈',label:'ECG & Diagnostics Analyst',desc:'Trace analysis with key findings',c:'#ff453a'},
          {icon:'📋',label:'SBAR Handover Generator',desc:'NHS-standard handover in 30 seconds',c:'#30d158'},
          {icon:'💬',label:'Communication Simulator',desc:'SPIKES · REMAP · HEARD · Being Open',c:'#a78bfa'},
        ].map((a,i)=>(
          <div key={i} style={{
            display:'flex',alignItems:'center',gap:16,
            background:'rgba(255,255,255,0.04)',
            backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
            borderRadius:20,padding:'14px 16px',
            border:`1px solid ${a.c}22`,
            boxShadow:`0 4px 24px ${a.c}0a`,
            animation:`slideR 0.5s cubic-bezier(.34,1.2,.64,1) ${i*0.1}s both`,
          }}>
            <div style={{width:50,height:50,borderRadius:16,background:`${a.c}18`,border:`1px solid ${a.c}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,boxShadow:`0 4px 20px ${a.c}22`}}>{a.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:2}}>{a.label}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',lineHeight:1.4}}>{a.desc}</div>
            </div>
            <div style={{width:7,height:7,borderRadius:'50%',background:a.c,boxShadow:`0 0 8px ${a.c}`,flexShrink:0}}/>
          </div>
        ))}
      </div>
      <div style={{padding:'0 28px 44px',textAlign:'center'}}>
        <h2 style={{fontSize:28,fontWeight:900,letterSpacing:-0.8,margin:'0 0 8px',lineHeight:1.15,color:'white'}}>YOUR AI CLINICAL<br/><span style={{background:'linear-gradient(135deg,#0a84ff,#30d158)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>TEAM IN ONE PLACE</span></h2>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',margin:'0 0 24px'}}>مساعدك التفاعلي لتحليل الحالات وتحديد الخطة العلاجية بدقة</p>
        <button onClick={()=>goTo(2)} style={CTA_STYLE}>Continue →</button>
      </div>
    </div>,

    // 2 — NO COMPLEXITY
    <div key="s2" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 28px'}}>
        <div style={{width:'100%',animation:'rise 0.5s ease both'}}>
          {/* Glowing phone frame */}
          <div style={{
            background:'rgba(255,255,255,0.04)',
            backdropFilter:'blur(30px)',WebkitBackdropFilter:'blur(30px)',
            borderRadius:28,padding:'20px',
            border:'2px solid rgba(255,107,53,0.45)',
            boxShadow:'0 0 0 8px rgba(255,107,53,0.06), 0 0 60px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {/* App header */}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 16px rgba(139,92,246,0.5)'}}>⚕️</div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:'white',letterSpacing:-0.3}}>Cliniverse <span style={{background:'linear-gradient(135deg,#a78bfa,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI</span></div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:1}}>CLINICAL INTELLIGENCE</div>
              </div>
              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:4,background:'rgba(48,209,88,0.12)',border:'1px solid rgba(48,209,88,0.25)',borderRadius:20,padding:'3px 10px'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#30d158',boxShadow:'0 0 6px #30d158',animation:'pulse 1.5s ease infinite'}}/>
                <span style={{fontSize:9,color:'#30d158',fontWeight:700}}>LIVE</span>
              </div>
            </div>
            {/* Mock SBAR */}
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:16,padding:'12px 14px',border:'1px solid rgba(10,132,255,0.18)',marginBottom:10}}>
              <div style={{fontSize:9,color:'#0a84ff',fontWeight:800,marginBottom:6,letterSpacing:0.8}}>⚡ SBAR · Generated in 3 seconds</div>
              {['S: 58M, crushing chest pain, ST↑ V1-V4','B: HTN, previous PCI 2021, on aspirin','A: HR 110, BP 90/60, Troponin rising','R: Activate Cath Lab — door-to-balloon now'].map((l,i)=>(
                <div key={i} style={{fontSize:11,color:`rgba(255,255,255,${0.9-i*0.1})`,lineHeight:1.7,fontFamily:'monospace'}}>{l}</div>
              ))}
            </div>
            <div style={{background:'rgba(48,209,88,0.08)',borderRadius:14,padding:'10px 12px',border:'1px solid rgba(48,209,88,0.18)'}}>
              <div style={{fontSize:11,color:'rgba(48,209,88,0.9)',lineHeight:1.6}}>✓ تدريب تفاعلي يحاكي البيئة الطبية الحقيقية واستجابات المريض لحظة بلحظة</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'0 28px 44px',textAlign:'center'}}>
        <h2 style={{fontSize:30,fontWeight:900,letterSpacing:-0.8,margin:'0 0 8px',lineHeight:1.1,color:'white'}}>NO PROMPTS<br/><span style={{background:'linear-gradient(135deg,#ff6b35,#ff453a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>NO COMPLEXITY</span></h2>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',margin:'0 0 24px',lineHeight:1.7}}>اختر الحالة أو التخصص وابدأ التدريب فوراً — بدون أي إعداد مسبق</p>
        <button onClick={()=>goTo(3)} style={CTA_STYLE}>Continue →</button>
      </div>
    </div>,

    // 3 — HOW IT WORKS
    <div key="s3" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 28px',gap:0}}>
        {[
          {n:'01',icon:'📥',title:'Select a Specialty',desc:'Cardiology, Emergency, Pharmacy, Nursing, Radiology, Lab — Arabic & English',c:'#0a84ff'},
          {n:'02',icon:'💬',title:'Interact with the AI',desc:'Take history, order labs, make decisions — the AI patient responds realistically',c:'#8b5cf6'},
          {n:'03',icon:'✅',title:'Get Expert Feedback',desc:'Instant evaluation based on ESC, AHA, NICE, BNF international guidelines',c:'#30d158'},
        ].map((s,i)=>(
          <div key={i} style={{display:'flex',gap:16,animation:`rise 0.5s ease ${i*0.15}s both`}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
              <div style={{width:48,height:48,borderRadius:16,background:`${s.c}18`,border:`1px solid ${s.c}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:`0 6px 24px ${s.c}20`,flexShrink:0}}>{s.icon}</div>
              {i<2&&<div style={{width:2,flex:1,margin:'6px 0',background:`linear-gradient(180deg,${s.c}60,transparent)`,borderRadius:1}}/>}
            </div>
            <div style={{paddingTop:8,paddingBottom:i<2?28:0}}>
              <div style={{fontSize:9,color:s.c,fontWeight:800,letterSpacing:2,marginBottom:4}}>{s.n}</div>
              <div style={{fontSize:15,fontWeight:800,color:'white',marginBottom:5}}>{s.title}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',lineHeight:1.7}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 28px 44px',textAlign:'center'}}>
        <h2 style={{fontSize:28,fontWeight:900,letterSpacing:-0.8,margin:'0 0 8px',lineHeight:1.15,color:'white'}}>BOOST YOUR SKILLS<br/><span style={{background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>IN SECONDS</span></h2>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',margin:'0 0 24px'}}>سيناريوهات مصممة لتمكينك من اتخاذ القرارات السريعة والدقيقة</p>
        <button onClick={()=>goTo(4)} style={CTA_STYLE}>Continue →</button>
      </div>
    </div>,

    // 4 — PROMO
    <div key="s4" style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px'}}>
      {/* Radial backdrop */}
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
      {/* Gift */}
      <div style={{fontSize:110,marginBottom:20,animation:'float 3s ease-in-out infinite',filter:'drop-shadow(0 20px 40px rgba(139,92,246,0.4))'}}>🎁</div>
      <p style={{fontSize:18,color:'rgba(255,255,255,0.6)',fontWeight:500,margin:'0 0 4px',textAlign:'center'}}>You've unlocked</p>
      <p style={{fontSize:22,color:'white',fontWeight:900,margin:'0 0 4px',textAlign:'center'}}>a one-time promo code</p>
      <p style={{fontSize:26,fontWeight:900,background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 32px',textAlign:'center'}}>with 90% off</p>
      {/* Code box */}
      <div style={{
        width:'100%',maxWidth:320,
        padding:'22px',borderRadius:24,
        border:`2px solid rgba(255,214,10,${promoShown?0.5:0})`,
        background:`rgba(255,214,10,${promoShown?0.07:0})`,
        backdropFilter:'blur(20px)',
        textAlign:'center',marginBottom:36,
        boxShadow:promoShown?'0 0 50px rgba(255,214,10,0.2)':'none',
        transform:`scale(${promoShown?1:0.7})`,
        opacity:promoShown?1:0,
        transition:'all 0.6s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{fontSize:10,color:'rgba(255,214,10,0.6)',letterSpacing:3,marginBottom:10,fontWeight:700}}>PROMO CODE</div>
        <div style={{fontSize:28,fontWeight:900,color:'#ffd60a',letterSpacing:5,fontFamily:'SF Mono, monospace',textShadow:'0 0 24px rgba(255,214,10,0.6)'}}>CLINIVERSE90</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:10}}>90% off · First month only</div>
      </div>
      <button onClick={()=>goTo(5)} style={{...CTA_STYLE,background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'#0a0015',boxShadow:'0 8px 32px rgba(255,214,10,0.4)'}}>
        Claim Offer →
      </button>
    </div>,

    // 5 — CHECKOUT
    <div key="s5" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Timer bar */}
      <div style={{background:'rgba(255,69,58,0.12)',borderBottom:'1px solid rgba(255,69,58,0.2)',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px #ff453a',animation:'pulse 1s ease infinite'}}/>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:700}}>Promo Code Applied ✓</span>
        </div>
        <div style={{fontSize:20,fontWeight:900,color:'#ff453a',fontFamily:'SF Mono,monospace',letterSpacing:3,textShadow:'0 0 12px rgba(255,69,58,0.6)'}}>{fmt(countdown)}</div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'20px 24px 0',WebkitOverflowScrolling:'touch'}}>
        <h2 style={{fontSize:30,fontWeight:900,letterSpacing:-0.8,margin:'0 0 6px',lineHeight:1.1,color:'white'}}>GET FULL<br/><span style={{background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CLINICAL ACCESS</span></h2>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',margin:'0 0 20px'}}>500+ حالة إكلينيكية وبنك أسئلة شامل للامتحانات الطبية</p>

        {/* Feature list */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {[
            {icon:'🏥',t:'25+ Clinical Cases',s:'STEMI · Sepsis · Stroke · PE · and more'},
            {icon:'🤖',t:'AI Case Generator',s:'Unlimited specialty cases in Arabic & English'},
            {icon:'📋',t:'Clinical Workshop',s:'SBAR · Discharge Writer · Portfolio · Conversations'},
            {icon:'🎓',t:'4 Specialties Hub',s:'Pharmacy · Nursing · Lab · Radiology'},
            {icon:'🌍',t:'Social Hub',s:'Grand Rounds AI · Patient Journey · Crossover'},
            {icon:'⚔️',t:'Gaming Modes',s:'Clinical Duels · Detective · Night Shift · Autopsy'},
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 12px',borderRadius:14,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontSize:20,flexShrink:0}}>{f.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'white',marginBottom:1}}>{f.t}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>{f.s}</div>
              </div>
              <span style={{marginLeft:'auto',color:'#30d158',fontSize:14,flexShrink:0}}>✓</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(10,132,255,0.08))',borderRadius:22,padding:'18px',border:'1px solid rgba(139,92,246,0.3)',textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:11,color:'rgba(139,92,246,0.7)',fontWeight:700,letterSpacing:1,marginBottom:8}}>PROMO CODE APPLIED</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginBottom:4}}>
            <span style={{fontSize:18,color:'rgba(255,255,255,0.25)',textDecoration:'line-through'}}>$9.99/mo</span>
            <span style={{fontSize:42,fontWeight:900,color:'white',letterSpacing:-1}}>$0<span style={{fontSize:22}}>.99</span></span>
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>First month · Then $9.99/mo · Cancel anytime</div>
        </div>

        {/* Simulation toggle */}
        <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:18,background:'rgba(255,214,10,0.06)',border:'1px solid rgba(255,214,10,0.18)',marginBottom:24}}>
          <span style={{fontSize:20}}>🌟</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'white'}}>Simulation Mode</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Auto-generate realistic AI clinical cases</div>
          </div>
          <div style={{width:50,height:28,borderRadius:14,background:'linear-gradient(135deg,#30d158,#0a84ff)',position:'relative',flexShrink:0,boxShadow:'0 4px 16px rgba(48,209,88,0.4)'}}>
            <div style={{position:'absolute',right:4,top:4,width:20,height:20,borderRadius:'50%',background:'white',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}/>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'16px 24px 44px',flexShrink:0,background:'linear-gradient(transparent,rgba(0,0,0,0.5))'}}>
        <button onClick={handleInstall} disabled={installing}
          style={{width:'100%',padding:'19px',borderRadius:22,border:'none',background:installing?'rgba(139,92,246,0.5)':'linear-gradient(135deg,#8b5cf6 0%,#0a84ff 100%)',color:'white',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:'0 10px 40px rgba(139,92,246,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:12,letterSpacing:-0.3}}>
          {installing
            ? <><Spinner/>Installing Cliniverse AI...</>
            : <>📲 Download &amp; Start Training</>
          }
        </button>
        <button onClick={onComplete} style={{width:'100%',padding:'14px',borderRadius:16,border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:'rgba(255,255,255,0.3)',fontSize:13,cursor:'pointer',fontWeight:500}}>
          Continue without installing
        </button>
      </div>
    </div>,
  ]

  // iOS Install Guide Modal
  const IOSModal = () => (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:10000,display:'flex',alignItems:'flex-end',backdropFilter:'blur(10px)'}}>
      <div style={{width:'100%',background:'linear-gradient(180deg,rgba(28,8,58,0.99),rgba(12,4,32,1))',borderRadius:'28px 28px 0 0',padding:'28px 24px 48px',border:'1px solid rgba(139,92,246,0.3)',boxShadow:'0 -20px 60px rgba(0,0,0,0.8)'}}>
        <div style={{width:44,height:4,borderRadius:2,background:'rgba(255,255,255,0.15)',margin:'0 auto 24px'}}/>
        <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:6,textAlign:'center'}}>📲 Add to Home Screen</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:28,textAlign:'center',lineHeight:1.7}}>Install Cliniverse AI for the full native experience</div>
        {[
          {n:1,icon:'⬆️',t:'Tap the Share button in Safari toolbar'},
          {n:2,icon:'➕',t:'Select "Add to Home Screen" from the menu'},
          {n:3,icon:'✅',t:'Tap "Add" — opens like a native app'},
        ].map(s=>(
          <div key={s.n} style={{display:'flex',gap:16,marginBottom:18,alignItems:'center'}}>
            <div style={{width:44,height:44,borderRadius:14,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.icon}</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.5,fontWeight:500}}>{s.t}</div>
          </div>
        ))}
        <button onClick={()=>{setShowIOSModal(false);onComplete()}}
          style={{...CTA_STYLE,marginTop:12}}>Got it — I'll install!</button>
      </div>
    </div>
  )

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position:'fixed',inset:0,
        background:'radial-gradient(ellipse at 30% 15%, #1e0840 0%, #0d0020 45%, #000508 100%)',
        zIndex:9999,
        display:'flex',flexDirection:'column',
        fontFamily:'-apple-system,SF Pro Rounded,SF Pro Display,BlinkMacSystemFont,"Inter var",Inter,sans-serif',
        userSelect:'none',
        WebkitUserSelect:'none',
        overscrollBehavior:'none',
        touchAction:'pan-y',
      }}>

      {/* Safe area top */}
      <div style={{height:'env(safe-area-inset-top, 44px)',flexShrink:0}}/>

      {/* ── STORIES PROGRESS BARS ── */}
      <div style={{display:'flex',gap:4,padding:'8px 16px 0',flexShrink:0}}>
        {Array.from({length:TOTAL}).map((_,i)=>(
          <div key={i} style={{flex:1,height:3,borderRadius:2,overflow:'hidden',background:'rgba(255,255,255,0.18)'}}>
            <div style={{
              height:'100%',
              borderRadius:2,
              background:'white',
              width: i < screen ? '100%'
                   : i === screen && screen < AUTO_SCREENS ? `${progress}%`
                   : i === screen ? '100%'
                   : '0%',
              transition: i < screen || i > screen ? 'none' : 'none',
              boxShadow: i === screen ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
            }}/>
          </div>
        ))}
      </div>

      {/* Skip */}
      {screen < 5 && (
        <button onClick={()=>goTo(5)} style={{position:'absolute',top:'calc(env(safe-area-inset-top,44px) + 16px)',right:20,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',backdropFilter:'blur(10px)',borderRadius:20,color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,padding:'6px 14px',cursor:'pointer',zIndex:10}}>Skip</button>
      )}

      {/* Screen content with live drag */}
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>
        <div style={{
          height:'100%',
          transform:dragTransform,
          transition:isDragging?'none':'transform 0.35s cubic-bezier(.4,0,.2,1)',
          willChange:'transform',
        }}>
          {screens[screen]}
        </div>
      </div>

      {/* Tap zones hint — first screen only */}
      {screen === 0 && (
        <div style={{position:'absolute',bottom:160,left:0,right:0,display:'flex',justifyContent:'center',pointerEvents:'none',opacity:0.4,animation:'fadeHint 3s ease 2s forwards'}}>
          <div style={{fontSize:11,color:'white',letterSpacing:1,fontWeight:500}}>TAP ← → TO NAVIGATE · HOLD TO PAUSE</div>
        </div>
      )}

      {/* Dot indicators (screens 4-5 only — no auto-advance) */}
      {screen >= AUTO_SCREENS && (
        <div style={{display:'flex',justifyContent:'center',gap:7,paddingBottom:8,flexShrink:0}}>
          {[4,5].map(i=>(
            <div key={i} onClick={()=>goTo(i)} style={{width:i===screen?20:7,height:7,borderRadius:4,background:i===screen?'white':'rgba(255,255,255,0.2)',transition:'all 0.3s ease',cursor:'pointer'}}/>
          ))}
        </div>
      )}

      {/* Safe area bottom */}
      <div style={{height:'env(safe-area-inset-bottom,20px)',flexShrink:0}}/>

      {showIOSModal && <IOSModal/>}

      <style>{`
        @keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideR{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.15)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeHint{0%{opacity:0.4}80%{opacity:0.4}100%{opacity:0}}
        html,body{overscroll-behavior:none;overscroll-behavior-y:none}
      `}</style>
    </div>
  )
}

const CTA_STYLE: React.CSSProperties = {
  width:'100%',padding:'18px',borderRadius:22,border:'none',
  background:'white',color:'#0a0015',fontSize:16,fontWeight:800,
  cursor:'pointer',boxShadow:'0 8px 32px rgba(255,255,255,0.15)',
  letterSpacing:-0.3,display:'block',
}

const Spinner = () => (
  <div style={{width:20,height:20,borderRadius:'50%',border:'2.5px solid rgba(255,255,255,0.2)',borderTop:'2.5px solid white',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
)
