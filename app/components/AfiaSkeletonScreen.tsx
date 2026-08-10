"use client";

export default function AfiaSkeletonScreen() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#F8FAFC",
      fontFamily: "-apple-system,'SF Pro Display',sans-serif",
      paddingBottom: 100,
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sk { 
          background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
          background-size: 800px 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 8px;
        }
        .fade { animation: fadeIn 0.4s ease both; }
      `}</style>

      {/* Header gradient skeleton */}
      <div style={{
        background: "linear-gradient(135deg,rgba(13,148,136,0.15),rgba(30,64,175,0.15))",
        padding: "52px 20px 28px",
        marginBottom: 4,
      }}>
        <div className="sk fade" style={{width:100,height:12,marginBottom:12,animationDelay:"0ms"}}/>
        <div className="sk fade" style={{width:220,height:30,marginBottom:10,animationDelay:"60ms"}}/>
        <div className="sk fade" style={{width:160,height:12,animationDelay:"120ms"}}/>
      </div>

      {/* Family switcher skeleton */}
      <div style={{padding:"16px 20px 20px",display:"flex",gap:12,alignItems:"center"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} className="sk fade" style={{
            width:48,height:48,borderRadius:"50%",flexShrink:0,
            animationDelay:`${i*60}ms`,
          }}/>
        ))}
        <div className="sk fade" style={{
          width:48,height:48,borderRadius:"50%",flexShrink:0,
          animationDelay:"240ms",
        }}/>
      </div>

      {/* Section title */}
      <div style={{padding:"0 20px 12px"}}>
        <div className="sk fade" style={{width:140,height:11,animationDelay:"80ms"}}/>
      </div>

      {/* Cards grid */}
      <div style={{padding:"0 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} className="fade" style={{
            background:"#FFFFFF",
            borderRadius:18,
            padding:"18px 16px",
            border:"1px solid #E2E8F0",
            boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            animationDelay:`${100 + i*50}ms`,
          }}>
            <div className="sk" style={{width:40,height:40,borderRadius:12,marginBottom:14}}/>
            <div className="sk" style={{width:"75%",height:13,borderRadius:6,marginBottom:8}}/>
            <div className="sk" style={{width:"55%",height:11,borderRadius:6,marginBottom:6}}/>
            <div className="sk" style={{width:"40%",height:10,borderRadius:6}}/>
          </div>
        ))}
      </div>

      {/* Bottom pulse dots */}
      <div style={{textAlign:"center",paddingTop:32,display:"flex",justifyContent:"center",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:6,height:6,borderRadius:"50%",
            background:"#0D9488",
            opacity: i===1 ? 1 : 0.3,
            animation:`shimmer 1.5s infinite linear`,
            animationDelay:`${i*300}ms`,
          }}/>
        ))}
      </div>
    </div>
  );
}
