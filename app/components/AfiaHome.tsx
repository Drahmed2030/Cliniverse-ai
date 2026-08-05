"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const MotherSection = dynamic(() => import("./MotherSection"), { ssr: false });
const PatientSection = dynamic(() => import("./PatientSection"), { ssr: false });
const PharmacySection = dynamic(() => import("./PharmacySection"), { ssr: false });
const EyesSection = dynamic(() => import("./EyesSection"), { ssr: false });
const DentalSection = dynamic(() => import("./DentalSection"), { ssr: false });
const RehabSection = dynamic(() => import("./RehabSection"), { ssr: false });
const MedicalStores = dynamic(() => import("./MedicalStores"), { ssr: false });

type UserType = "doctor"|"mother"|"pharmacy"|"patient"|"eyes"|"dental"|"rehab"|"stores"|null;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
];

const SVG_ICONS: Record<string, JSX.Element> = {
  doctor: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="10" r="6" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="23" cy="23" r="4" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="23" y1="20" x2="23" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="23" x2="26" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  mother: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4 C16 4, 10 8, 10 14 C10 18, 13 21, 16 22 C19 21, 22 18, 22 14 C22 8, 16 4, 16 4Z" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="10" r="2.5" fill="white" opacity="0.6"/>
      <path d="M8 28 C8 24, 11 22, 16 22 C21 22, 24 24, 24 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="22" cy="8" r="2" fill="white" opacity="0.8"/>
    </svg>
  ),
  pharmacy: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="12" width="20" height="12" rx="6" stroke="white" strokeWidth="2" fill="none"/>
      <line x1="16" y1="12" x2="16" y2="24" stroke="white" strokeWidth="2"/>
      <rect x="11" y="6" width="10" height="8" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="13" y1="17" x2="15" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  patient: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="9" r="5" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M6 28 C6 22, 10 18, 16 18 C22 18, 26 22, 26 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <polyline points="8,22 11,19 13,22 15,18 17,22 19,20 21,22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  eyes: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4 16 C4 16, 8 8, 16 8 C24 8, 28 16, 28 16 C28 16, 24 24, 16 24 C8 24, 4 16, 4 16Z" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="16" r="4" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="16" r="1.5" fill="white"/>
    </svg>
  ),
  dental: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M10 6 C8 6, 6 8, 6 11 C6 14, 8 16, 10 18 L12 28 C12 28, 13 30, 16 28 C19 30, 20 28, 20 28 L22 18 C24 16, 26 14, 26 11 C26 8, 24 6, 22 6 C20 6, 18 8, 16 8 C14 8, 12 6, 10 6Z" stroke="white" strokeWidth="2" fill="none"/>
      <line x1="12" y1="14" x2="20" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  rehab: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="20" cy="6" r="3" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M20 9 L18 16 L12 20 L14 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M18 16 L22 20 L26 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 24 L12 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M14 24 L18 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  stores: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="14" width="20" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M10 14 L10 10 C10 8, 11 6, 13 6 L19 6 C21 6, 22 8, 22 10 L22 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="19" x2="16" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="13" y1="22" x2="19" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const USER_TYPES = [
  { id:"doctor",   en:"Doctor",       ar:"طبيب",    color:"#0A84FF", grad:"linear-gradient(135deg,#0A84FF,#0066CC)" },
  { id:"mother",   en:"Mother & Child",ar:"الأم والطفل", color:"#FF2D55", grad:"linear-gradient(135deg,#FF2D55,#C0004A)" },
  { id:"pharmacy", en:"Pharmacy",     ar:"صيدلية",  color:"#30D158", grad:"linear-gradient(135deg,#30D158,#00A83A)" },
  { id:"patient",  en:"Patient Guide",ar:"مريض",    color:"#FF9F0A", grad:"linear-gradient(135deg,#FF9F0A,#FF6B00)" },
  { id:"eyes",     en:"Ophthalmology",ar:"عيون",    color:"#64D2FF", grad:"linear-gradient(135deg,#64D2FF,#0A84FF)" },
  { id:"dental",   en:"Dentistry",    ar:"أسنان",   color:"#BF5AF2", grad:"linear-gradient(135deg,#BF5AF2,#9B00E8)" },
  { id:"rehab",    en:"Rehabilitation",ar:"تأهيل",  color:"#FF6B35", grad:"linear-gradient(135deg,#FF6B35,#FF2D00)" },
  { id:"stores",   en:"Medical Stores",ar:"محلات طبية", color:"#00C7BE", grad:"linear-gradient(135deg,#00C7BE,#007AFF)" },
];

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
  const greeting = hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";
  const greetingAr = hour<12?"صباح الخير":hour<17?"مساء النور":"مساء الخير";

  if (selected === "doctor") { onSelect("doctor", true); return null; }
  if (selected === "mother") return <MotherSection onBack={()=>setSelected(null)} />;
  if (selected === "patient") return <PatientSection onBack={()=>setSelected(null)} />;
  if (selected === "pharmacy") return <PharmacySection onBack={()=>setSelected(null)} />;
  if (selected === "eyes") return <EyesSection onBack={()=>setSelected(null)} />;
  if (selected === "dental") return <DentalSection onBack={()=>setSelected(null)} />;
  if (selected === "rehab") return <RehabSection onBack={()=>setSelected(null)} />;
  if (selected === "stores") return <MedicalStores onBack={()=>setSelected(null)} />;

  return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Background */}
      <div style={{position:"absolute",inset:0}}>
        <img src={BG_IMAGES[bgIndex]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity 1.5s"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.82) 100%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",padding:"52px 20px 40px"}}>
        
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28,opacity:showGreeting?1:0,transform:showGreeting?"translateY(0)":"translateY(-15px)",transition:"all 0.7s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.12)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:20,padding:"10px 20px",marginBottom:16}}>
            <span style={{fontSize:22}}>⚕️</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"#fff",fontSize:20,fontWeight:800,letterSpacing:-0.3}}>Afia</div>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,letterSpacing:2}}>عافية · HEALTH</div>
            </div>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:15,marginBottom:4}}>{greeting} 👋</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{greetingAr}</div>
          <div style={{color:"#fff",fontSize:22,fontWeight:800,lineHeight:1.2,marginTop:8}}>Your intelligent health companion</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginTop:4}}>رفيقك الصحي الذكي</div>
        </div>

        <div style={{flex:1}}/>

        {/* Who are you */}
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{display:"inline-block",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:20,padding:"5px 14px"}}>
            <span style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:600}}>Who are you? </span>
            <span style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>· من أنت؟</span>
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
                background:"rgba(255,255,255,0.08)",
                backdropFilter:"blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                border:"1px solid rgba(255,255,255,0.15)",
                borderRadius:20,
                padding:"18px 14px",
                cursor:"pointer",
                textAlign:"center",
                transform:pressed===u.id?"scale(0.94)":"scale(1)",
                transition:"all 0.15s ease",
                boxShadow:pressed===u.id?`0 0 0 2px ${u.color},0 4px 20px ${u.color}40`:"0 2px 12px rgba(0,0,0,0.15)"
              }}>
              {/* SVG Icon */}
              <div style={{width:52,height:52,borderRadius:16,background:u.grad,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",boxShadow:`0 4px 16px ${u.color}50`}}>
                {SVG_ICONS[u.id]}
              </div>
              {/* English — big */}
              <div style={{color:"#fff",fontSize:14,fontWeight:700,marginBottom:3,letterSpacing:-0.2}}>{u.en}</div>
              {/* Arabic — small */}
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:400,marginBottom:10}}>{u.ar}</div>
              {/* Enter button */}
              <div style={{background:u.grad,borderRadius:8,padding:"4px 0",boxShadow:`0 2px 8px ${u.color}40`}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:700}}>Enter →</span>
              </div>
            </button>
          ))}
        </div>

        {/* Badges */}
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          {[
            {en:"Evidence-Based",ar:"مبني على الأدلة"},
            {en:"AI-Powered",ar:"بالذكاء الاصطناعي"},
            {en:"PubMed Live",ar:"PubMed حي"},
          ].map(b=>(
            <div key={b.en} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"5px 12px"}}>
              <span style={{color:"rgba(255,255,255,0.7)",fontSize:11,fontWeight:600}}>🔬 {b.en} </span>
              <span style={{color:"rgba(255,255,255,0.3)",fontSize:10}}>{b.ar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
