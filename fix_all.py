import os

path = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(path, 'r') as f:
    c = f.read()

# 1. Clinical Pulse
pulse = (
    '\n            {/* Clinical Pulse */}\n'
    '            <div style={{margin:"0 0 16px",background:"linear-gradient(135deg,rgba(48,209,88,0.08),rgba(10,132,255,0.06))",borderRadius:20,border:"1px solid rgba(48,209,88,0.2)",overflow:"hidden",cursor:"pointer"}} onClick={()=>setActiveCase("stemi")}>\n'
    '              <div style={{width:"100%",height:130,background:"linear-gradient(135deg,#001a0d,#001233)",position:"relative",display:"flex",alignItems:"flex-end",padding:14}}>\n'
    '                <div style={{position:"absolute",top:12,left:14,display:"flex",alignItems:"center",gap:6}}>\n'
    '                  <div style={{width:7,height:7,borderRadius:"50%",background:"#30d158",boxShadow:"0 0 8px #30d158"}}/>\n'
    '                  <span style={{fontSize:10,color:"#30d158",fontWeight:800,letterSpacing:2}}>MORNING BRIEF</span>\n'
    '                </div>\n'
    '                <div style={{fontSize:50,position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",opacity:0.12}}>🫀</div>\n'
    '                <div>\n'
    '                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:4}}>CARDIOLOGY · TODAY</div>\n'
    '                  <div style={{fontSize:15,fontWeight:800,color:"white",lineHeight:1.2}}>67M with Rapid AF and Haemodynamic Instability</div>\n'
    '                </div>\n'
    '              </div>\n'
    '              <div style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>\n'
    '                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>🌍 1,247 doctors deciding now</div>\n'
    '                <div style={{background:"rgba(48,209,88,0.15)",border:"1px solid rgba(48,209,88,0.3)",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,color:"#30d158"}}>Join →</div>\n'
    '              </div>\n'
    '            </div>\n'
)

old = '            {/* Featured Case */}'
if old in c:
    c = c.replace(old, pulse + old, 1)
    print('Pulse: added')
else:
    print('Pulse: pattern not found')

# 2. Ghost Consultant component
ghost = '''
const GhostConsultant = ({onXP}:{onXP:(n:number)=>void}) => {
  const [q, setQ] = React.useState("")
  const [a, setA] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const ask = async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const r = await fetch("/api/generate-case",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemPrompt:"You are a senior physician ghost consultant. Challenge the user clinically in 2-3 sentences. Be direct and evidence-based.",userPrompt:q,specialty:"Internal Medicine",difficulty:"Advanced"})})
      const d = await r.json()
      setA(d.case?.keyLearning?.[0] || d.case?.management?.[0] || "Consider the evidence carefully.")
      onXP(25)
    } catch { setA("Unable to connect. Try again.") }
    setLoading(false)
  }
  return (
    <div style={{padding:"0 16px"}}>
      <div style={{background:"linear-gradient(135deg,rgba(139,92,246,0.12),rgba(10,132,255,0.08))",borderRadius:22,padding:20,marginBottom:16,border:"1px solid rgba(139,92,246,0.25)"}}>
        <div style={{fontSize:40,marginBottom:12,textAlign:"center"}}>👻</div>
        <div style={{fontSize:20,fontWeight:900,color:"white",marginBottom:6,textAlign:"center"}}>Ghost Consultant</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center",lineHeight:1.6,marginBottom:20}}>Ask any clinical question. The Ghost challenges your thinking with evidence-based medicine.</div>
        {a && <div style={{background:"rgba(139,92,246,0.1)",borderRadius:16,padding:14,marginBottom:14,border:"1px solid rgba(139,92,246,0.2)"}}><div style={{fontSize:10,color:"#8b5cf6",fontWeight:800,letterSpacing:1,marginBottom:6}}>👻 GHOST SAYS</div><div style={{fontSize:14,color:"rgba(255,255,255,0.85)",lineHeight:1.7}}>{a}</div></div>}
        <div style={{display:"flex",gap:10}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask a clinical question..." style={{flex:1,padding:"13px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"white",fontSize:14,outline:"none"}}/>
          <button onClick={ask} disabled={loading||!q.trim()} style={{width:48,height:48,borderRadius:14,border:"none",background:loading?"rgba(255,255,255,0.1)":"linear-gradient(135deg,#8b5cf6,#0a84ff)",color:"white",fontSize:20,cursor:"pointer",flexShrink:0}}>{loading?"⏳":"→"}</button>
        </div>
      </div>
    </div>
  )
}
'''

if 'GhostConsultant' not in c:
    c = c.replace("export default function Home()", ghost + "\nexport default function Home()")
    print("Ghost: added")
else:
    print("Ghost: already exists")

# Add React import
if "import React" not in c:
    c = c.replace("'use client'", "'use client'\nimport React from 'react'")

# Add Ghost render
if "toolTab===\"ghost\"" not in c and "toolTab==='ghost'" not in c:
    c = c.replace(
        "{toolTab==='nexus'&&<ClinicalNexus onXP={addXP}/>}",
        "{toolTab==='ghost'&&<GhostConsultant onXP={addXP}/>}\n            {toolTab==='nexus'&&<ClinicalNexus onXP={addXP}/>}"
    )
    print("Ghost render: added")

# Make Ghost clickable in TOOLS hub
c = c.replace(
    "<div style={{background:'rgba(139,92,246,0.06)',borderRadius:18,padding:'14px 16px',border:'1px solid rgba(139,92,246,0.15)',display:'flex',alignItems:'center',gap:12,opacity:0.7}}>",
    "<div onClick={()=>setToolTab('ghost')} style={{background:'rgba(139,92,246,0.06)',borderRadius:18,padding:'14px 16px',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>"
)

with open(path, 'w') as f:
    f.write(c)
print("All done!")
