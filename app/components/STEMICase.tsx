'use client'
import { useState, useEffect } from 'react'
export default function STEMICase({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [hr, setHr] = useState(98)
  const [bp] = useState('90/60')
  const [spo2, setSpo2] = useState(94)
  const [selected, setSelected] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setHr(h => 95 + Math.floor(Math.random()*8))
      setSpo2(s => 93 + Math.floor(Math.random()*3))
    }, 1200)
    return () => clearInterval(id)
  }, [])
  const ecgPath = () => {
    let d = 'M 0 30'
    for (let i = 0; i < 20; i++) {
      const x = i * 16
      if (i % 5 === 2) { d += ' L '+(x+2)+' 30 L '+(x+3)+' 2 L '+(x+4)+' 55 L '+(x+5)+' 30' }
      else { d += ' L '+(x+16)+' 30' }
    }
    return d
  }
  const choices = [
    { id:'a', text:'Aspirin + Heparin + Cath Lab activation', correct: true },
    { id:'b', text:'Thrombolytics only', correct: false },
    { id:'c', text:'Observation and repeat ECG in 30 min', correct: false },
    { id:'d', text:'Beta blocker IV immediately', correct: false },
  ]
  const handleAnswer = (id: string) => {
    setSelected(id)
    setShowResult(true)
    const correct = choices.find(c => c.id === id)?.correct
    const xp = correct ? Math.round(50 * (confidence / 3)) : 10
    setXpEarned(xp)
  }
  if (step === 0) return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh'}}>
      <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:'4px 8px'}}>← Back</button>
        <span style={{fontWeight:600,fontSize:16}}>Emergency</span>
      </div>
      <div style={{padding:20}}>
        <div style={{fontSize:13,color:'#FF3B30',fontWeight:700,letterSpacing:1,marginBottom:4}}>CRITICAL CASE</div>
        <div style={{fontSize:24,fontWeight:700,marginBottom:4}}>Anterior STEMI</div>
        <div style={{fontSize:14,color:'#888',marginBottom:20}}>58y Male · Chest pain 45 min</div>
        <div style={{background:'#1C1C1E',borderRadius:20,padding:16,marginBottom:16}}>
          <div style={{fontSize:11,color:'#34C759',fontWeight:700,letterSpacing:1,marginBottom:12}}>LIVE VITALS</div>
          <div style={{display:'flex',gap:10,marginBottom:12}}>
            <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#FF3B30',fontWeight:600}}>HR</div>
              <div style={{fontSize:26,fontWeight:700,color:'#FF3B30',textShadow:'0 0 10px #FF3B30'}}>{hr}</div>
              <div style={{fontSize:10,color:'#666'}}>bpm</div>
            </div>
            <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#007AFF',fontWeight:600}}>BP</div>
              <div style={{fontSize:22,fontWeight:700,color:'#007AFF',textShadow:'0 0 10px #007AFF'}}>{bp}</div>
              <div style={{fontSize:10,color:'#666'}}>mmHg</div>
            </div>
            <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#34C759',fontWeight:600}}>SpO2</div>
              <div style={{fontSize:26,fontWeight:700,color:'#34C759',textShadow:'0 0 10px #34C759'}}>{spo2}</div>
              <div style={{fontSize:10,color:'#666'}}>%</div>
            </div>
          </div>
          <div style={{background:'#2C2C2E',borderRadius:12,padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'#FF3B30',fontWeight:600,letterSpacing:0.5,marginBottom:6}}>ECG — ST Elevation V1-V4</div>


<svg width="100%" height="55" viewBox="0 0 320 55" preserveAspectRatio="none">
              <path d={ecgPath()} fill="none" stroke="#FF3B30" strokeWidth="2.5" style={{filter:'drop-shadow(0 0 5px #FF3B30)'}} />
            </svg>
          </div>
        </div>
        <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:13,fontWeight:700,color:'#FF3B30',marginBottom:8}}>PATIENT HISTORY</div>
          <div style={{fontSize:14,color:'#333',lineHeight:1.7}}>
            58-year-old male presented with crushing central chest pain radiating to left arm for 45 minutes. Diaphoretic, pale, and in distress. PMH: HTN, T2DM, smoker. Medications: Amlodipine, Metformin.
          </div>
        </div>
        <button onClick={() => setStep(1)} style={{background:'#FF3B30',color:'#fff',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:600,width:'100%',cursor:'pointer',boxShadow:'0 4px 20px #FF3B3060'}}>
          Proceed to Management →
        </button>
      </div>
    </div>
  )
  if (step === 1) return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh'}}>
      <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
        <button onClick={() => setStep(0)} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:'4px 8px'}}>← Back</button>
        <span style={{fontWeight:600,fontSize:16}}>Clinical Decision</span>
      </div>
      <div style={{padding:20}}>
        <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>What is your management?</div>
        <div style={{fontSize:14,color:'#888',marginBottom:16}}>Select your confidence before answering</div>
        <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Confidence Level</div>
          <div style={{display:'flex',gap:8}}>
            {[['1','Not Sure','#888'],['2','Fairly Sure','#FF9500'],['3','Very Sure','#34C759']].map(([v,l,c])=>(
              <div key={v} onClick={() => setConfidence(Number(v))} style={{flex:1,background:confidence===Number(v)?String(c)+'20':'#F2F2F7',border:'2px solid '+(confidence===Number(v)?String(c):'transparent'),borderRadius:12,padding:'10px 6px',textAlign:'center',cursor:'pointer',transition:'all 0.2s'}}>
                <div style={{fontSize:18,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:10,color:String(c),fontWeight:500}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {!showResult ? (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {choices.map(c => (
              <button key={c.id} onClick={() => confidence > 0 && handleAnswer(c.id)} style={{background:'#fff',border:'2px solid '+(confidence>0?'#E5E5EA':'#F0F0F0'),borderRadius:14,padding:'14px 16px',fontSize:14,fontWeight:500,textAlign:'left',cursor:confidence>0?'pointer':'not-allowed',opacity:confidence>0?1:0.6,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'all 0.2s'}}>
                <span style={{fontWeight:700,color:'#007AFF',marginRight:8}}>{c.id.toUpperCase()}.</span>{c.text}
              </button>
            ))}
            {confidence === 0 && <div style={{fontSize:12,color:'#FF9500',textAlign:'center',marginTop:4}}>Select confidence level first</div>}
          </div>
        ) : (
          <div>
            {choices.map(c => (
              <div key={c.id} style={{background: c.correct?'#34C75915': c.id===selected?'#FF3B3015':'#fff', border:'2px solid '+(c.correct?'#34C759':c.id===selected?'#FF3B30':'#E5E5EA'), borderRadius:14, padding:'14px 16px', marginBottom:10, fontSize:14}}>
                <span style={{fontWeight:700,marginRight:8,color:c.correct?'#34C759':c.id===selected?'#FF3B30':'#888'}}>{c.id.


toUpperCase()}.</span>
                {c.text}
                {c.correct && <span style={{marginLeft:8,color:'#34C759',fontWeight:700}}>✓ Correct</span>}
                {!c.correct && c.id===selected && <span style={{marginLeft:8,color:'#FF3B30',fontWeight:700}}>✗ Incorrect</span>}
              </div>
            ))}
            <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:16,padding:20,textAlign:'center',color:'#fff',marginTop:8}}>
              <div style={{fontSize:28,fontWeight:800}}>+{xpEarned} XP</div>
              <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{choices.find(c=>c.id===selected)?.correct ? 'Excellent clinical decision!' : 'Keep practicing — review the guidelines'}</div>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginTop:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#007AFF',marginBottom:8}}>EXPLANATION</div>
              <div style={{fontSize:14,color:'#333',lineHeight:1.7}}>Anterior STEMI requires immediate dual antiplatelet therapy (Aspirin 300mg + P2Y12 inhibitor), anticoagulation with Heparin, and primary PCI within 90 minutes. Thrombolytics are second-line when PCI is unavailable within 120 minutes.</div>
            </div>
            <button onClick={onBack} style={{background:'#F2F2F7',border:'none',borderRadius:14,padding:16,fontSize:15,fontWeight:600,width:'100%',marginTop:12,cursor:'pointer'}}>
              Back to Cases
            </button>
          </div>
        )}
      </div>
    </div>
  )
  return null
}
