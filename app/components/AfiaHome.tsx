import NutritionCard from './NutritionCard'
'use client'
import { useState } from 'react'
import MentalWellness from './MentalWellness'
import MyMedications from './MyMedications'
import FamilySwitcher from './FamilySwitcher'
import SymptomChecker from './SymptomChecker'

const L = {
  // Brand & Semantic — Afia 2026
  teal:    '#00B4A6',
  deepTeal:'#008F84',
  cobalt:  '#2B6DE5',
  sage:    '#22C55E',
  violet:  '#AF52DE',
  purple:  '#5856D6',
  cyan:    '#32ADE6',
  orange:  '#F59E0B',
  red:     '#EF4444',
  // Neutrals
  canvas:  '#F7FAFA',
  surface: '#FFFFFF',
  border:  '#E6ECF0',
  muted:   '#647280',
  text:    '#1F2937',
  subtext: '#4B5563',
  // Gradients
  gradient:'linear-gradient(135deg,#00B4A6,#2B6DE5)',
  gradientSoft:'linear-gradient(135deg,rgba(0,180,166,0.12),rgba(43,109,229,0.12))',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

// ── PATIENT HOME ──────────────────────────────────────
function PatientHome({ onBack }:{ onBack:()=>void }) {
  const [pressed, setPressed] = useState<string|null>(null)
  const [showNutrition, setShowNutrition] = useState(false)
  const [showSymptomChecker, setShowSymptomChecker] = useState(false)
  const [showMentalWellness, setShowMentalWellness] = useState(false)
  const [showMyMedications, setShowMyMedications] = useState(false)

  if (showMyMedications) {
    return <MyMedications onBack={() => setShowMyMedications(false)} />
  }

  if (showMentalWellness) {
    return <MentalWellness onBack={() => setShowMentalWellness(false)} />
  }

  if (showNutrition) return <NutritionCard onBack={() => setShowNutrition(false)} />
  if (showSymptomChecker) {
    return <SymptomChecker onBack={()=>setShowSymptomChecker(false)}/>
  }

  const SERVICES = [
    {
      id:'symptoms',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>',
      label:'Symptom Checker',
      sub:'AI-powered symptom analysis',
      color:'#00B4A6',
      img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    },
    {
      id:'medications',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 3h6l1 4H8L9 3zM4 7h16v2a9 9 0 0 1-9 9 9 9 0 0 1-9-9V7z"/></svg>',
      label:'My Medications',
      sub:'Track meds · Set reminders',
      color:'#2B6DE5',
      img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    },
    {
      id:'nutrition',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9S3 15.97 3 11a9 9 0 0 1 9-9z"/><path d="M12 6v6l4 2"/></svg>',
      label:'Nutrition Guide',
      sub:'Personalized diet · Calories',
      color:'#22C55E',
      img:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    },
    {
      id:'mental',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A6.5 6.5 0 0 1 16 8.5c0 2.5-1.5 4.5-3.5 5.5v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2C5.5 13 4 11 4 8.5A6.5 6.5 0 0 1 9.5 2z"/><path d="M8 18h8"/></svg>',
      label:'Mental Wellness',
      sub:'Stress · Sleep · Mindfulness',
      color:'#AF52DE',
      img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    },
    {
      id:'exercise',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="13" cy="5" r="2"/><path d="m20 12-5-3-2 5-4-2-4 6"/></svg>',
      label:'Exercise Rx',
      sub:'Personalized workout plan',
      color:'#F59E0B',
      img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    },
    {
      id:'hospital',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
      label:'Find Hospital',
      sub:'Nearest + wait times · Open now',
      color:'#EF4444',
      img:'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80',
    },
    {
      id:'teleconsult',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      label:'Teleconsultation',
      sub:'Video · Chat · Voice',
      color:'#5856D6',
      img:'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
      badge:'PRO',
    },
    {
      id:'labs',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2v9.5l4 7a2 2 0 0 1-1.8 3H7.3a2 2 0 0 1-1.8-3l4-7V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>',
      label:'Lab Results',
      sub:'Upload · Analyze · Track',
      color:'#32ADE6',
      img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
      badge:'PRO',
    },
]

  const TRAVEL_HEALTH = [
    { icon:'✈️', label:'Flight Health', sub:'DVT prevention · Jet lag', color:L.cobalt },
    { icon:'🚶', label:'Walking Guide', sub:'Steps · Distance · Posture', color:L.teal },
    { icon:'🧳', label:'Travel Meds', sub:'Vaccines · First aid kit', color:L.sage },
    { icon:'🌍', label:'Health Abroad', sub:'Insurance · Emergency contacts', color:L.violet },
  ]

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:100,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:220,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.88))'}}/>
        <button onClick={onBack} style={{
          position:'absolute',top:16,left:16,
          background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:12,padding:'8px 16px',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',
        }}>← Back</button>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,
            color:'rgba(255,255,255,0.7)',marginBottom:6}}>
            AFIA · عافية · HEALTH FOR EVERYONE
          </div>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>
            Your Health Companion
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>
            AI-powered · Evidence-based · Always with you
          </div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>

        <FamilySwitcher />

        {/* Travel & Mobility — Most needed globally */}
        <div style={{background:L.surface,border:`1px solid ${L.border}`,
          borderLeft:'4px solid #1E40AF',
          borderRadius:20,padding:'16px 18px',marginBottom:16,boxShadow:L.shadowSm}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:12}}>
            ✈️ TRAVEL & MOBILITY HEALTH
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {TRAVEL_HEALTH.map(t=>(
              <div key={t.id} style={{
                background:`${t.color}08`,border:`1px solid ${t.color}20`,
                borderRadius:14,padding:'12px 10px',cursor:'pointer',
              }}>
                <div style={{fontSize:22,marginBottom:6}}>{t.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:L.textPrimary,marginBottom:2}}>{t.label}</div>
                <div style={{fontSize:11,color:L.textMuted}}>{t.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Services */}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>
          HEALTH SERVICES
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {SERVICES.map(s=>(
            <div key={s.id}
              onClick={()=>{
                if (s.id==='symptoms') setShowSymptomChecker(true);
                if (s.id==='mental') setShowMentalWellness(true);
                if (s.id==='medications') setShowMyMedications(true);
                if (s.id==='nutrition') setShowNutrition(true);
              }}
              onMouseDown={()=>setPressed(s.id)} onMouseUp={()=>setPressed(null)}
              style={{
                position:'relative',
                borderRadius:20,
                overflow:'hidden',
                cursor:'pointer',
                background:'#FFFFFF',
                border:'1px solid #E6ECF0',
                boxShadow: pressed===s.id
                  ? '0 1px 4px rgba(0,0,0,0.08)'
                  : '0 2px 12px rgba(0,0,0,0.06)',
                transform: pressed===s.id ? 'scale(0.97)' : 'scale(1)',
                transition:'all 0.2s cubic-bezier(0.25,0.1,0.25,1)',
              }}>
              {/* Background image */}
              <img src={s.img} alt=""
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.18}}/>
              {/* Color overlay */}
              <div style={{
                position:'absolute',inset:0,
                background:`linear-gradient(135deg,${s.color}22,${s.color}08)`,
              }}/>
              {/* PRO badge */}
              {s.badge && (
                <div style={{
                  position:'absolute',top:10,right:10,zIndex:2,
                  background:'linear-gradient(135deg,#F59E0B,#EF4444)',
                  color:'white',fontSize:9,fontWeight:800,
                  padding:'2px 7px',borderRadius:99,letterSpacing:0.5,
                }}>PRO</div>
              )}
              {/* Content */}
              <div style={{position:'relative',zIndex:1,padding:'16px 14px 14px'}}>
                {/* Icon */}
                <div style={{
                  width:40,height:40,borderRadius:12,marginBottom:10,
                  background:`linear-gradient(135deg,${s.color},${s.color}cc)`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:`0 4px 12px ${s.color}40`,
                }}
                  dangerouslySetInnerHTML={{__html:s.icon.replace(/strokeWidth="2"/g,'strokeWidth="2" width="20" height="20"')}}
                />
                {/* Labels */}
                <div style={{
                  fontSize:13,fontWeight:700,
                  color:'#1F2937',marginBottom:3,lineHeight:1.2,
                }}>
                  {s.label}
                </div>
                <div style={{fontSize:11,color:'#647280',lineHeight:1.4}}>
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRO Subscription */}
        <div style={{
          background:L.gradientWarm,borderRadius:20,padding:'18px',marginBottom:16,
          boxShadow:'0 4px 20px rgba(219,39,119,0.25)',
        }}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.8)',marginBottom:8}}>
            AFIA PRO
          </div>
          <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:6}}>
            Upgrade for Full Access
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',marginBottom:14,lineHeight:1.6}}>
            Teleconsultation · Lab analysis · Unlimited AI · Travel health kit
          </div>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,background:'rgba(255,255,255,0.15)',borderRadius:12,padding:'10px',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:'white'}}>$4.99</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.7)'}}>/month</div>
            </div>
            <div style={{flex:1,background:'rgba(255,255,255,0.25)',borderRadius:12,padding:'10px',textAlign:'center',border:'1px solid rgba(255,255,255,0.4)'}}>
              <div style={{fontSize:11,fontWeight:800,color:'white',marginBottom:2}}>BEST VALUE</div>
              <div style={{fontSize:18,fontWeight:900,color:'white'}}>$39.99</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.7)'}}>/year</div>
            </div>
          </div>
          <button style={{
            width:'100%',marginTop:12,padding:'13px',borderRadius:14,border:'none',
            background:'rgba(255,255,255,0.95)',color:L.pink,
            fontSize:14,fontWeight:800,cursor:'pointer',
          }}>
            Start Free Trial — 7 Days
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',
          borderRadius:16,padding:'12px 16px'}}>
          <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
            ⚠️ Afia is for general health information only. Always consult a qualified healthcare provider for medical decisions.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AFIA HOME — Main Entry ────────────────────────────
export default function AfiaHome({ onSelect, savedType, onClose }:{ onSelect:(type:string,skip?:boolean)=>void, savedType?:string, onClose?:()=>void }) {
  const [view, setView]     = useState<'home'|'patient'|'register'>(savedType==='patient' ? 'patient' : 'home')
  const [pressed, setPressed] = useState<string|null>(null)

  if(view==='patient') return <PatientHome onBack={()=>setView('home')}/>

  return (
    <div style={{minHeight:'100vh',background:L.canvas,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:280,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.95))'}}/>
        <div style={{position:'absolute',bottom:24,left:20,right:20,textAlign:'center'}}>
          <div style={{
            width:72,height:72,borderRadius:22,
            background:L.gradient,
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 16px',
            boxShadow:'0 8px 32px rgba(13,148,136,0.4)',
          }}>
            <svg width="36" height="24" viewBox="0 0 44 32" fill="none">
              <polyline points="0,16 6,16 10,4 14,28 18,10 22,22 26,16 36,16 40,10 44,16"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{fontSize:32,fontWeight:900,color:'white',letterSpacing:-1,marginBottom:6}}>
            Afia · عافية
          </div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.75)',lineHeight:1.6}}>
            Intelligent health companion for everyone
          </div>
        </div>
      </div>

      {/* Who are you? */}
      <div style={{padding:'24px 20px'}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:6}}>
            PERSONALIZE YOUR EXPERIENCE
          </div>
          <div style={{fontSize:22,fontWeight:800,color:L.textPrimary,letterSpacing:-0.4}}>
            Who are you?
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>

          {/* Doctor */}
          <button onClick={()=>onSelect('doctor',true)}
            onMouseDown={()=>setPressed('doc')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px',borderRadius:20,border:'none',cursor:'pointer',
              background:L.gradient,color:'white',
              display:'flex',alignItems:'center',gap:14,
              transform:pressed==='doc'?'scale(0.97)':'scale(1)',
              transition:spring,boxShadow:L.shadowGlow,
            }}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(255,255,255,0.15)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
              👨‍⚕️
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:16,fontWeight:800,marginBottom:3}}>Doctor / Medical Student</div>
              <div style={{fontSize:12,opacity:0.85}}>Clinical cases · Global room · Board prep · Arsenal</div>
            </div>
            <div style={{marginLeft:'auto',fontSize:20,opacity:0.7}}>›</div>
          </button>

          {/* Patient */}
          <button onClick={()=>setView('patient')}
            onMouseDown={()=>setPressed('pat')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px',borderRadius:20,border:`1.5px solid ${L.border}`,cursor:'pointer',
              background:L.surface,
              display:'flex',alignItems:'center',gap:14,
              transform:pressed==='pat'?'scale(0.97)':'scale(1)',
              transition:spring,boxShadow:L.shadowSm,
            }}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(219,39,119,0.08)',
              border:'1px solid rgba(219,39,119,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
              🏥
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:16,fontWeight:800,color:L.textPrimary,marginBottom:3}}>Patient / Family Member</div>
              <div style={{fontSize:12,color:L.textMuted}}>Health guide · Symptoms · Medications · Nutrition</div>
            </div>
            <div style={{marginLeft:'auto',fontSize:20,color:L.textMuted}}>›</div>
          </button>

          {/* General Public */}
          <button onClick={()=>setView('patient')}
            onMouseDown={()=>setPressed('gen')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px',borderRadius:20,border:`1.5px solid ${L.border}`,cursor:'pointer',
              background:L.surface,
              display:'flex',alignItems:'center',gap:14,
              transform:pressed==='gen'?'scale(0.97)':'scale(1)',
              transition:spring,boxShadow:L.shadowSm,
            }}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(13,148,136,0.08)',
              border:'1px solid rgba(13,148,136,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
              🌍
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:16,fontWeight:800,color:L.textPrimary,marginBottom:3}}>General Public</div>
              <div style={{fontSize:12,color:L.textMuted}}>Wellness · Travel health · Fitness · Mental health</div>
            </div>
            <div style={{marginLeft:'auto',fontSize:20,color:L.textMuted}}>›</div>
          </button>

          {/* Student */}
          <button onClick={()=>onSelect('doctor',true)}
            onMouseDown={()=>setPressed('stu')} onMouseUp={()=>setPressed(null)}
            style={{
              width:'100%',padding:'18px',borderRadius:20,border:`1.5px solid ${L.border}`,cursor:'pointer',
              background:L.surface,
              display:'flex',alignItems:'center',gap:14,
              transform:pressed==='stu'?'scale(0.97)':'scale(1)',
              transition:spring,boxShadow:L.shadowSm,
            }}>
            <div style={{width:52,height:52,borderRadius:16,background:'rgba(124,58,237,0.08)',
              border:'1px solid rgba(124,58,237,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
              📚
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:16,fontWeight:800,color:L.textPrimary,marginBottom:3}}>Medical Student / Nurse</div>
              <div style={{fontSize:12,color:L.textMuted}}>Clinical training · MCQs · Board exam prep</div>
            </div>
            <div style={{marginLeft:'auto',fontSize:20,color:L.textMuted}}>›</div>
          </button>
        </div>

        {/* Features preview */}
        <div style={{background:L.raised,borderRadius:20,padding:'16px',marginBottom:16,border:`1px solid ${L.border}`}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:12}}>
            WHAT'S INSIDE
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {icon:'🤖',text:'AI Health Assistant — Claude powered',free:true},
              {icon:'🗺️',text:'Find nearest hospital — real-time',free:true},
              {icon:'💊',text:'Medication tracker + reminders',free:true},
              {icon:'✈️',text:'Travel health — DVT, jet lag, vaccines',free:true},
              {icon:'📱',text:'Video teleconsultation with doctors',free:false},
              {icon:'🧪',text:'Lab results AI analysis',free:false},
            ].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:16}}>{f.icon}</span>
                <span style={{fontSize:13,color:L.textSub,flex:1}}>{f.text}</span>
                <span style={{
                  fontSize:9,fontWeight:700,
                  color:f.free?L.sage:L.amber,
                  background:f.free?'rgba(16,185,129,0.1)':'rgba(245,183,49,0.1)',
                  borderRadius:99,padding:'2px 8px',
                }}>{f.free?'FREE':'PRO'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:11,color:L.textMuted,lineHeight:1.6}}>
            By continuing you agree to our Terms & Privacy Policy
          </div>
          <div style={{fontSize:11,color:L.textMuted,marginTop:4}}>
            ⚠️ Not a substitute for professional medical advice
          </div>
        </div>
      </div>
    </div>
  )
}
