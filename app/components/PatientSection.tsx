"use client";
import { useState, useEffect } from "react";

const SYMPTOMS = [
  { id:"chest", emoji:"🫀", label:"Chest Pain", ar:"ألم الصدر", urgent:true },
  { id:"breath", emoji:"🫁", label:"Shortness of Breath", ar:"ضيق التنفس", urgent:true },
  { id:"headache", emoji:"🧠", label:"Headache", ar:"صداع", urgent:false },
  { id:"fever", emoji:"🌡️", label:"Fever", ar:"حمى", urgent:false },
  { id:"abdo", emoji:"🫃", label:"Abdominal Pain", ar:"ألم البطن", urgent:false },
  { id:"dizzy", emoji:"💫", label:"Dizziness", ar:"دوار", urgent:false },
  { id:"back", emoji:"🦴", label:"Back Pain", ar:"ألم الظهر", urgent:false },
  { id:"skin", emoji:"🩹", label:"Skin Rash", ar:"طفح جلدي", urgent:false },
];

const EMERGENCY_SIGNS = [
  { sign:"Chest pain + sweating", ar:"ألم صدر مع تعرق", action:"Call 911 immediately" },
  { sign:"Sudden weakness one side", ar:"ضعف مفاجئ في جانب", action:"Stroke — call 911" },
  { sign:"Difficulty breathing", ar:"صعوبة التنفس", action:"Emergency services now" },
  { sign:"Loss of consciousness", ar:"فقدان الوعي", action:"Call 911 — recovery position" },
  { sign:"Severe allergic reaction", ar:"حساسية شديدة", action:"Epinephrine if available + 911" },
  { sign:"Severe bleeding", ar:"نزيف شديد", action:"Apply pressure + call 911" },
];

const SYMPTOM_INFO: Record<string, any> = {
  chest: { causes:["Heart attack","Angina","GERD","Costochondritis","Anxiety"], when_er:"Sudden severe pain, sweating, arm pain → ER immediately", selfcare:["Rest","Avoid exertion","Take prescribed nitrates"] },
  breath: { causes:["Asthma","COPD","Heart failure","Pneumonia","Anxiety"], when_er:"Cannot complete sentences, lips turning blue → ER", selfcare:["Sit upright","Use inhaler if prescribed","Open window"] },
  headache: { causes:["Tension headache","Migraine","Dehydration","Hypertension","Sinusitis"], when_er:"Worst headache of life, neck stiffness, fever → ER", selfcare:["Paracetamol 500-1000mg","Hydrate","Rest in dark room"] },
  fever: { causes:["Viral infection","Bacterial infection","COVID-19","UTI","Medication"], when_er:"Fever >40°C, confusion, rash, stiff neck → ER", selfcare:["Paracetamol 500-1000mg q4-6h","Hydrate well","Rest"] },
  abdo: { causes:["Gastroenteritis","IBS","Appendicitis","Kidney stones","Ulcer"], when_er:"Severe rigid abdomen, blood in stool, cannot eat → ER", selfcare:["Small sips of water","Avoid solid food initially","Rest"] },
  dizzy: { causes:["Dehydration","Orthostatic hypotension","BPPV","Anaemia","Medication"], when_er:"Fainting, chest pain, new neurological symptoms → ER", selfcare:["Sit or lie down","Hydrate","Rise slowly from sitting"] },
  back: { causes:["Muscle strain","Disc herniation","Kidney issue","Osteoarthritis","Poor posture"], when_er:"Numbness/weakness in legs, bowel/bladder problems → ER", selfcare:["Paracetamol/ibuprofen","Gentle movement","Heat pack"] },
  skin: { causes:["Allergic reaction","Eczema","Psoriasis","Infection","Drug reaction"], when_er:"Swelling of face/throat, difficulty breathing → ER immediately", selfcare:["Antihistamine","Avoid trigger","Moisturise"] },
};

export default function PatientSection({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string|null>(null);
  const [lang, setLang] = useState<"en"|"ar">("en");
  const [tab, setTab] = useState<"info"|"emergency">("info");
  const [search, setSearch] = useState("");

  const symptom = SYMPTOMS.find(s => s.id === selected);
  const info = selected ? SYMPTOM_INFO[selected] : null;

  if (!selected) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff8f0 0%,#fff0e8 60%,#fff8f4 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(255,159,10,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF9F0A",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🏥 Patient Guide</div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {(["en","ar"] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?"rgba(255,159,10,0.15)":"transparent",border:"1px solid "+(lang===l?"#FF9F0A":"rgba(0,0,0,0.1)"),borderRadius:20,padding:"4px 10px",color:lang===l?"#FF9F0A":"rgba(60,60,67,0.5)",fontSize:12,cursor:"pointer"}}>
              {l==="en"?"EN":"ع"}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{display:"flex",background:"rgba(118,118,128,0.12)",borderRadius:12,padding:2,gap:2,marginBottom:16}}>
          {[{id:"info",label:lang==="ar"?"الأعراض":"Symptoms"},{id:"emergency",label:lang==="ar"?"طوارئ":"Emergency"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              style={{flex:1,background:tab===t.id?"#fff":"transparent",border:"none",borderRadius:10,padding:"8px 4px",color:tab===t.id?"#1c1c1e":"rgba(60,60,67,0.5)",fontSize:14,fontWeight:tab===t.id?700:400,cursor:"pointer",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.1)":"none"}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==="info" && (
          <div>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={lang==="ar"?"ابحث عن عرض...":"Search symptom..."}
              style={{width:"100%",background:"rgba(255,255,255,0.8)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:14,padding:"12px 16px",color:"#1c1c1e",fontSize:16,outline:"none",boxSizing:"border-box",marginBottom:16}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {SYMPTOMS.filter(s=>search===""||s.label.toLowerCase().includes(search.toLowerCase())).map(s=>(
                <button key={s.id} onClick={()=>setSelected(s.id)}
                  style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:`1px solid ${s.urgent?"rgba(255,69,58,0.2)":"rgba(255,255,255,0.9)"}`,borderRadius:18,padding:"16px 12px",cursor:"pointer",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",position:"relative"}}>
                  {s.urgent && <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:"50%",background:"#FF453A"}}/>}
                  <div style={{fontSize:28,marginBottom:8}}>{s.emoji}</div>
                  <div style={{color:"#1c1c1e",fontSize:13,fontWeight:700}}>{lang==="ar"?s.ar:s.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab==="emergency" && (
          <div>
            <div style={{background:"rgba(255,69,58,0.08)",border:"1px solid rgba(255,69,58,0.2)",borderRadius:16,padding:"14px 16px",marginBottom:16,textAlign:"center"}}>
              <div style={{color:"#FF453A",fontSize:16,fontWeight:800,marginBottom:4}}>{lang==="ar"?"⚠️ علامات خطر فورية":"⚠️ Emergency Warning Signs"}</div>
              <div style={{color:"rgba(60,60,67,0.7)",fontSize:13}}>{lang==="ar"?"اتصل بالطوارئ فوراً عند رؤية هذه العلامات":"Call emergency services immediately if you see these"}</div>
            </div>
            {EMERGENCY_SIGNS.map((e,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,69,58,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
                <div style={{color:"#1c1c1e",fontSize:15,fontWeight:700,marginBottom:4}}>{lang==="ar"?e.ar:e.sign}</div>
                <div style={{background:"rgba(255,69,58,0.08)",borderRadius:8,padding:"6px 10px"}}>
                  <span style={{color:"#FF453A",fontSize:13,fontWeight:600}}>→ {e.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#fff8f0 0%,#fff0e8 60%,#fff8f4 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={()=>setSelected(null)} style={{background:"rgba(255,159,10,0.1)",border:"none",borderRadius:10,padding:"8px 14px",color:"#FF9F0A",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700}}>{symptom?.emoji} {lang==="ar"?symptom?.ar:symptom?.label}</div>
        {symptom?.urgent && <span style={{background:"rgba(255,69,58,0.1)",color:"#FF453A",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6}}>URGENT</span>}
      </div>
      <div style={{padding:"16px"}}>
        {info && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:16,padding:"16px 18px"}}>
              <div style={{color:"rgba(60,60,67,0.5)",fontSize:12,fontWeight:700,marginBottom:10}}>🔍 {lang==="ar"?"الأسباب الشائعة":"COMMON CAUSES"}</div>
              {info.causes.map((c:string,i:number)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:i<info.causes.length-1?"1px solid rgba(0,0,0,0.06)":"none",color:"#1c1c1e",fontSize:15}}>{c}</div>
              ))}
            </div>
            <div style={{background:"rgba(255,69,58,0.06)",border:"1px solid rgba(255,69,58,0.2)",borderRadius:16,padding:"16px 18px"}}>
              <div style={{color:"#FF453A",fontSize:12,fontWeight:700,marginBottom:8}}>🚨 {lang==="ar"?"متى تذهب للطوارئ":"WHEN TO GO TO ER"}</div>
              <div style={{color:"rgba(60,60,67,0.85)",fontSize:14,lineHeight:1.6}}>{info.when_er}</div>
            </div>
            <div style={{background:"rgba(48,209,88,0.06)",border:"1px solid rgba(48,209,88,0.2)",borderRadius:16,padding:"16px 18px"}}>
              <div style={{color:"#30D158",fontSize:12,fontWeight:700,marginBottom:10}}>💊 {lang==="ar"?"رعاية ذاتية":"SELF-CARE TIPS"}</div>
              {info.selfcare.map((t:string,i:number)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"6px 0"}}>
                  <span style={{color:"#30D158"}}>✓</span>
                  <span style={{color:"rgba(60,60,67,0.85)",fontSize:14}}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,159,10,0.06)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:14,padding:"12px 16px",textAlign:"center"}}>
              <div style={{color:"rgba(60,60,67,0.5)",fontSize:12}}>⚕️ {lang==="ar"?"هذا للمعلومات فقط — استشر طبيبك":"For information only — always consult your doctor"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
