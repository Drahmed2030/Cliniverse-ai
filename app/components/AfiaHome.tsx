"use client";
import { useState, useEffect } from "react";

type UserType = "doctor"|"mother"|"pharmacy"|"patient"|"eyes"|"dental"|"rehab"|"stores"|null;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
];

const USER_TYPES = [
  { id:"doctor",   label:"طبيب",    sublabel:"Doctor",       emoji:"👨‍⚕️", color:"#0A84FF", grad:"linear-gradient(135deg,#0A84FF,#0066CC)" },
  { id:"mother",   label:"الأم",    sublabel:"Mother",       emoji:"👩‍", color:"#FF2D55", grad:"linear-gradient(135deg,#FF2D55,#C0004A)" },
  { id:"pharmacy", label:"صيدلية",  sublabel:"Pharmacy",     emoji:"💊",  color:"#30D158", grad:"linear-gradient(135deg,#30D158,#00A83A)" },
  { id:"patient",  label:"مريض",    sublabel:"Patient",      emoji:"🏥",  color:"#FF9F0A", grad:"linear-gradient(135deg,#FF9F0A,#FF6B00)" },
  { id:"eyes",     label:"عيون",    sublabel:"Ophthalmology",emoji:"👁️",  color:"#64D2FF", grad:"linear-gradient(135deg,#64D2FF,#0A84FF)" },
  { id:"dental",   label:"أسنان",   sublabel:"Dentistry",    emoji:"🦷",  color:"#BF5AF2", grad:"linear-gradient(135deg,#BF5AF2,#9B00E8)" },
  { id:"rehab",    label:"تأهيل",   sublabel:"Rehabilitation",emoji:"🏃", color:"#FF6B35", grad:"linear-gradient(135deg,#FF6B35,#FF2D00)" },
  { id:"stores",   label:"محلات",   sublabel:"Medical Stores",emoji:"🏪", color:"#00C7BE", grad:"linear-gradient(135deg,#00C7BE,#007AFF)" },
];

// ============ SECTION COMPONENTS ============

function DoctorSection({ onBack }: { onBack: () => void }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(10,132,255,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#0A84FF",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>👨‍⚕️ Doctor Portal</div>
      </div>
      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {[
          {emoji:"📋",title:"Clinical Cases",desc:"WARD cases updated daily",color:"#0A84FF"},
          {emoji:"🧮",title:"Calculators",desc:"TIMI, Wells, HEART scores",color:"#FF9F0A"},
          {emoji:"📚",title:"Guidelines 2026",desc:"ESC · AHA · ADA",color:"#30D158"},
          {emoji:"🔬",title:"Medical AI",desc:"Evidence-based answers",color:"#BF5AF2"},
          {emoji:"💊",title:"Drug Search",desc:"FDA + PubMed + Trials",color:"#FF453A"},
          {emoji:"🧪",title:"Lab Reference",desc:"Normal ranges · Critical values",color:"#64D2FF"},
        ].map((item,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${item.color},${item.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{item.emoji}</div>
            <div><div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{item.title}</div><div style={{color:"rgba(60,60,67,0.55)",fontSize:13}}>{item.desc}</div></div>
            <div style={{marginLeft:"auto",color:"rgba(60,60,67,0.3)",fontSize:20}}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EyesSection({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pubmed?q=ophthalmology+guidelines+2026")
      .then(r=>r.json())
      .then(d=>{ setArticles(d.results||[]); setLoading(false); });
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8f4ff 0%,#f0f8ff 60%,#e8f0ff 100%)",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(100,210,255,0.15)",border:"none",borderRadius:10,padding:"8px 14px",color:"#64D2FF",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>👁️ Ophthalmology</div>
      </div>
      <div style={{padding:"20px 16px"}}>
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
          <div style={{color:"#64D2FF",fontSize:13,fontWeight:700,marginBottom:12}}>👁️ COMMON CONDITIONS</div>
          {["Glaucoma","Diabetic Retinopathy","Cataract","Macular Degeneration","Dry Eye Disease","Uveitis"].map((c,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<5?"1px solid rgba(0,0,0,0.06)":"none",color:"#1c1c1e",fontSize:15,display:"flex",justifyContent:"space-between"}}>
              {c}<span style={{color:"rgba(60,60,67,0.4)"}}>›</span>
            </div>
          ))}
        </div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:700,marginBottom:10}}>LATEST RESEARCH — PubMed 2026</div>
        {loading ? <div style={{textAlign:"center",padding:20,color:"rgba(60,60,67,0.4)"}}>Loading...</div> :
          articles.map((a,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#64D2FF",fontSize:12,fontWeight:600}}>Read →</a>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function DentalSection({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pubmed?q=dentistry+oral+health+guidelines+2026")
      .then(r=>r.json())
      .then(d=>{ setArticles(d.results||[]); setLoading(false); });
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f5f0ff 0%,#ede8ff 60%,#f0f4ff 100%)",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(191,90,242,0.12)",border:"none",borderRadius:10,padding:"8px 14px",color:"#BF5AF2",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🦷 Dentistry</div>
      </div>
      <div style={{padding:"20px 16px"}}>
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:20,marginBottom:16}}>
          <div style={{color:"#BF5AF2",fontSize:13,fontWeight:700,marginBottom:12}}>🦷 DENTAL CONDITIONS</div>
          {["Dental Caries","Periodontal Disease","Dental Abscess","Malocclusion","Oral Cancer Screening","Tooth Sensitivity","TMJ Disorders","Dry Socket"].map((c,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<7?"1px solid rgba(0,0,0,0.06)":"none",color:"#1c1c1e",fontSize:15,display:"flex",justifyContent:"space-between"}}>
              {c}<span style={{color:"rgba(60,60,67,0.4)"}}>›</span>
            </div>
          ))}
        </div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:700,marginBottom:10}}>LATEST RESEARCH — PubMed 2026</div>
        {loading ? <div style={{textAlign:"center",padding:20,color:"rgba(60,60,67,0.4)"}}>Loading...</div> :
          articles.map((a,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#BF5AF2",fontSize:12,fontWeight:600}}>Read →</a>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function RehabSection({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pubmed?q=rehabilitation+medicine+physiotherapy+2026")
      .then(r=>r.json())
      .then(d=>{ setArticles(d.results||[]); setLoading(false); });
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff4f0 0%,#ffe8e0 60%,#fff0f4 100%)",fontFamily:"-apple-system,sans-serif"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(255,107,53,0.12)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF6B35",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🏃 Rehabilitation</div>
      </div>
      <div style={{padding:"20px 16px"}}>
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:20,marginBottom:16}}>
          <div style={{color:"#FF6B35",fontSize:13,fontWeight:700,marginBottom:12}}>🏃 REHAB PROGRAMS</div>
          {["Cardiac Rehabilitation","Stroke Recovery","Post-Surgical Rehab","Pulmonary Rehab","Orthopedic Rehab","Neurological Rehab","Sports Medicine","Pain Management"].map((c,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<7?"1px solid rgba(0,0,0,0.06)":"none",color:"#1c1c1e",fontSize:15,display:"flex",justifyContent:"space-between"}}>
              {c}<span style={{color:"rgba(60,60,67,0.4)"}}>›</span>
            </div>
          ))}
        </div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:13,fontWeight:700,marginBottom:10}}>LATEST RESEARCH — PubMed 2026</div>
        {loading ? <div style={{textAlign:"center",padding:20,color:"rgba(60,60,67,0.4)"}}>Loading...</div> :
          articles.map((a,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{color:"#1c1c1e",fontSize:14,fontWeight:600,marginBottom:4,lineHeight:1.4}}>{a.title}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"rgba(60,60,67,0.45)",fontSize:12}}>{a.journal} · {a.year}</span>
                <a href={a.url} target="_blank" rel="noreferrer" style={{color:"#FF6B35",fontSize:12,fontWeight:600}}>Read →</a>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function MedicalStores({ onBack }: { onBack: () => void }) {
  const STORES = [
    {name:"Medical Equipment",emoji:"🏥",items:["Blood Pressure Monitors","Glucometers","Pulse Oximeters","Nebulizers","Wheelchairs","Hospital Beds"]},
    {name:"Pharmacy Supplies",emoji:"💊",items:["OTC Medications","Vitamins & Supplements","First Aid Kits","Wound Care","Diagnostic Tests","Baby Health"]},
    {name:"Optical Supplies",emoji:"👁️",items:["Prescription Glasses","Contact Lenses","Eye Drops","Reading Glasses","Safety Goggles","Lens Solutions"]},
    {name:"Dental Supplies",emoji:"🦷",items:["Toothbrushes","Dental Floss","Mouthwash","Whitening Kits","Orthodontic Care","Dental Pain Relief"]},
    {name:"Rehabilitation",emoji:"🏃",items:["Exercise Equipment","Support Braces","TENS Machines","Massage Devices","Walking Aids","Compression Stockings"]},
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8fff8 0%,#f0fff8 60%,#e8f4ff 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(0,199,190,0.12)",border:"none",borderRadius:10,padding:"8px 14px",color:"#00C7BE",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🏪 Medical Stores</div>
      </div>
      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
        {STORES.map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:12}}>{s.emoji} {s.name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {s.items.map((item,j)=>(
                <span key={j} style={{background:"rgba(0,199,190,0.1)",border:"1px solid rgba(0,199,190,0.2)",borderRadius:20,padding:"5px 12px",color:"#00C7BE",fontSize:13,fontWeight:600}}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ type, onBack }: { type: string, onBack: () => void }) {
  const info: Record<string, any> = {
    mother: { emoji:"👩‍👧", title:"Mother & Child", color:"#FF2D55", desc:"Child health tracking, vaccination schedules, growth charts" },
    pharmacy: { emoji:"💊", title:"Pharmacy", color:"#30D158", desc:"Complete drug database, interactions, dosing calculator" },
    patient: { emoji:"🏥", title:"Patient Portal", color:"#FF9F0A", desc:"Symptom checker, emergency guide, medication reminders" },
  };
  const item = info[type] || { emoji:"🔜", title:"Coming Soon", color:"#0A84FF", desc:"This section is being built" };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff 0%,#e8f0fe 60%,#f5f0ff 100%)",fontFamily:"-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:`rgba(${item.color === '#FF2D55' ? '255,45,85' : item.color === '#30D158' ? '48,209,88' : '255,159,10'},0.12)`,border:"none",borderRadius:10,padding:"8px 14px",color:item.color,fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>{item.emoji} {item.title}</div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:24}}>{item.emoji}</div>
        <div style={{color:"#1c1c1e",fontSize:24,fontWeight:800,marginBottom:8}}>{item.title}</div>
        <div style={{color:"rgba(60,60,67,0.6)",fontSize:16,lineHeight:1.6,marginBottom:24}}>{item.desc}</div>
        <div style={{background:`linear-gradient(135deg,${item.color},${item.color}99)`,borderRadius:16,padding:"12px 24px"}}>
          <span style={{color:"#fff",fontSize:15,fontWeight:700}}>🚀 Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN AFIA COMPONENT ============
export default function AfiaHome({ onSelect, savedType }: { onSelect: (type: string|null, skip?: boolean) => void, savedType?: string|null }) {
  const [selected, setSelected] = useState<UserType>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [pressed, setPressed] = useState<string|null>(null);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setBgIndex(i=>(i+1)%BG_IMAGES.length), 5000);
    setTimeout(() => setShowGreeting(true), 300);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour<12?"صباح الخير ☀️":hour<17?"مساء النور 🌤️":"مساء الخير 🌙";

  // Render selected section
  if (selected === "doctor") return <DoctorSection onBack={()=>setSelected(null)} />;
  if (selected === "eyes") return <EyesSection onBack={()=>setSelected(null)} />;
  if (selected === "dental") return <DentalSection onBack={()=>setSelected(null)} />;
  if (selected === "rehab") return <RehabSection onBack={()=>setSelected(null)} />;
  if (selected === "stores") return <MedicalStores onBack={()=>setSelected(null)} />;
  if (selected === "mother" || selected === "pharmacy" || selected === "patient") return <ComingSoon type={selected} onBack={()=>setSelected(null)} />;

  return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Background */}
      <div style={{position:"absolute",inset:0}}>
        <img src={BG_IMAGES[bgIndex]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity 1.5s"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.8) 100%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",padding:"52px 20px 40px"}}>
        
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28,opacity:showGreeting?1:0,transform:showGreeting?"translateY(0)":"translateY(-15px)",transition:"all 0.7s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.12)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:20,padding:"10px 20px",marginBottom:16}}>
            <span style={{fontSize:22}}>⚕️</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"#fff",fontSize:20,fontWeight:800}}>عافية</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:10,fontWeight:500,letterSpacing:1}}>AFIA HEALTH</div>
            </div>
          </div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:16,marginBottom:4}}>{greeting}</div>
          <div style={{color:"#fff",fontSize:24,fontWeight:800,lineHeight:1.2}}>رفيقك الصحي الذكي</div>
          <div style={{color:"rgba(255,255,255,0.55)",fontSize:13,marginTop:4}}>Your intelligent health companion</div>
        </div>

        <div style={{flex:1}}/>

        {/* Who are you label */}
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{display:"inline-block",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:20,padding:"5px 14px"}}>
            <span style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:600}}>من أنت؟ • Who are you?</span>
          </div>
        </div>

        {/* 8 Cards Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {USER_TYPES.map(u=>(
            <button key={u.id}
              onTouchStart={()=>setPressed(u.id)}
              onTouchEnd={()=>setPressed(null)}
              onMouseDown={()=>setPressed(u.id)}
              onMouseUp={()=>setPressed(null)}
              onClick={()=>setSelected(u.id as UserType)}
              style={{
                background:"rgba(255,255,255,0.1)",
                backdropFilter:"blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                border:"1px solid rgba(255,255,255,0.18)",
                borderRadius:18,
                padding:"16px 12px",
                cursor:"pointer",
                textAlign:"center",
                transform:pressed===u.id?"scale(0.94)":"scale(1)",
                transition:"all 0.15s ease",
                boxShadow:pressed===u.id?`0 0 0 2px ${u.color},0 4px 20px ${u.color}40`:"0 2px 12px rgba(0,0,0,0.15)"
              }}>
              <div style={{fontSize:28,marginBottom:8}}>{u.emoji}</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:800,marginBottom:2}}>{u.label}</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:11,marginBottom:8}}>{u.sublabel}</div>
              <div style={{background:u.grad,borderRadius:8,padding:"3px 0"}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:700}}>Enter →</span>
              </div>
            </button>
          ))}
        </div>

        {/* Badges */}
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          {["🔬 Evidence-Based","🤖 AI-Powered","📚 PubMed Live"].map(b=>(
            <div key={b} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 10px"}}>
              <span style={{color:"rgba(255,255,255,0.65)",fontSize:11,fontWeight:500}}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
