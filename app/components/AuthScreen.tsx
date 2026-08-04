
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
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ fontSize:48, marginBottom:24 }}>📧</div>
      <div style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:12, textAlign:"center" }}>Check your email</div>
      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:15, textAlign:"center", lineHeight:1.6 }}>
        We sent a magic link to<br/>
        <span style={{ color:"#0A84FF" }}>{email}</span>
      </div>
      <div style={{ marginTop:32, color:"rgba(255,255,255,0.35)", fontSize:13 }}>Tap the link to sign in automatically</div>
    </div>
  );

  if (mode === "email") return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", flexDirection:"column", padding:32, paddingTop:80 }}>
      <button onClick={() => setMode("main")} style={{ background:"none", border:"none", color:"#0A84FF", fontSize:17, textAlign:"left", marginBottom:40, cursor:"pointer" }}>← Back</button>
      <div style={{ color:"#fff", fontSize:28, fontWeight:700, marginBottom:8 }}>Your email</div>
      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:15, marginBottom:32 }}>We'll send you a magic link to sign in</div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="doctor@example.com"
        style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:14, padding:"16px 20px", color:"#fff", fontSize:17, marginBottom:16, outline:"none" }}
      />
      {error && <div style={{ color:"#FF453A", fontSize:14, marginBottom:12 }}>{error}</div>}
      <button
        onClick={handleEmail}
        disabled={!email || loading}
        style={{ background: email ? "#0A84FF" : "rgba(255,255,255,0.1)", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:600, cursor: email ? "pointer" : "default" }}
      >
        {loading ? "Sending..." : "Continue"}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:32, paddingTop:80, paddingBottom:48 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🏥</div>
        <div style={{ color:"#fff", fontSize:32, fontWeight:800, marginBottom:8 }}>Cliniverse AI</div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:16 }}>Your clinical companion</div>
      </div>

      <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
        <button
          onClick={() => setMode("email")}
          style={{ background:"#0A84FF", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}
        >
          <span>✉️</span> Continue with Email
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0" }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} />
          <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }} />
        </div>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin } })}
          style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}
        >
          <span>🌐</span> Continue with Google
        </button>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider:"apple", options:{ redirectTo: window.location.origin } })}
          style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"16px", color:"#fff", fontSize:17, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}
        >
          <span>🍎</span> Continue with Apple
        </button>

        <button
          onClick={onComplete}
          style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:14, marginTop:8, cursor:"pointer" }}
        >
          Skip for now
        </button>

        <div style={{ color:"rgba(255,255,255,0.25)", fontSize:12, textAlign:"center", marginTop:8 }}>
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
}
