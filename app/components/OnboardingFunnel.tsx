"use client";
import { useState, useEffect, useRef } from "react";

const F = '-apple-system, SF Pro Display, sans-serif';

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80",
    accent: "#FF453A",
    title_en: "Real Clinical\nSimulations",
    sub_en: "Train with life-like emergency cases.\nKnow exactly what to do when it matters.",
    title_ar: "محاكاة سريرية\nحقيقية",
    sub_ar: "تدرب على حالات طارئة واقعية.\nاعرف ما يجب فعله في اللحظة الحرجة."
  },
  {
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    accent: "#0A84FF",
    title_en: "AI Medical\nConsultant",
    sub_en: "Evidence-based answers powered by Claude AI.\nPubMed + FDA + ClinicalTrials in seconds.",
    title_ar: "استشاري طبي\nذكاء اصطناعي",
    sub_ar: "إجابات مبنية على الأدلة العلمية.\nPubMed + FDA + التجارب السريرية."
  },
  {
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    accent: "#30D158",
    title_en: "Live Medical\nResearch",
    sub_en: "Latest research from NEJM, Lancet & BMJ.\nAI-summarised daily for busy clinicians.",
    title_ar: "أبحاث طبية\nحية يومياً",
    sub_ar: "أحدث الأبحاث من NEJM وLancet وBMJ.\nملخصة بالذكاء الاصطناعي يومياً."
  },
  {
    img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80",
    accent: "#FF9F0A",
    title_en: "Afia — Health\nFor Everyone",
    sub_en: "For doctors, mothers, patients & all.\nYour intelligent health companion.",
    title_ar: "عافية — صحة\nللجميع",
    sub_ar: "للأطباء والأمهات والمرضى والجميع.\nرفيقك الصحي الذكي."
  },
];

const FEATURES = [
  { en: "Unlimited clinical cases — all specialties", ar: "حالات سريرية غير محدودة" },
  { en: "AI Consultant — instant clinical guidance", ar: "استشاري ذكاء اصطناعي فوري" },
  { en: "PDF Certificates for every completed case", ar: "شهادات PDF لكل حالة" },
  { en: "Global leaderboard & clinical ranks", ar: "لوحة صدارة عالمية" },
  { en: "Drug Search — FDA + PubMed + Trials", ar: "بحث الأدوية — FDA + PubMed" },
  { en: "Guidelines 2026 — ESC · AHA · ADA", ar: "إرشادات 2026" },
];

export default function OnboardingFunnel({ onComplete }: { onComplete: (isPro: boolean) => void }) {
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState<"en"|"ar">("en");
  const [showPaywall, setShowPaywall] = useState(false);
  const [selected, setSelected] = useState<"monthly"|"annual">("annual");
  const timerRef = useRef<any>(null);
  const touchX = useRef(0);
  const DURATION = 5000;

  useEffect(() => {
    const deviceLang = navigator.language || "en";
    if (deviceLang.startsWith("ar")) setLang("ar");
  }, []);

  useEffect(() => {
    if (showPaywall) return;
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const step = 100 / (DURATION / 50);
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          if (slide < SLIDES.length - 1) setSlide(s => s + 1);
          else setShowPaywall(true);
          return 0;
        }
        return p + step;
      });
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slide, showPaywall]);

  const goNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slide < SLIDES.length - 1) setSlide(s => s + 1);
    else setShowPaywall(true);
  };

  const goPrev = () => {
    if (slide === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSlide(s => s - 1);
  };

  const s = SLIDES[slide];
  const title = lang === "ar" ? s.title_ar : s.title_en;
  const sub = lang === "ar" ? s.sub_ar : s.sub_en;
  const isRTL = lang === "ar";

  if (showPaywall) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", fontFamily:F, paddingBottom:40 }}>
      <div style={{ position:"relative", height:200 }}>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" alt=""
          style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,15,30,0.3) 0%,rgba(10,15,30,1) 100%)" }}/>
        <div style={{ position:"absolute", bottom:20, left:0, right:0, textAlign:"center" }}>
          <div style={{ color:"#fff", fontSize:28, fontWeight:900 }}>
            Cliniverse <span style={{ background:"linear-gradient(135deg,#0A84FF,#30D158)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>PRO</span>
          </div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:4 }}>
            {lang === "ar" ? "موثوق من أطباء حول العالم" : "Trusted by doctors worldwide"}
          </div>
        </div>
      </div>

      <div style={{ padding:"0 20px" }}>
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:18, border:"1px solid rgba(255,255,255,0.08)", padding:"12px 16px", marginBottom:16 }}>
          {FEATURES.map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0",
              borderBottom:i<FEATURES.length-1?"1px solid rgba(255,255,255,0.06)":"none",
              flexDirection: isRTL ? "row-reverse" : "row" }}>
              <span style={{ color:"#30D158", fontSize:16 }}>checkmark</span>
              <span style={{ color:"rgba(255,255,255,0.85)", fontSize:14, fontWeight:500, flex:1,
                textAlign: isRTL ? "right" : "left" }}>{lang === "ar" ? f.ar : f.en}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { id:"monthly", label_en:"Monthly", label_ar:"شهري", price:"$14.99", period_en:"/month", period_ar:"/شهر", save:null },
            { id:"annual", label_en:"Annual", label_ar:"سنوي", price:"$99.99", period_en:"/year", period_ar:"/سنة", save: lang==="ar"?"وفر 44%":"Save 44%" },
          ].map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id as any)}
              style={{ borderRadius:16, padding:"14px 12px", cursor:"pointer", textAlign:"center", position:"relative",
                border: selected===plan.id ? "2px solid #0A84FF" : "1.5px solid rgba(255,255,255,0.1)",
                background: selected===plan.id ? "rgba(10,132,255,0.12)" : "rgba(255,255,255,0.04)" }}>
              {plan.save && <div style={{ position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#0A84FF,#30D158)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,color:"white",whiteSpace:"nowrap" }}>{plan.save}</div>}
              <div style={{ color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:600,marginBottom:4 }}>{lang==="ar"?plan.label_ar:plan.label_en}</div>
              <div style={{ color:"#fff",fontSize:22,fontWeight:900 }}>{plan.price}</div>
              <div style={{ color:"rgba(255,255,255,0.4)",fontSize:11 }}>{lang==="ar"?plan.period_ar:plan.period_en}</div>
              {selected===plan.id && <div style={{ position:"absolute",top:8,right:8,width:16,height:16,borderRadius:"50%",background:"#0A84FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white" }}>ok</div>}
            </div>
          ))}
        </div>

        <button onClick={() => onComplete(true)}
          style={{ width:"100%",padding:"17px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#0A84FF,#0066CC)",color:"#fff",fontSize:17,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(10,132,255,0.35)",marginBottom:12 }}>
          {lang==="ar" ? (selected==="annual"?"ابدأ PRO — 8.33$/شهر":"ابدأ PRO — 14.99$/شهر") : (selected==="annual"?"Start PRO — $8.33/mo":"Start PRO — $14.99/mo")}
        </button>

        <button onClick={() => onComplete(false)}
          style={{ width:"100%",padding:"12px",borderRadius:14,border:"none",background:"transparent",color:"rgba(255,255,255,0.35)",fontSize:14,cursor:"pointer" }}>
          {lang==="ar" ? "متابعة مجاناً — حالة يومياً" : "Continue with Free — 1 case/day"}
        </button>

        <div style={{ display:"flex",justifyContent:"center",marginTop:16,gap:8 }}>
          {(["en","ar"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ background:lang===l?"rgba(10,132,255,0.2)":"transparent",border:"1px solid "+(lang===l?"#0A84FF":"rgba(255,255,255,0.15)"),borderRadius:20,padding:"5px 14px",color:lang===l?"#0A84FF":"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer" }}>
              {l==="en"?"English":"العربية"}
            </button>
          ))}
        </div>

        <div style={{ textAlign:"center",marginTop:12,color:"rgba(255,255,255,0.2)",fontSize:11 }}>
          {lang==="ar" ? "تجديد تلقائي. إلغاء في أي وقت." : "Auto-renews. Cancel anytime in Settings."}
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={e => { if (e.currentTarget === e.target || true) e.clientX > window.innerWidth * 0.3 ? goNext() : goPrev(); }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX.current; if(dx < -50) goNext(); else if(dx > 50) goPrev(); }}
      style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:F, overflow:"hidden" }}
    >
      <img src={s.img} alt="" style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }}/>
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.85) 100%)" }}/>

      <div style={{ position:"absolute",top:52,left:20,right:80,display:"flex",gap:4,zIndex:10 }}>
        {SLIDES.map((_,i) => (
          <div key={i} style={{ flex:1,height:2.5,borderRadius:2,background:"rgba(255,255,255,0.2)",overflow:"hidden" }}>
            <div style={{ height:"100%",background:"#fff",width:i<slide?"100%":i===slide?progress+"%":"0%",transition:"width 0.05s linear" }}/>
          </div>
        ))}
      </div>

      <div style={{ position:"absolute",top:56,right:20,zIndex:10,display:"flex",gap:6 }}>
        {(["en","ar"] as const).map(l => (
          <button key={l} onClick={e=>{e.stopPropagation();setLang(l);}}
            style={{ background:lang===l?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 10px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer" }}>
            {l==="en"?"EN":"ع"}
          </button>
        ))}
      </div>

      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0 28px 60px",direction:isRTL?"rtl":"ltr" }}>
        <div style={{ width:8,height:8,borderRadius:"50%",background:s.accent,marginBottom:16,boxShadow:"0 0 12px "+s.accent }}/>
        <div style={{ color:"#fff",fontSize:36,fontWeight:800,lineHeight:1.15,letterSpacing:-0.5,marginBottom:12,whiteSpace:"pre-line" }}>
          {title}
        </div>
        <div style={{ color:"rgba(255,255,255,0.7)",fontSize:16,lineHeight:1.6,marginBottom:32,whiteSpace:"pre-line" }}>
          {sub}
        </div>
        <button onClick={e=>{e.stopPropagation();goNext();}}
          style={{ background:"rgba(255,255,255,0.15)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:16,padding:"14px 28px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer" }}>
          {lang==="ar" ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  );
}
