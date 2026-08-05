"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSub, setShowSub] = useState(false);

  const texts = ["Health", "عافية", "Santé"];

  useEffect(() => {
    setTimeout(() => setShowLogo(true), 300);
    setTimeout(() => setShowText(true), 800);
    setTimeout(() => setShowSub(true), 1200);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setTextIndex(i => (i + 1) % texts.length);
    }, 800);

    const doneTimer = setTimeout(() => {
      clearInterval(textInterval);
      onDone();
    }, 3200);

    return () => { 
      clearInterval(progressInterval); 
      clearInterval(textInterval);
      clearTimeout(doneTimer);
    };


  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      fontFamily:"-apple-system, SF Pro Display, sans-serif",
      overflow:"hidden"
    }}>
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80"
        alt=""
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
      />

      {/* Gradient Overlay */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(180deg,rgba(5,10,25,0.7) 0%,rgba(5,10,25,0.85) 50%,rgba(5,10,25,0.95) 100%)"
      }}/>

      {/* Ambient glow */}
      <div style={{
        position:"absolute", top:"30%", left:"50%",
        transform:"translateX(-50%)",
        width:300, height:300,
        background:"radial-gradient(circle,rgba(10,132,255,0.2) 0%,transparent 70%)",
        pointerEvents:"none"
      }}/>

      {/* Content */}
      <div style={{
        position:"relative", zIndex:1,
        height:"100vh", display:"flex",
        flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"0 32px"
      }}>

        {/* Logo */}
        <div style={{
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          marginBottom: 32
        }}>
          {/* SVG Logo */}
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#0A84FF" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0A84FF"/>
                <stop offset="100%" stopColor="#30D158"/>
              </linearGradient>
            </defs>
            {/* Outer glow */}
            <circle cx="45" cy="45" r="44" fill="url(#glow)"/>
            {/* Circle border */}
            <circle cx="45" cy="45" r="40" fill="none" stroke="url(#circleGrad)" strokeWidth="1.5" opacity="0.6"/>
            {/* Inner circle */}
            <circle cx="45" cy="45" r="34" fill="rgba(10,132,255,0.08)" stroke="rgba(10,132,255,0.2)" strokeWidth="1"/>
            {/* ECG Line */}
            <polyline
              points="12,45 20,45 24,35 28,55 32,38 36,52 40,45 50,45 54,30 58,60 62,45 70,45 78,45"
              fill="none" stroke="url(#circleGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Center dot */}
            <circle cx="45" cy="45" r="3" fill="#0A84FF" opacity="0.8"/>
          </svg>
        </div>

        {/* App Name */}
        <div style={{
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease",
          textAlign: "center",
          marginBottom: 12
        }}>
          <div style={{
            color: "#fff",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: -1,
            marginBottom: 4
          }}>
            Cliniverse AI
          </div>
          <div style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 400,
            letterSpacing: 3,
            textTransform: "uppercase"
          }}>
            Virtual Hospital
          </div>
        </div>

        {/* Rotating subtitle */}
        <div style={{
          opacity: showSub ? 1 : 0,
          transition: "all 0.5s ease",
          marginBottom: 60
        }}>
          <div style={{
            color: "#0A84FF",
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
            minWidth: 120,
            transition: "all 0.3s ease"
          }}>
            {texts[textIndex]}
          </div>
        </div>

        {/* Loading bar */}
        <div style={{
          position: "absolute",
          bottom: 60,
          left: 40, right: 40
        }}>
          <div style={{
            height: 2,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 1,
            overflow: "hidden"
          }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg,#0A84FF,#30D158)",
              borderRadius: 1,
              transition: "width 0.05s linear",
              boxShadow: "0 0 8px rgba(10,132,255,0.6)"
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}
