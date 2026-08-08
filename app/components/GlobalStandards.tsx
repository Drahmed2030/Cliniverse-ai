'use client'
import { useState } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#1E40AF,#0D9488)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(30,64,175,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const SYSTEMS = [
  { id:'aha',  name:'AHA/ACC',  flag:'🇺🇸', full:'American Heart/College of Cardiology', color:'#EF4444' },
  { id:'esc',  name:'ESC',      flag:'🇪🇺', full:'European Society of Cardiology',        color:'#1E40AF' },
  { id:'caep', name:'CAEP',     flag:'🇨🇦', full:'Canadian Association of EP',            color:'#DC2626' },
  { id:'acem', name:'ACEM',     flag:'🇦🇺', full:'Australasian College EM',               color:'#10B981' },
]

const GUIDELINES = [
  {
    id:'stemi',
    topic:'STEMI Management',
    icon:'🫀',
    color:L.red,
    img:'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80',
    comparisons: [
      { system:'🇺🇸 AHA/ACC 2023', key:'Door-to-balloon', value:'<90 min (PCI center)', detail:'If PCI unavailable >120min → thrombolysis', grade:'Class I' },
      { system:'🇪🇺 ESC 2023',     key:'Door-to-balloon', value:'<60 min preferred', detail:'Total ischemic time <120 min goal', grade:'Class I' },
      { system:'🇨🇦 CAEP 2024',    key:'Door-to-balloon', value:'<90 min rural, <60 urban', detail:'Fibrinolysis if PCI delay >120 min', grade:'Strong' },
      { system:'🇦🇺 ACEM 2023',    key:'Door-to-balloon', value:'<90 min all centers', detail:'Telemedicine ECG for rural transfer', grade:'Grade A' },
    ],
    consensus:'All major guidelines agree: primary PCI is first-line for STEMI when achievable within time windows. Door-to-balloon <90 minutes is universal target. Thrombolysis remains valid when PCI unavailable within 120 minutes.',
    keyDiff:'ESC sets more aggressive 60-min target vs AHA 90-min. Australian guidelines emphasize telemedicine for rural settings.',
    drug_highlight:'Dual antiplatelet: Aspirin + P2Y12 (Ticagrelor preferred over Clopidogrel — all guidelines agree 2023+)',
  },
  {
    id:'sepsis',
    topic:'Sepsis & Septic Shock',
    icon:'🦠',
    color:L.amber,
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    comparisons: [
      { system:'🌍 Surviving Sepsis 2021', key:'Hour-1 Bundle', value:'Cultures + ABx + Fluids + Lactate', detail:'Norepinephrine if MAP <65 despite fluids', grade:'Strong' },
      { system:'🇺🇸 ACEP/SCCM 2023',      key:'Fluid resuscitation', value:'30ml/kg crystalloid', detail:'Reassess after each 500ml bolus', grade:'Class I' },
      { system:'🇪🇺 ESICM 2023',           key:'Vasopressor target', value:'MAP ≥65 mmHg', detail:'Higher target (80-85) in chronic hypertension', grade:'Strong' },
      { system:'🇦🇺 CICM 2024',            key:'Antibiotic timing', value:'Within 1 hour of recognition', detail:'Broad-spectrum, then de-escalate', grade:'Grade A' },
    ],
    consensus:'Universal agreement on Hour-1 Bundle concept. All guidelines prioritize: early cultures, antibiotics within 1 hour, fluid resuscitation, vasopressors for refractory hypotension.',
    keyDiff:'Fluid volume debate: SSC 30ml/kg vs more conservative SMART trial approach. ESICM allows higher MAP target in hypertensive patients.',
    drug_highlight:'Norepinephrine: first-line vasopressor — unanimous across all guidelines. Vasopressin as adjunct at 0.03 units/min.',
  },
  {
    id:'stroke',
    topic:'Acute Ischemic Stroke',
    icon:'🧠',
    color:L.violet,
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    comparisons: [
      { system:'🇺🇸 AHA/ASA 2023', key:'tPA window', value:'4.5 hours from onset', detail:'0.9mg/kg Alteplase, max 90mg', grade:'Class I' },
      { system:'🇪🇺 ESC/ESOC 2023', key:'tPA window', value:'4.5 hours (Tenecteplase emerging)', detail:'Single bolus Tenecteplase may replace Alteplase', grade:'Class IIa' },
      { system:'🇨🇦 HSF 2022',       key:'Thrombectomy', value:'Up to 24h (DAWN/DEFUSE criteria)', detail:'Extended window for wake-up stroke', grade:'Strong' },
      { system:'🇦🇺 AusSMC 2023',    key:'BP target pre-tPA', value:'<185/110 before tPA', detail:'<180/105 for 24h post-tPA', grade:'Grade A' },
    ],
    consensus:'tPA within 4.5h is universal standard. Mechanical thrombectomy for large vessel occlusion up to 24h in selected patients. BP management: all agree on <185/110 pre-tPA.',
    keyDiff:'ESC now endorses Tenecteplase as alternative to Alteplase (simpler single bolus). Canadian guidelines most explicit on extended thrombectomy window.',
    drug_highlight:'Tenecteplase 0.25mg/kg (max 25mg) single bolus — emerging preference in ESC/UK 2026 guidelines.',
  },
  {
    id:'hf',
    topic:'Heart Failure (HFrEF)',
    icon:'💔',
    color:L.cobalt,
    img:'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
    comparisons: [
      { system:'🇺🇸 AHA/ACC 2022',  key:'GDMT Foundation', value:'ACEi/ARB/ARNI + BB + MRA + SGLT2i', detail:'All 4 pillars → mortality benefit', grade:'Class I' },
      { system:'🇪🇺 ESC 2021',       key:'SGLT2i',          value:'Dapagliflozin/Empagliflozin — Class I', detail:'Added regardless of diabetes status', grade:'Class I' },
      { system:'🇨🇦 CCS 2023',       key:'Diuretics',       value:'Loop diuretic for congestion', detail:'Adjust dose to maintain euvolemia', grade:'Strong' },
      { system:'🇦🇺 CSANZ 2023',     key:'ICD indication',  value:'EF ≤35% + NYHA II-III on GDMT', detail:'3 months of GDMT before ICD decision', grade:'Grade A' },
    ],
    consensus:'Quadruple therapy (ACEi/ARNI + BB + MRA + SGLT2i) is now standard across all major guidelines. SGLT2i added to GDMT regardless of diabetes status — landmark change 2021-2022.',
    keyDiff:'ESC first to give SGLT2i Class I recommendation. AHA followed 2022. CSANZ most explicit on timing of ICD implantation.',
    drug_highlight:'ARNI (Sacubitril/Valsartan) superior to ACEi — 20% further mortality reduction. Replace ACEi when tolerated.',
  },
  {
    id:'pe',
    topic:'Pulmonary Embolism',
    icon:'🫁',
    color:L.teal,
    img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    comparisons: [
      { system:'🇺🇸 AHA 2023',       key:'Massive PE tx', value:'Systemic thrombolysis if no CI', detail:'Alteplase 100mg/2h. Catheter-directed if fails', grade:'Class I' },
      { system:'🇪🇺 ESC 2019/2024',  key:'PESI score',    value:'Use for risk stratification', detail:'Low PESI → consider outpatient Rx', grade:'Class I' },
      { system:'🇨🇦 CTS 2020',       key:'DOAC preference', value:'Apixaban or Rivaroxaban first-line', detail:'3-6 months minimum anticoagulation', grade:'Strong' },
      { system:'🇦🇺 ANZSCTS 2022',   key:'Surgical embolectomy', value:'When thrombolysis contraindicated', detail:'Experienced center + massive PE', grade:'Grade B' },
    ],
    consensus:'Anticoagulation is universal first-line. DOACs preferred over LMWH/warfarin for most patients. Massive PE with hemodynamic compromise: systemic thrombolysis first-line unless contraindicated.',
    keyDiff:'ESC most comprehensive risk stratification (PESI + troponin + echo). Canadian guidelines most explicit on DOAC preference. Australian adds surgical pathway clearly.',
    drug_highlight:'DOACs (Apixaban 10mg BD x7d → 5mg BD) — preferred over warfarin in most PE. Avoid in severe renal failure (CrCl <15).',
  },
]

export default function GlobalStandards() {
  const [activeGuide, setActiveGuide] = useState<any>(null)
  const [activeTab, setActiveTab]     = useState<'compare'|'consensus'|'drugs'>('compare')
  const [pressed, setPressed]         = useState<string|null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = GUIDELINES.filter(g=>
    !searchQuery ||
    g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Detail view
  if(activeGuide) return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src={activeGuide.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))'}}/>
        <button onClick={()=>{setActiveGuide(null);setActiveTab('compare')}} style={{
          position:'absolute',top:16,left:16,
          background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:12,padding:'8px 16px',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',
        }}>← Back</button>
        <div style={{position:'absolute',top:16,right:16,display:'flex',gap:6}}>
          {SYSTEMS.map(s=>(
            <span key={s.id} style={{fontSize:18}}>{s.flag}</span>
          ))}
        </div>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:28,marginBottom:6}}>{activeGuide.icon}</div>
          <div style={{fontSize:24,fontWeight:900,color:'white',letterSpacing:-0.4}}>{activeGuide.topic}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4}}>
            {SYSTEMS.length} international systems compared
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,margin:'14px 16px 0',background:L.raised,borderRadius:16,padding:4,border:`1px solid ${L.border}`}}>
        {(['compare','consensus','drugs'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:'9px',borderRadius:12,border:'none',cursor:'pointer',
            background:activeTab===t?L.gradient:'transparent',
            color:activeTab===t?'white':L.textMuted,
            fontSize:11,fontWeight:700,transition:spring,
            boxShadow:activeTab===t?L.shadowGlow:'none',
          }}>
            {t==='compare'?'⚖️ Compare':t==='consensus'?'🤝 Consensus':'💊 Key Drug'}
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px'}}>
        {activeTab==='compare' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {activeGuide.comparisons.map((c:any,i:number)=>(
              <div key={i} style={{
                background:L.surface,border:`1px solid ${L.border}`,
                borderRadius:18,padding:'16px',boxShadow:L.shadowSm,
              }}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:800,color:L.textPrimary}}>{c.system}</div>
                  <span style={{
                    fontSize:9,fontWeight:800,color:L.sage,
                    background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',
                    borderRadius:99,padding:'3px 8px',letterSpacing:0.5,
                  }}>{c.grade}</span>
                </div>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <div style={{
                    background:`${activeGuide.color}10`,border:`1px solid ${activeGuide.color}25`,
                    borderRadius:10,padding:'8px 12px',flex:1,
                  }}>
                    <div style={{fontSize:9,fontWeight:700,color:activeGuide.color,marginBottom:3,letterSpacing:1}}>
                      {c.key.toUpperCase()}
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{c.value}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:L.textSub,lineHeight:1.6}}>{c.detail}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab==='consensus' && (
          <>
            <div style={{
              background:'rgba(16,185,129,0.08)',border:'2px solid rgba(16,185,129,0.25)',
              borderRadius:20,padding:'18px',marginBottom:12,
            }}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.sage,marginBottom:10}}>
                🤝 INTERNATIONAL CONSENSUS
              </div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.75}}>{activeGuide.consensus}</div>
            </div>

            <div style={{
              background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',
              borderRadius:18,padding:'16px',marginBottom:12,
            }}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.amber,marginBottom:8}}>
                ⚡ KEY DIFFERENCES
              </div>
              <div style={{fontSize:13,color:L.textSub,lineHeight:1.7}}>{activeGuide.keyDiff}</div>
            </div>

            {/* System badges */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {SYSTEMS.map(s=>(
                <a key={s.id}
                  href={`https://www.google.com/search?q=${encodeURIComponent(s.full+' '+activeGuide.topic+' guidelines 2026')}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display:'flex',alignItems:'center',gap:6,
                    padding:'8px 14px',borderRadius:99,
                    background:L.surface,border:`1px solid ${L.border}`,
                    textDecoration:'none',boxShadow:L.shadowSm,
                  }}>
                  <span style={{fontSize:16}}>{s.flag}</span>
                  <span style={{fontSize:12,fontWeight:700,color:L.textSub}}>{s.name}</span>
                  <span style={{fontSize:10,color:L.textMuted}}>→</span>
                </a>
              ))}
            </div>
          </>
        )}

        {activeTab==='drugs' && (
          <>
            <div style={{
              background:`${activeGuide.color}08`,
              border:`2px solid ${activeGuide.color}25`,
              borderRadius:20,padding:'18px',marginBottom:12,
            }}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,
                color:activeGuide.color,marginBottom:10}}>
                💊 KEY DRUG HIGHLIGHT
              </div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.75}}>
                {activeGuide.drug_highlight}
              </div>
            </div>

            <div style={{
              background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',
              borderRadius:16,padding:'12px 16px',
            }}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
                ⚠️ Always verify drug doses with local formulary and check for contraindications. Guidelines are updated regularly.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Main view
  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(to bottom,rgba(15,23,42,0.15),rgba(15,23,42,0.92))'}}/>

        {/* Flags */}
        <div style={{position:'absolute',top:16,left:16,display:'flex',gap:8}}>
          {SYSTEMS.map(s=>(
            <div key={s.id} style={{
              background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:99,padding:'4px 12px',
              display:'flex',alignItems:'center',gap:5,
            }}>
              <span style={{fontSize:14}}>{s.flag}</span>
              <span style={{fontSize:10,fontWeight:700,color:'white'}}>{s.name}</span>
            </div>
          ))}
        </div>

        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,
            color:'rgba(255,255,255,0.7)',marginBottom:6}}>
            4 SYSTEMS · USA · EUROPE · CANADA · AUSTRALIA
          </div>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>
            🌍 Global Standards
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>
            Compare international guidelines · Find consensus · Key differences
          </div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>

        {/* Systems overview */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {SYSTEMS.map(s=>(
            <div key={s.id} style={{
              background:L.surface,border:`1px solid ${s.color}20`,
              borderLeft:`3px solid ${s.color}`,
              borderRadius:14,padding:'12px 14px',boxShadow:L.shadowSm,
            }}>
              <div style={{fontSize:20,marginBottom:4}}>{s.flag}</div>
              <div style={{fontSize:13,fontWeight:800,color:L.textPrimary}}>{s.name}</div>
              <div style={{fontSize:10,color:L.textMuted,lineHeight:1.4}}>{s.full}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
          placeholder="Search guidelines... (STEMI, Sepsis, Stroke...)"
          style={{width:'100%',padding:'12px 16px',borderRadius:14,boxSizing:'border-box',
            border:`1px solid ${L.border}`,background:L.surface,
            color:L.textPrimary,fontSize:13,outline:'none',marginBottom:14,fontFamily:'inherit'}}/>

        {/* Guidelines */}
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>
          SELECT GUIDELINE TO COMPARE
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(guide=>(
            <div key={guide.id}
              onClick={()=>setActiveGuide(guide)}
              onMouseDown={()=>setPressed(guide.id)} onMouseUp={()=>setPressed(null)}
              style={{
                position:'relative',height:120,borderRadius:20,overflow:'hidden',cursor:'pointer',
                transform:pressed===guide.id?'scale(0.97)':'scale(1)',
                transition:spring,boxShadow:`0 4px 16px ${guide.color}20`,
              }}>
              <img src={guide.img} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',inset:0,
                background:`linear-gradient(135deg,${guide.color}BB,rgba(15,23,42,0.80))`}}/>
              <div style={{position:'absolute',inset:0,padding:'14px 16px',
                display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:32}}>{guide.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:900,color:'white',marginBottom:4}}>
                    {guide.topic}
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {SYSTEMS.map(s=>(
                      <span key={s.id} style={{fontSize:14}}>{s.flag}</span>
                    ))}
                  </div>
                </div>
                <div style={{fontSize:20,color:'rgba(255,255,255,0.7)'}}>›</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:16,padding:'12px 16px',
          background:'rgba(13,148,136,0.06)',border:'1px solid rgba(13,148,136,0.15)',
          borderRadius:16,textAlign:'center'}}>
          <div style={{fontSize:12,color:L.teal,fontWeight:700}}>
            📚 Guidelines updated 2023-2026 · More specialties coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
