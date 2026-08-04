"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function AuthScreen({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"main" | "email">("main");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmail = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, fontFamily:"-apple-system, SF Pro Display, sans-serif" }}>
      <div style={{ fontSize:56, marginBottom:24 }}>📧</div>
      <div style={{ color:"#fff", fontSize:24, fontWeight:700, marginBottom:12, textAlign:"center" }}>Check your email</div>
      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:16, textAlign:"center", lineHeight:1.6 }}>
        We sent a magic link to<br/>
        <span style={{ color:"#0A84FF" }}>{email}</span>
      </div>
      <div style={{ marginTop:32, color:"rgba(255,255,255,0.3)", fontSize:13 }}>Tap the link to sign in automatically</div>
    </div>
  );

  if (mode === "email") return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", flexDirection:"column", padding:32, paddingTop:80, fontFamily:"-apple-system, SF Pro Display, sans-serif" }}>
      <button onClick={() => setMode("main")} style={{ background:"none", border:"none", color:"#0A84FF", fontSize:17, textAlign:"left", marginBottom:40, cursor:"pointer" }}>← Back</button>
      <div style={{ color:"#fff", fontSize:30, fontWeight:700, marginBottom:8 }}>Your email</div>
      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:15, marginBottom:32 }}>We'll send you a magic link to sign in</div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="doctor@example.com"
        style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"16px 20px", color:"#fff", fontSize:17, marginBottom:16, outline:"none", fontFamily:"-apple-system, sans-serif" }}
      />
      {error && <div style={{ color:"#FF453A", fontSize:14, marginBottom:12 }}>{error}</div>}
      <button
        onClick={handleEmail}
        disabled={!email || loading}
        style={{ background: email ? "linear-gradient(135deg,#0A84FF,#0066CC)" : "rgba(255,255,255,0.1)", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:600, cursor: email ? "pointer" : "default", boxShadow: email ? "0 4px 20px rgba(10,132,255,0.4)" : "none" }}
      >
        {loading ? "Sending..." : "Continue"}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:32, paddingTop:72, paddingBottom:48, fontFamily:"-apple-system, SF Pro Display, sans-serif", position:"relative", overflow:"hidden" }}>
      
      {/* Background Logo Watermark */}
      <svg style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", opacity:0.04, width:340, height:340, pointerEvents:"none" }} viewBox="0 0 100 100">
        <path d="M 85 50 A 35 35 0 1 1 84.9 49" fill="none" stroke="#0A84FF" strokeWidth="8" strokeLinecap="round"/>
        <polyline points="35,52 48,65 72,38" fill="none" stroke="#00C896" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* Top Section */}
      <div style={{ textAlign:"center", zIndex:1 }}>
        <svg width="72" height="72" viewBox="0 0 100 100" style={{ marginBottom:20 }}>
          <circle cx="50" cy="50" r="48" fill="rgba(10,132,255,0.1)" stroke="rgba(10,132,255,0.3)" strokeWidth="1"/>
          <path d="M 85 50 A 35 35 0 1 1 84.9 49" fill="none" stroke="#0A84FF" strokeWidth="7" strokeLinecap="round"/>
          <polyline points="33,52 46,65 70,38" fill="none" stroke="#00C896" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ color:"#fff", fontSize:34, fontWeight:800, marginBottom:6, letterSpacing:-0.5 }}>Cliniverse AI</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:16, fontWeight:400 }}>Your clinical companion</div>
      </div>

      {/* Buttons */}
      <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:12, zIndex:1 }}>
        
        {/* Email */}
        <button
          onClick={() => setMode("email")}
          style={{ background:"linear-gradient(135deg,#0A84FF,#0066CC)", border:"none", borderRadius:16, padding:"17px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 24px rgba(10,132,255,0.35)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
          Continue with Email
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0" }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
          <span style={{ color:"rgba(255,255,255,0.25)", fontSize:13 }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google */}
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin } })}
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"17px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        {/* Apple */}
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider:"apple", options:{ redirectTo: window.location.origin } })}
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"17px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          Continue with Apple
        </button>

        <button
          onClick={onComplete}
          style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:14, marginTop:4, cursor:"pointer", padding:"8px" }}
        >
          Skip for now
        </button>

        <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, textAlign:"center" }}>
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
}
