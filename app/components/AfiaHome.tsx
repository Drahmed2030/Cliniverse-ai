"use client";
import { useState, useEffect } from "react";

type UserType = "doctor" | "mother" | "pharmacy" | "patient" | null;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
];

const USER_TYPES = [
  { id:"doctor", label:"طبيب", sublabel:"Doctor", emoji:"👨‍⚕️", color:"#0A84FF", grad:"linear-gradient(135deg,#0A84FF,#0066CC)", desc:"Clinical cases, guidelines, calculators" },
  { id:"mother", label:"الأم", sublabel:"Mother", emoji:"👩", color:"#FF2D55", grad:"linear-gradient(135deg,#FF2D55,#C0004A)", desc:"Child health, vaccines, growth" },
  { id:"pharmacy", label:"صيدلية", sublabel:"Pharmacy", emoji:"💊", color:"#30D158", grad:"linear-gradient(135deg,#30D158,#00A83A)", desc:"Drug search, interactions, doses" },
  { id:"patient", label:"مريض", sublabel:"Patient", emoji:"🏥", color:"#FF9F0A", grad:"linear-gradient(135deg,#FF9F0A,#FF6B00)", desc:"Symptoms, emergency, medications" },
];

export default function AfiaHome({ onSelect, savedType }: { onSelect: (type: UserType, skipSurvey?: boolean) => void, savedType?: UserType }) {
  const [bgIndex, setBgIndex] = useState(0);
  const [pressed, setPressed] = useState<string|null>(null);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % BG_IMAGES.length);
    }, 5000);
    setTimeout(() => setShowGreeting(true), 500);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء النور" : "مساء الخير";

  return (
    <div style={{minHeight:"100vh",position:"relative",overflow:"hidden",fontFamily:"-apple-system,SF Pro Display,sans-serif"}}>
      
      {/* Background Image */}
      <div style={{position:"absolute",inset:0,transition:"opacity 1.5s ease"}}>
        <img src={BG_IMAGES[bgIndex]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.75) 100%)"}}/>
      </div>

      {/* Glass overlay top */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:200,background:"linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%)",backdropFilter:"blur(0px)"}}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",padding:"60px 24px 40px"}}>
        
        {/* Top — Logo + Greeting */}
        <div style={{textAlign:"center",marginBottom:40,opacity:showGreeting?1:0,transform:showGreeting?"translateY(0)":"translateY(-20px)",transition:"all 0.8s ease"}}>
          
          {/* Logo */}
          <div style={{marginBottom:16}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.12)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:20,padding:"10px 20px"}}>
              <span style={{fontSize:24}}>⚕️</span>
              <div style={{textAlign:"left"}}>
                <div style={{color:"#fff",fontSize:22,fontWeight:800,letterSpacing:-0.5}}>عافية</div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,fontWeight:500,letterSpacing:1}}>AFIA HEALTH</div>
              </div>
            </div>
          </div>

          <div style={{color:"rgba(255,255,255,0.8)",fontSize:17,fontWeight:400,marginBottom:6}}>{greeting} 👋</div>
          <div style={{color:"#fff",fontSize:28,fontWeight:800,lineHeight:1.2,marginBottom:8}}>رفيقك الصحي الذكي</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:15}}>Your intelligent health companion</div>
        </div>

        {/* Spacer */}
        <div style={{flex:1}}/>

        {/* Who are you */}
        <div style={{marginBottom:24}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{display:"inline-block",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 16px"}}>
              <span style={{color:"rgba(255,255,255,0.9)",fontSize:14,fontWeight:600}}>من أنت؟ • Who are you?</span>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {USER_TYPES.map(u=>(
              <button key={u.id}
                onTouchStart={()=>setPressed(u.id)}
                onTouchEnd={()=>setPressed(null)}
                onMouseDown={()=>setPressed(u.id)}
                onMouseUp={()=>setPressed(null)}
                onClick={()=>onSelect(u.id as UserType)}
                style={{
                  background:"rgba(255,255,255,0.1)",
                  backdropFilter:"blur(20px)",
                  WebkitBackdropFilter:"blur(20px)",
                  border:"1px solid rgba(255,255,255,0.2)",
                  borderRadius:20,
                  padding:"20px 16px",
                  cursor:"pointer",
                  textAlign:"center",
                  transform:pressed===u.id?"scale(0.95)":"scale(1)",
                  transition:"all 0.15s ease",
                  boxShadow:pressed===u.id?`0 0 0 2px ${u.color}`:"none"
                }}>
                <div style={{fontSize:36,marginBottom:10}}>{u.emoji}</div>
                <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:2}}>{u.label}</div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:500,marginBottom:8}}>{u.sublabel}</div>
                <div style={{background:u.grad,borderRadius:10,padding:"4px 0"}}>
                  <span style={{color:"#fff",fontSize:11,fontWeight:600}}>Enter →</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom badges */}
        <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
          {["🔬 Evidence-Based","🤖 AI-Powered","📚 PubMed"].map(b=>(
            <div key={b} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 12px"}}>
              <span style={{color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:500}}>{b}</span>
            </div>
          ))}
        </div>

        {/* If already selected */}
        {savedType && (
          <button onClick={()=>onSelect(savedType, true)}
            style={{marginTop:16,background:"rgba(255,255,255,0.08)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:14,padding:"10px",color:"rgba(255,255,255,0.6)",fontSize:13,cursor:"pointer"}}>
            Continue as {USER_TYPES.find(u=>u.id===savedType)?.label} →
          </button>
        )}
      </div>
    </div>
  );
}
