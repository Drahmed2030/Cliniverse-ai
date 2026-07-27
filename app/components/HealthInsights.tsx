'use client'
import { useState, useEffect } from 'react'

// ── APPLE HEALTH STYLE ACTIVITY RINGS ──
const Ring = ({ value, max, color, size=80, stroke=8, label, sublabel }: any) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const offset = circ * (1 - pct)
  return (
    <div style={{ position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
      <svg width={size} height={size} style={{ position:'absolute', top:0, left:0, transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(.2,.9,.3,1)', filter:`drop-shadow(0 0 6px ${color}88)` }}/>
      </svg>
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div style={{ fontSize:13, fontWeight:900, color, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontWeight:600, marginTop:1 }}>{sublabel}</div>
      </div>
    </div>
  )
}

// ── DRUG INTERACTION DATA ──
const DRUGS = [
  'Warfarin', 'Aspirin', 'Clopidogrel', 'Heparin', 'Enoxaparin',
  'Metoprolol', 'Atenolol', 'Amlodipine', 'Lisinopril', 'Ramipril',
  'Furosemide', 'Spironolactone', 'Digoxin', 'Amiodarone', 'Atorvastatin',
  'Simvastatin', 'Metformin', 'Insulin', 'Glibenclamide', 'Sitagliptin',
  'Omeprazole', 'Pantoprazole', 'Clarithromycin', 'Erythromycin', 'Fluconazole',
  'Rifampicin', 'Phenytoin', 'Carbamazepine', 'Lithium', 'Haloperidol',
  'Morphine', 'Tramadol', 'NSAIDs', 'Prednisolone', 'Dexamethasone',
  'Ciprofloxacin', 'Gentamicin', 'Vancomycin', 'Co-trimoxazole', 'Metronidazole',
]

type Severity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR'

interface Interaction {
  severity: Severity
  mechanism: string
  effect: string
  management: string
}

const INTERACTIONS: Record<string, Interaction> = {
  'Warfarin+Aspirin': { severity:'MAJOR', mechanism:'Additive antiplatelet + anticoagulant effect', effect:'Significantly increased bleeding risk', management:'Avoid combination unless dual indication (e.g. ACS + AF). Monitor INR closely. Use PPI cover.' },
  'Warfarin+Clarithromycin': { severity:'MAJOR', mechanism:'CYP2C9 inhibition → reduced warfarin metabolism', effect:'INR markedly elevated → bleeding risk', management:'Reduce warfarin dose 25-50%. Monitor INR every 2-3 days during and 1 week after antibiotic.' },
  'Warfarin+Fluconazole': { severity:'CONTRAINDICATED', mechanism:'Potent CYP2C9 inhibitor → warfarin accumulation', effect:'Severe INR elevation, life-threatening bleeding', management:'Avoid if possible. If essential, reduce warfarin 50%, daily INR monitoring.' },
  'Warfarin+Rifampicin': { severity:'MAJOR', mechanism:'CYP2C9 induction → increased warfarin metabolism', effect:'Sub-therapeutic INR → thrombosis', management:'Increase warfarin dose significantly. Monitor INR frequently. INR may drop within 5-7 days.' },
  'Warfarin+NSAIDs': { severity:'MAJOR', mechanism:'GI mucosal damage + antiplatelet effect', effect:'GI bleed risk 3-15x increased', management:'Avoid NSAIDs. Use paracetamol for analgesia. If essential, add PPI and monitor INR.' },
  'Metformin+Contrast': { severity:'MAJOR', mechanism:'Contrast → AKI risk → metformin accumulation → lactic acidosis', effect:'Potentially fatal lactic acidosis', management:'Hold metformin 48h before/after IV contrast. Check eGFR. Resume if eGFR stable.' },
  'Digoxin+Amiodarone': { severity:'MAJOR', mechanism:'Amiodarone inhibits P-glycoprotein → digoxin level doubles', effect:'Digoxin toxicity: nausea, bradycardia, heart block, arrhythmias', management:'Halve digoxin dose when starting amiodarone. Monitor digoxin levels and ECG.' },
  'Simvastatin+Clarithromycin': { severity:'CONTRAINDICATED', mechanism:'CYP3A4 inhibition → simvastatin accumulation', effect:'Severe myopathy/rhabdomyolysis → AKI', management:'Stop simvastatin during clarithromycin course. Use pravastatin (not CYP3A4 metabolised) if statin essential.' },
  'Simvastatin+Amiodarone': { severity:'MAJOR', mechanism:'CYP3A4 inhibition by amiodarone', effect:'Myopathy/rhabdomyolysis risk', management:'Max simvastatin 20mg with amiodarone. Consider switching to rosuvastatin or pravastatin.' },
  'ACE+Spironolactone': { severity:'MAJOR', mechanism:'Both retain K+: ACE reduces aldosterone + spironolactone blocks aldosterone', effect:'Hyperkalaemia → arrhythmias', management:'Monitor K+ closely (1, 4, 8 weeks). Avoid if K+ > 5.0 or eGFR < 30.' },
  'Metoprolol+Verapamil': { severity:'CONTRAINDICATED', mechanism:'Additive AV node suppression + negative inotropy', effect:'Complete heart block, asystole, severe bradycardia', management:'Avoid combination. If AF + HF: use beta-blocker OR rate-limiting CCB, never together.' },
  'Lithium+NSAIDs': { severity:'MAJOR', mechanism:'NSAIDs reduce renal prostaglandins → lithium retention', effect:'Lithium toxicity: tremor, ataxia, seizures, AKI', management:'Avoid NSAIDs in lithium patients. Use paracetamol. If necessary: reduce dose, monitor levels daily.' },
  'Tramadol+SSRIs': { severity:'MAJOR', mechanism:'Serotonin syndrome: both increase serotonergic activity', effect:'Agitation, hyperthermia, clonus, seizures', management:'Avoid combination. Use opioids (morphine, oxycodone) instead of tramadol in SSRI patients.' },
  'Ciprofloxacin+Warfarin': { severity:'MAJOR', mechanism:'CYP1A2/2C9 inhibition + gut flora reduction', effect:'INR elevation → bleeding risk', management:'Monitor INR every 2-3 days. May need warfarin dose reduction 20-30%.' },
  'Gentamicin+Vancomycin': { severity:'MAJOR', mechanism:'Additive nephrotoxicity and ototoxicity', effect:'AKI + hearing loss risk significantly increased', management:'Monitor renal function daily, drug levels. Avoid prolonged combination. Keep well hydrated.' },
  'Aspirin+Clopidogrel': { severity:'MODERATE', mechanism:'Dual antiplatelet mechanism', effect:'Increased bleeding vs thrombosis benefit in ACS', management:'Indicated in ACS/PCI (DAPT). Use PPI (omeprazole/lansoprazole). Not indefinitely.' },
  'Furosemide+Gentamicin': { severity:'MAJOR', mechanism:'Additive ototoxicity. Loop diuretics potentiate aminoglycoside inner ear damage', effect:'Permanent deafness', management:'Avoid combination. If essential: lowest gentamicin dose, TDM, hearing assessment.' },
  'NSAIDs+ACE': { severity:'MODERATE', mechanism:'NSAIDs blunt prostaglandin-mediated vasodilation → reduce ACE antihypertensive effect + AKI risk (triple whammy with diuretics)', effect:'Hypertension, AKI especially with diuretics', management:'Avoid in CKD, elderly, HF. Paracetamol preferred. If essential: monitor BP, renal function, K+.' },
}

const getSeverityConfig = (s: Severity) => {
  if (s === 'CONTRAINDICATED') return { color:'#7f1d1d', bg:'rgba(254,202,202,0.8)', border:'rgba(220,38,38,0.3)', dot:'#dc2626' }
  if (s === 'MAJOR') return { color:'#7c2d12', bg:'rgba(254,215,170,0.8)', border:'rgba(234,88,12,0.3)', dot:'#ea580c' }
  if (s === 'MODERATE') return { color:'#713f12', bg:'rgba(254,240,138,0.8)', border:'rgba(202,138,4,0.3)', dot:'#ca8a04' }
  return { color:'#86efac', bg:'rgba(48,209,88,0.1)', border:'rgba(48,209,88,0.3)', dot:'#30d158' }
}

export default function HealthInsights({ xp=0, casesCompleted=0, mcqCorrect=0, mcqTotal=0, streak=0 }: {
  xp?: number, casesCompleted?: number, mcqCorrect?: number, mcqTotal?: number, streak?: number
}) {
  const [activeTab, setActiveTab] = useState<'insights'|'drugs'>('insights')
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [noInteraction, setNoInteraction] = useState(false)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => { setTimeout(() => setAnimated(true), 100) }, [])

  const checkInteraction = () => {
    if (!drug1 || !drug2) return
    const key1 = `${drug1}+${drug2}`
    const key2 = `${drug2}+${drug1}`
    const result = INTERACTIONS[key1] || INTERACTIONS[key2]
    if (result) { setInteraction(result); setNoInteraction(false) }
    else { setInteraction(null); setNoInteraction(true) }
  }

  const accuracy = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0
  const weeklyXP = xp
  const weeklyGoal = 500
  const caseGoal = 10

  const filtered1 = DRUGS.filter(d => d.toLowerCase().includes(search1.toLowerCase()) && d !== drug2).slice(0, 6)
  const filtered2 = DRUGS.filter(d => d.toLowerCase().includes(search2.toLowerCase()) && d !== drug1).slice(0, 6)

  return (
    <div style={{ fontFamily:'-apple-system,sans-serif', paddingBottom:20 }}>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:'white', margin:'0 0 4px', letterSpacing:-0.5 }}>Clinical Dashboard</h2>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>Health insights & drug interactions</p>
      </div>

      {/* Tab Toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:16, background:'rgba(255,255,255,0.11)', backdropFilter:'blur(12px)', borderRadius:16, padding:5, border:'1px solid rgba(139,92,246,0.25)' }}>
        {[{id:'insights',icon:'📊',label:'Weekly Insights'},{id:'drugs',icon:'💊',label:'Drug Checker'}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id as any)} style={{ flex:1, padding:'10px 8px', borderRadius:12, border:'none', background:activeTab===t.id?'rgba(139,92,246,0.3)':'transparent', cursor:'pointer', fontSize:13, fontWeight:700, color:activeTab===t.id?'#0a84ff':'rgba(255,255,255,0.35)', boxShadow:activeTab===t.id?'0 2px 8px rgba(0,0,0,0.08)':'none', transition:'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── INSIGHTS ── */}
      {activeTab === 'insights' && (
        <div>
          {/* Activity Rings — Apple Health Style */}
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,0.95),rgba(10,15,30,0.98))', backdropFilter:'blur(40px)', borderRadius:22, padding:22, marginBottom:14, border:'1px solid rgba(255,255,255,0.18)', color:'white', overflow:'hidden', position:'relative' }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent)', pointerEvents:'none' }}/>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase', marginBottom:16, fontWeight:700 }}>This Week's Activity</div>
            <div style={{ display:'flex', justifyContent:'space-around', alignItems:'center', marginBottom:18 }}>
              <div style={{ textAlign:'center' }}>
                {animated && <Ring value={casesCompleted} max={caseGoal} color="#ff3b30" size={88} stroke={9} sublabel="CASES"/>}
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:6, fontWeight:600 }}>Move</div>
              </div>
              <div style={{ textAlign:'center' }}>
                {animated && <Ring value={Math.min(weeklyXP, weeklyGoal)} max={weeklyGoal} color="#30d158" size={88} stroke={9} sublabel="XP"/>}
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:6, fontWeight:600 }}>Exercise</div>
              </div>
              <div style={{ textAlign:'center' }}>
                {animated && <Ring value={accuracy} max={100} color="#0a84ff" size={88} stroke={9} sublabel="%"/>}
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:6, fontWeight:600 }}>Accuracy</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[
                {label:'Cases Done', value:casesCompleted, unit:'', color:'#ff3b30', goal:`/${caseGoal} goal`},
                {label:'XP Earned', value:weeklyXP, unit:'', color:'#30d158', goal:`/${weeklyGoal} goal`},
                {label:'MCQ Accuracy', value:`${accuracy}`, unit:'%', color:'#0a84ff', goal:`${mcqTotal} answered`},
              ].map(s=>(
                <div key={s.label} style={{ background:'rgba(255,255,255,0.11)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:14, padding:'12px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, letterSpacing:-1 }}>{s.value}{s.unit}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:3, fontWeight:600, textTransform:'uppercase', letterSpacing:0.3 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', marginTop:2 }}>{s.goal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak + Rank Progress */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            <div style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(20px)', borderRadius:18, padding:16, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'none' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:1, marginBottom:8, textTransform:'uppercase' }}>Daily Streak</div>
              <div style={{ fontSize:36, fontWeight:900, color:'#ff9500', lineHeight:1 }}>{streak}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>days in a row 🔥</div>
              <div style={{ height:4, background:'rgba(0,0,0,0.06)', borderRadius:2, overflow:'hidden', marginTop:10 }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#ff9500,#ff6b35)', width:`${Math.min(streak/7,1)*100}%`, borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Goal: 7-day streak</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(20px)', borderRadius:18, padding:16, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'none' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:1, marginBottom:8, textTransform:'uppercase' }}>Total XP</div>
              <div style={{ fontSize:36, fontWeight:900, color:'#8b5cf6', lineHeight:1 }}>{xp}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>clinical points</div>
              <div style={{ height:4, background:'rgba(0,0,0,0.06)', borderRadius:2, overflow:'hidden', marginTop:10 }}>
                <div style={{ height:'100%', background:'linear-gradient(90deg,#8b5cf6,#0a84ff)', width:`${Math.min(xp/1000,1)*100}%`, borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Goal: 1000 XP</div>
            </div>
          </div>

          {/* Weekly Performance Chart */}
          <div style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(20px)', borderRadius:18, padding:18, marginBottom:14, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'none' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:14 }}>Weekly Activity</div>
            <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60 }}>
              {['M','T','W','T','F','S','S'].map((day,i)=>{
                const h = [40,70,55,90,65,30,80][i]
                const isToday = i === new Date().getDay() - 1
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', height:`${h}%`, borderRadius:6, background:isToday?'linear-gradient(180deg,#0a84ff,#8b5cf6)':'rgba(10,132,255,0.15)', transition:'height 1s ease', boxShadow:isToday?'0 4px 12px rgba(10,132,255,0.3)':'none' }}/>
                    <div style={{ fontSize:9, color:isToday?'#0a84ff':'#94a3b8', fontWeight:isToday?800:600 }}>{day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Clinical Tip of the Day */}
          <div style={{ background:'linear-gradient(135deg,rgba(10,132,255,0.08),rgba(139,92,246,0.06))', backdropFilter:'blur(12px)', borderRadius:18, padding:16, border:'1px solid rgba(10,132,255,0.15)' }}>
            <div style={{ fontSize:11, color:'#0a84ff', fontWeight:800, letterSpacing:1, marginBottom:8 }}>💡 CLINICAL TIP OF THE DAY</div>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.75, margin:0, fontWeight:500 }}>
              In STEMI with cardiogenic shock, primary PCI is preferred even if symptom onset is more than 12h. Intra-aortic balloon pump does not reduce 30-day mortality (IABP-SHOCK II trial) but remains an option for refractory cases.
            </p>
          </div>
        </div>
      )}

      {/* ── DRUG INTERACTION CHECKER ── */}
      {activeTab === 'drugs' && (
        <div>
          <div style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(20px)', borderRadius:20, padding:18, marginBottom:14, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'none' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:14 }}>💊 Drug Interaction Checker</div>

            {/* Drug 1 */}
            <div style={{ marginBottom:12, position:'relative' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:1, marginBottom:6, textTransform:'uppercase' }}>Drug 1</div>
              <input value={drug1||search1} onChange={e=>{setSearch1(e.target.value);setDrug1('');setShow1(true);setInteraction(null);setNoInteraction(false)}} onFocus={()=>setShow1(true)} placeholder="Search drug..." style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`2px solid ${drug1?'#0a84ff':'rgba(0,0,0,0.08)'}`, background:drug1?'rgba(10,132,255,0.05)':'rgba(255,255,255,0.05)', fontSize:14, fontWeight:drug1?700:400, color:drug1?'#0a84ff':'rgba(255,255,255,0.35)', outline:'none', boxSizing:'border-box' }}/>
              {show1 && search1 && !drug1 && filtered1.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'rgba(28,10,50,0.97)', backdropFilter:'blur(20px)', borderRadius:14, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)', zIndex:50, marginTop:4, overflow:'hidden' }}>
                  {filtered1.map(d=>(
                    <div key={d} onClick={()=>{setDrug1(d);setSearch1(d);setShow1(false);setInteraction(null);setNoInteraction(false)}} style={{ padding:'12px 16px', cursor:'pointer', fontSize:14, color:'white', borderBottom:'1px solid rgba(0,0,0,0.04)', fontWeight:500 }}>
                      💊 {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drug 2 */}
            <div style={{ marginBottom:16, position:'relative' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:1, marginBottom:6, textTransform:'uppercase' }}>Drug 2</div>
              <input value={drug2||search2} onChange={e=>{setSearch2(e.target.value);setDrug2('');setShow2(true);setInteraction(null);setNoInteraction(false)}} onFocus={()=>setShow2(true)} placeholder="Search drug..." style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:`2px solid ${drug2?'#8b5cf6':'rgba(0,0,0,0.08)'}`, background:drug2?'rgba(139,92,246,0.05)':'rgba(255,255,255,0.05)', fontSize:14, fontWeight:drug2?700:400, color:drug2?'#8b5cf6':'rgba(255,255,255,0.35)', outline:'none', boxSizing:'border-box' }}/>
              {show2 && search2 && !drug2 && filtered2.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'rgba(28,10,50,0.97)', backdropFilter:'blur(20px)', borderRadius:14, border:'1px solid rgba(139,92,246,0.25)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)', zIndex:50, marginTop:4, overflow:'hidden' }}>
                  {filtered2.map(d=>(
                    <div key={d} onClick={()=>{setDrug2(d);setSearch2(d);setShow2(false);setInteraction(null);setNoInteraction(false)}} style={{ padding:'12px 16px', cursor:'pointer', fontSize:14, color:'white', borderBottom:'1px solid rgba(0,0,0,0.04)', fontWeight:500 }}>
                      💊 {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={checkInteraction} disabled={!drug1||!drug2} style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:drug1&&drug2?'linear-gradient(135deg,#0a84ff,#8b5cf6)':'rgba(0,0,0,0.06)', color:drug1&&drug2?'white':'#94a3b8', fontSize:15, fontWeight:700, cursor:drug1&&drug2?'pointer':'not-allowed', transition:'all 0.2s', boxShadow:drug1&&drug2?'0 6px 20px rgba(10,132,255,0.25)':'none' }}>
              🔍 Check Interaction
            </button>
          </div>

          {/* Result */}
          {interaction && (() => {
            const cfg = getSeverityConfig(interaction.severity)
            return (
              <div style={{ background:cfg.bg, backdropFilter:'blur(20px)', borderRadius:20, padding:20, marginBottom:14, border:`2px solid ${cfg.border}`, animation:'fadeIn 0.4s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:cfg.dot, boxShadow:`0 0 10px ${cfg.dot}` }}/>
                  <div style={{ fontSize:13, fontWeight:800, color:cfg.color, letterSpacing:0.5 }}>{interaction.severity}</div>
                  <div style={{ flex:1 }}/>
                  <div style={{ fontSize:12, color:cfg.color, fontWeight:600 }}>{drug1} + {drug2}</div>
                </div>
                {[
                  {label:'⚙️ Mechanism', value:interaction.mechanism},
                  {label:'⚠️ Effect', value:interaction.effect},
                  {label:'✅ Management', value:interaction.management},
                ].map(item=>(
                  <div key={item.label} style={{ marginBottom:12, padding:'10px 14px', background:'rgba(255,255,255,0.5)', borderRadius:12, border:`1px solid ${cfg.border}` }}>
                    <div style={{ fontSize:10, fontWeight:800, color:cfg.color, marginBottom:5, letterSpacing:0.5 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:'#1f2937', lineHeight:1.7, fontWeight:500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          {noInteraction && (
            <div style={{ background:'rgba(48,209,88,0.1)', backdropFilter:'blur(12px)', borderRadius:18, padding:18, border:'1px solid rgba(22,163,74,0.2)', textAlign:'center', animation:'fadeIn 0.4s ease' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#86efac', marginBottom:6 }}>No Known Interaction</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{drug1} + {drug2} — No clinically significant interaction found in our database. Always verify with current formulary.</div>
            </div>
          )}

          {/* Common Dangerous Interactions */}
          <div style={{ background:'rgba(255,255,255,0.11)', backdropFilter:'blur(20px)', borderRadius:18, padding:16, border:'1px solid rgba(139,92,246,0.25)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:12 }}>⚠️ High-Risk Combinations</div>
            {[
              {combo:'Warfarin + Fluconazole', sev:'CONTRAINDICATED', color:'#dc2626'},
              {combo:'Simvastatin + Clarithromycin', sev:'CONTRAINDICATED', color:'#dc2626'},
              {combo:'Metoprolol + Verapamil', sev:'CONTRAINDICATED', color:'#dc2626'},
              {combo:'Digoxin + Amiodarone', sev:'MAJOR', color:'#ea580c'},
              {combo:'Warfarin + NSAIDs', sev:'MAJOR', color:'#ea580c'},
              {combo:'Lithium + NSAIDs', sev:'MAJOR', color:'#ea580c'},
            ].map(item=>(
              <div key={item.combo} onClick={()=>{
                const parts = item.combo.split(' + ')
                setDrug1(parts[0]); setSearch1(parts[0])
                setDrug2(parts[1]); setSearch2(parts[1])
                const key1=`${parts[0]}+${parts[1]}`, key2=`${parts[1]}+${parts[0]}`
                const result = INTERACTIONS[key1]||INTERACTIONS[key2]
                if(result){setInteraction(result);setNoInteraction(false)}
              }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.11)', marginBottom:6, cursor:'pointer', border:'1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:item.color, flexShrink:0 }}/>
                <div style={{ flex:1, fontSize:13, fontWeight:600, color:'white' }}>{item.combo}</div>
                <div style={{ fontSize:9, padding:'2px 8px', borderRadius:8, background:`${item.color}15`, color:item.color, fontWeight:800 }}>{item.sev}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
