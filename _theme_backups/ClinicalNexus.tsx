'use client'
import { useState, useEffect, useCallback } from 'react'

const CASES = [
  {
    id:'nexus1', title:'The Collapsing Patient', tag:'GLOBAL EMERGENCY',
    color:'#ff453a', glow:'rgba(255,69,58,0.5)',
    intro:'03:47 AM. A 52-year-old male collapses in the hospital corridor. You are the first physician on scene. 847 doctors worldwide are watching this case right now.',
    timeline:[
      {time:'00:00',event:'Collapse witnessed. No pulse. Call for help.',vital:{hr:'0',bp:'0/0',spo2:'0%',rr:'0'},ecg:'Ventricular Fibrillation',question:'Your FIRST action?',opts:['Start CPR immediately','Check pulse for 10 seconds','Get defibrillator first','Call ICU'],correct:0,explain:'CPR first — minimize interruptions. Every 10s delay = 10% survival reduction.',globalVote:[67,8,18,7]},
      {time:'02:00',event:'CPR ongoing. AED arrives.',vital:{hr:'0',bp:'0/0',spo2:'0%',rr:'0'},ecg:'VF persists — coarse',question:'AED shows shockable rhythm. CPR quality good. Next?',opts:['Shock immediately','2 more minutes CPR','Adrenaline first','Amiodarone first'],correct:0,explain:'Shock immediately when rhythm identified — minimize pre-shock pause <5s.',globalVote:[72,10,12,6]},
      {time:'04:30',event:'ROSC achieved. GCS 8. Intubated.',vital:{hr:'98',bp:'82/50',spo2:'94%',rr:'14 (ventilated)'},ecg:'Sinus tachycardia. ST elevation II/III/aVF',question:'BP 82/50, ST elevation inferior leads. Priority?',opts:['Cath Lab activation + vasopressor','CT brain first','High-dose steroids','Therapeutic hypothermia only'],correct:0,explain:'Inferior STEMI post-arrest: immediate cath lab. Norepinephrine for haemodynamic support. Targeted temperature management 36°C.',globalVote:[58,22,4,16]},
      {time:'12:00',event:'Post-cath: RCA stented. ICU. TTM 36°C.',vital:{hr:'72',bp:'108/68',spo2:'98%',rr:'14'},ecg:'Normal sinus rhythm. Q waves III/aVF',question:'24h post-arrest. GCS improving. Family asks about prognosis. Best indicator?',opts:['EEG at 24-48h + SSEP at 72h','CT head immediately','Pupil reflexes alone','Withdraw care at 24h'],correct:0,explain:'Neuroprognostication: multimodal — EEG (burst suppression/seizures), SSEP (N20 absence bilateral = poor), pupillary reactivity, MRI at 5 days. Never single indicator.',globalVote:[61,19,9,11]},
    ],
    outcome:'Excellent neurological recovery. Patient discharged day 12, mRS 1. Back to work at 3 months. This outcome is achieved in only 8% of out-of-hospital cardiac arrests globally.',
    keyLearning:['Minimise CPR interruptions — survival falls 10% per 10s delay','Post-arrest: treat the cause (STEMI) simultaneously with supportive care','Neuroprognostication requires multimodal assessment after 72h — never single indicator','Targeted temperature management 36°C equivalent to 33°C (TTM2 trial)'],
  },
  {
    id:'nexus2', title:'The Silent Killer', tag:'DIAGNOSTIC CHALLENGE',
    color:'#bf5af2', glow:'rgba(0,196,180,0.5)',
    intro:'A 34-year-old previously fit female presents with 3 weeks of fatigue. Refused by two GPs. You have 5 minutes. 1,204 doctors worldwide are trying to crack this case.',
    timeline:[
      {time:'Week 3',event:'Fatigue, mild dyspnea, no fever.',vital:{hr:'102',bp:'94/60',spo2:'97%',rr:'18'},ecg:'Sinus tachycardia. Low voltage.',question:'Most discriminating next investigation?',opts:['Echo','D-dimer','Full blood count','Thyroid function'],correct:0,explain:'Low voltage ECG + tachycardia + young female = cardiac tamponade until proven otherwise. Echo is diagnostic.',globalVote:[44,22,28,6]},
      {time:'Echo result',event:'Echo: 3cm circumferential effusion. RV collapse in diastole.',vital:{hr:'118',bp:'88/72',spo2:'95%',rr:'22'},ecg:'Electrical alternans',question:"Beck's triad present. Pulsus paradoxus 22mmHg. Action?",opts:['Emergency pericardiocentesis','IV fluids + watch','Steroids for pericarditis','CT chest first'],correct:0,explain:'Tamponade = obstructive shock. Pericardiocentesis emergent. Cautious IVF as bridge. Echo-guided preferred.',globalVote:[79,11,6,4]},
      {time:'Post-drain',event:'800ml haemoserous fluid drained. BP 112/70. Send fluid.',vital:{hr:'88',bp:'112/70',spo2:'99%',rr:'16'},ecg:'Resolving alternans',question:'Pericardial fluid: haemoserous, LDH high, glucose low, cytology pending. Most likely cause in this age group?',opts:['Malignancy','TB','Viral','Autoimmune'],correct:0,explain:'Haemoserous effusion in young female: malignancy #1 (breast, lymphoma, lung). TB in endemic areas. Send: cytology, culture, ADA, flow cytometry.',globalVote:[52,28,14,6]},
      {time:'Day 5',event:'Cytology: adenocarcinoma cells. CT: bilateral breast mass.',vital:{hr:'76',bp:'118/74',spo2:'99%',rr:'16'},ecg:'Normal sinus rhythm',question:'Stage IV breast cancer with cardiac tamponade. Oncology next step?',opts:['Biopsy + molecular profiling first','Chemotherapy immediately','Palliative care only','Surgery on primary first'],correct:0,explain:'Molecular profiling (HER2, ER/PR, PD-L1) directs therapy. HER2+: trastuzumab. ER+: endocrine therapy. TNBC: chemo ± immunotherapy. Biopsy first always.',globalVote:[68,19,8,5]},
    ],
    outcome:'HER2-positive metastatic breast cancer. Commenced trastuzumab + pertuzumab + docetaxel. PFS 18 months. Cardiac monitoring — LVEF maintained. Still on treatment at 2 years.',
    keyLearning:['Low voltage ECG + young female = tamponade until proven otherwise','Never attribute tachycardia to anxiety in a young patient without excluding cardiac cause','Haemoserous pericardial effusion in young female: malignancy #1','Molecular profiling precedes treatment in metastatic cancer — always'],
  },
]

interface Props { onXP:(n:number)=>void }

export default function ClinicalNexus({ onXP }:Props) {
  const [phase, setPhase] = useState<'hub'|'intro'|'case'|'outcome'>('hub')
  const [active, setActive] = useState<typeof CASES[0]|null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [showGlobal, setShowGlobal] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [viewers, setViewers] = useState(847)
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(()=>{
    const t=setInterval(()=>{
      setPulse(p=>(p+1)%3)
      setViewers(v=>v+Math.floor(Math.random()*3)-1)
    },2000)
    return()=>clearInterval(t)
  },[])

  if(phase==='hub') return(
    <div style={{padding:'0 4px'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.98),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:16,border:'1px solid rgba(139,92,246,0.3)',position:'relative',overflow:'hidden',boxShadow:'0 12px 48px rgba(139,92,246,0.3)'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-30,left:-30,width:150,height:150,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.15),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:pulse===0?'none':'none',opacity:pulse===0?1:0.4,transition:'opacity 0.5s'}}/>
          <span style={{fontSize:11,color:'#ff453a',fontWeight:800,letterSpacing:2}}>LIVE WORLDWIDE</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginLeft:'auto'}}>{viewers.toLocaleString()} doctors online</span>
        </div>

        <div style={{fontSize:13,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>Clinical Nexus</div>
        <div style={{fontSize:26,fontWeight:900,color:'var(--text-primary, white)',letterSpacing:-0.8,marginBottom:8,lineHeight:1.1}}>The Global<br/>Medical Room</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:20}}>Real cases. Real decisions. Real doctors worldwide — voting on the same patient, same time. See how you compare to the global medical community.</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:20}}>
          {[['🌍','Global votes','Real-time'],['🤖','AI Attending','Comments live'],['📊','Your rank','vs world']].map(([i,t,s])=>(
            <div key={t} style={{background:'var(--bg-card,rgba(255,255,255,0.05))',borderRadius:14,padding:'12px 8px',textAlign:'center',border:'1px solid rgba(36,63,82,0.65)'}}>
              <div style={{fontSize:22,marginBottom:4}}>{i}</div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-primary, white)'}}>{t}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases */}
      <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',letterSpacing:2,fontWeight:700,marginBottom:10}}>ACTIVE CASES</div>
      {CASES.map(c=>(
        <div key={c.id} onClick={()=>{setActive(c);setPhase('intro');setStepIdx(0);setSelected(null);setTotalScore(0);setShowExplain(false);setShowGlobal(false)}}
          style={{background:`linear-gradient(135deg,${c.color}10,rgba(0,0,0,0.3))`,borderRadius:22,padding:20,marginBottom:14,border:`1px solid ${c.color}30`,cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:`0 8px 32px ${c.color}15`}}>
          <div style={{position:'absolute',top:-20,right:-20,fontSize:80,opacity:0.05}}>🌍</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:c.color,boxShadow:`0 0 8px ${c.color}`,flexShrink:0}}/>
            <span style={{fontSize:10,color:c.color,fontWeight:800,letterSpacing:1}}>{c.tag}</span>
            <span style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,0.3)'}}>{viewers+Math.floor(Math.random()*200)} watching</span>
          </div>
          <div style={{fontSize:19,fontWeight:900,color:'var(--text-primary, white)',marginBottom:6,letterSpacing:-0.3}}>{c.title}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.6,marginBottom:14}}>{c.intro.substring(0,120)}...</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:8}}>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,background:`${c.color}15`,color:c.color,fontWeight:700,border:`1px solid ${c.color}25`}}>4 decisions</span>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,background:'rgba(255,214,10,0.1)',color:'#ffd60a',fontWeight:700}}>+200 XP</span>
            </div>
            {completed.includes(c.id)&&<span style={{fontSize:18}}>✅</span>}
          </div>
        </div>
      ))}
    </div>
  )

  if(phase==='intro'&&active) return(
    <div style={{padding:'0 4px'}}>
      <button onClick={()=>setPhase('hub')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',color:'rgba(255,255,255,0.9)',padding:'8px 16px',borderRadius:20,fontSize:13,cursor:'pointer',marginBottom:16,fontWeight:600}}>← Back</button>
      <div style={{background:`linear-gradient(145deg,${active.color}12,rgba(10,0,21,0.95))`,borderRadius:24,padding:24,marginBottom:16,border:`1px solid ${active.color}25`,position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 10px #ff453a'}}/>
          <span style={{fontSize:10,color:'#ff453a',fontWeight:800,letterSpacing:2}}>LIVE · {viewers.toLocaleString()} DOCTORS ONLINE</span>
        </div>
        <div style={{fontSize:13,color:active.color,fontWeight:700,letterSpacing:1,marginBottom:8}}>{active.tag}</div>
        <div style={{fontSize:22,fontWeight:900,color:'var(--text-primary, white)',marginBottom:14,letterSpacing:-0.5}}>{active.title}</div>
        <div style={{background:'rgba(255,255,255,0.14)',borderRadius:16,padding:16,border:'1px solid rgba(36,63,82,0.65)'}}>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',lineHeight:1.8}}>{active.intro}</div>
        </div>
      </div>
      <div style={{background:'rgba(255,255,255,0.14)',borderRadius:18,padding:16,marginBottom:16,border:'1px solid rgba(36,63,82,0.60)'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,marginBottom:10,fontWeight:700}}>YOUR CHALLENGE</div>
        {['Make 4 critical decisions in real-time','See how the global medical community voted','AI Attending reveals what actually happened','Your decisions affect the patient outcome'].map((t,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:`${active.color}20`,border:`1px solid ${active.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:active.color,flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:1.5}}>{t}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setPhase('case')} style={{width:'100%',padding:'17px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}aa)`,color:'var(--text-primary, white)',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:`0 8px 32px ${active.glow}`}}>
        🌍 Enter the Global Room →
      </button>
    </div>
  )

  if(phase==='case'&&active){
    const step=active.timeline[stepIdx]
    const isLast=stepIdx===active.timeline.length-1
    const vitalAlert=(v:string)=>parseFloat(v)===0||parseFloat(v)<80

    return(
      <div style={{padding:'0 4px'}}>
        {/* Live header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,background:'rgba(255,69,58,0.08)',borderRadius:16,padding:'10px 14px',border:'1px solid rgba(255,69,58,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px #ff453a'}}/>
            <span style={{fontSize:11,color:'#ff453a',fontWeight:800}}>LIVE</span>
          </div>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{viewers.toLocaleString()} watching · Decision {stepIdx+1}/4</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:600}}>⏰ {step.time}</span>
        </div>

        {/* Event */}
        <div style={{background:'rgba(255,255,255,0.14)',borderRadius:18,padding:16,marginBottom:12,border:'1px solid rgba(36,63,82,0.60)'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',letterSpacing:1.5,marginBottom:6,fontWeight:700}}>SITUATION UPDATE</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary, white)',lineHeight:1.6}}>{step.event}</div>
        </div>

        {/* Vitals */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
          {Object.entries(step.vital).map(([k,v])=>(
            <div key={k} style={{background:vitalAlert(v as string)?'rgba(255,69,58,0.15)':'rgba(255,255,255,0.05)',borderRadius:14,padding:'10px 6px',textAlign:'center',border:vitalAlert(v as string)?'1px solid rgba(255,69,58,0.4)':'1px solid rgba(36,63,82,0.60)'}}>
              <div style={{fontSize:9,color:vitalAlert(v as string)?'#ff453a':'rgba(255,255,255,0.35)',textTransform:'uppercase',marginBottom:3,fontWeight:700}}>{k}</div>
              <div style={{fontSize:13,fontWeight:900,color:vitalAlert(v as string)?'#ff453a':'white'}}>{v as string}</div>
            </div>
          ))}
        </div>

        {/* ECG */}
        <div style={{background:'rgba(48,209,88,0.06)',borderRadius:14,padding:'10px 14px',marginBottom:14,border:'1px solid rgba(48,209,88,0.15)'}}>
          <span style={{fontSize:10,color:'#30d158',fontWeight:700,letterSpacing:1}}>⚡ ECG: </span>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>{step.ecg}</span>
        </div>

        {/* Question */}
        <div style={{background:`linear-gradient(135deg,${active.color}12,rgba(0,0,0,0.2))`,borderRadius:18,padding:16,marginBottom:14,border:`1px solid ${active.color}20`}}>
          <div style={{fontSize:10,color:active.color,fontWeight:800,letterSpacing:1,marginBottom:8}}>🌍 GLOBAL DECISION — {viewers.toLocaleString()} DOCTORS DECIDING</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary, white)',lineHeight:1.6}}>{step.question}</div>
        </div>

        {/* Options */}
        {!selected && !showExplain && (
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
            {step.opts.map((opt,i)=>(
              <button key={i} onClick={()=>{setSelected(i);if(i===step.correct)setTotalScore(p=>p+1);setShowExplain(true)}}
                style={{background:'rgba(255,255,255,0.14)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:16,padding:'14px 16px',fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'rgba(255,255,255,0.4)',flexShrink:0}}>{String.fromCharCode(65+i)}</div>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {showExplain && selected !== null && (
          <div style={{marginBottom:14}}>
            {step.opts.map((opt,i)=>{
              const isCorrect=i===step.correct,isSelected=i===selected
              return(
                <div key={i} style={{background:isCorrect?'rgba(48,209,88,0.12)':isSelected?'rgba(255,69,58,0.12)':'rgba(255,255,255,0.04)',border:`1.5px solid ${isCorrect?'rgba(48,209,88,0.5)':isSelected?'rgba(255,69,58,0.4)':'rgba(255,255,255,0.12)'}`,borderRadius:14,padding:'12px 14px',marginBottom:8,fontSize:13,display:'flex',alignItems:'center',gap:10,color:isCorrect?'#30d158':isSelected?'#ff453a':'rgba(255,255,255,0.5)'}}>
                  <span style={{fontWeight:800}}>{String.fromCharCode(65+i)}.</span>
                  <span style={{flex:1}}>{opt}</span>
                  {isCorrect&&<span>✅</span>}{isSelected&&!isCorrect&&<span>❌</span>}
                </div>
              )
            })}

            {/* Explanation */}
            <div style={{background:'rgba(10,132,255,0.08)',borderRadius:14,padding:14,marginBottom:12,border:'1px solid rgba(0,196,180,0.15)'}}>
              <div style={{fontSize:10,color:'#00C4B4',fontWeight:800,marginBottom:6,letterSpacing:1}}>💡 CLINICAL REASONING</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7}}>{step.explain}</div>
            </div>

            {/* Global vote */}
            <button onClick={()=>setShowGlobal(p=>!p)} style={{width:'100%',padding:'10px',borderRadius:14,border:'1px solid rgba(255,255,255,0.18)',background:'rgba(255,255,255,0.14)',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:10}}>
              🌍 See how {viewers.toLocaleString()} doctors voted {showGlobal?'▲':'▼'}
            </button>
            {showGlobal&&(
              <div style={{background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:14,padding:14,marginBottom:12,border:'1px solid rgba(36,63,82,0.65)'}}>
                {step.opts.map((opt,i)=>(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:12,color:i===step.correct?'#30d158':'rgba(255,255,255,0.55)'}}>{opt}</span>
                      <span style={{fontSize:12,fontWeight:700,color:i===step.correct?'#30d158':'rgba(255,255,255,0.4)'}}>{step.globalVote[i]}%</span>
                    </div>
                    <div style={{height:6,background:'rgba(255,255,255,0.12)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',background:i===step.correct?'#30d158':'rgba(255,255,255,0.12)',width:`${step.globalVote[i]}%`,borderRadius:3,transition:'width 0.8s ease'}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLast
              ?<button onClick={()=>{setStepIdx(p=>p+1);setSelected(null);setShowExplain(false);setShowGlobal(false)}} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${active.color},${active.color}bb)`,color:'var(--text-primary, white)',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:`0 6px 24px ${active.glow}`}}>Next Decision →</button>
              :<button onClick={()=>{onXP(200);if(!completed.includes(active.id))setCompleted(p=>[...p,active.id]);setPhase('outcome')}} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ffd60a,#ff9f0a)',color:'black',fontSize:15,fontWeight:800,cursor:'pointer'}}>🌍 See Patient Outcome +200 XP</button>
            }
          </div>
        )}
      </div>
    )
  }

  if(phase==='outcome'&&active) return(
    <div style={{padding:'0 4px'}}>
      <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.98),rgba(25,8,55,0.95))',borderRadius:24,padding:24,marginBottom:16,border:'1px solid rgba(139,92,246,0.3)',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>🌍</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,marginBottom:6}}>PATIENT OUTCOME</div>
        <div style={{fontSize:20,fontWeight:900,color:'var(--text-primary, white)',marginBottom:16,letterSpacing:-0.3}}>{active.title}</div>
        <div style={{background:'rgba(48,209,88,0.08)',borderRadius:16,padding:16,marginBottom:16,border:'1px solid rgba(48,209,88,0.2)',textAlign:'left'}}>
          <div style={{fontSize:10,color:'#30d158',fontWeight:800,letterSpacing:1,marginBottom:8}}>WHAT HAPPENED</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.85)',lineHeight:1.8}}>{active.outcome}</div>
        </div>
        <div style={{background:`linear-gradient(135deg,${active.color}15,rgba(255,214,10,0.08))`,borderRadius:16,padding:16,marginBottom:16,border:`1px solid ${active.color}25`,textAlign:'left'}}>
          <div style={{fontSize:10,color:'#ffd60a',fontWeight:800,letterSpacing:1,marginBottom:10}}>KEY LEARNING POINTS</div>
          {active.keyLearning.map((k,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:10,alignItems:'flex-start'}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(255,214,10,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#ffd60a',flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.6}}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{background:'rgba(139,92,246,0.1)',borderRadius:16,padding:14,marginBottom:20,border:'1px solid rgba(139,92,246,0.3)'}}>
          <div style={{fontSize:10,color:'#6ee7e1',fontWeight:800,letterSpacing:1,marginBottom:4}}>YOUR SCORE</div>
          <div style={{fontSize:36,fontWeight:900,color:'#ffd60a'}}>{totalScore}/4</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:4}}>vs global average: {Math.round((active.timeline.reduce((a,s)=>a+s.globalVote[s.correct],0)/active.timeline.length))}%</div>
        </div>
        <button onClick={()=>setPhase('hub')} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:15,fontWeight:700,cursor:'pointer'}}>← Back to Nexus</button>
      </div>
    </div>
  )

  return null
}
