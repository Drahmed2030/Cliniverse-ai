"use client";

export default function MedicalStores({ onBack }: { onBack: () => void }) {
  const STORES = [
    {name:"Medical Equipment",emoji:"🏥",color:"#00C7BE",items:["Blood Pressure Monitors","Glucometers","Pulse Oximeters","Nebulizers","Wheelchairs","Hospital Beds"]},
    {name:"Pharmacy Supplies",emoji:"💊",color:"#30D158",items:["OTC Medications","Vitamins","First Aid Kits","Wound Care","Diagnostic Tests","Baby Health"]},
    {name:"Optical Supplies",emoji:"👁️",color:"#64D2FF",items:["Prescription Glasses","Contact Lenses","Eye Drops","Reading Glasses","Safety Goggles","Lens Solutions"]},
    {name:"Dental Supplies",emoji:"🦷",color:"#BF5AF2",items:["Toothbrushes","Dental Floss","Mouthwash","Whitening Kits","Orthodontic Care","Pain Relief"]},
    {name:"Rehabilitation",emoji:"🏃",color:"#FF6B35",items:["Exercise Equipment","Support Braces","TENS Machines","Massage Devices","Walking Aids","Compression Stockings"]},
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8fff8 0%,#f0fff8 60%,#e8f4ff 100%)",fontFamily:"-apple-system,sans-serif",paddingBottom:100}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
        <button onClick={onBack} style={{background:"rgba(0,199,190,0.12)",border:"none",borderRadius:10,padding:"8px 14px",color:"#00C7BE",fontSize:15,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <div style={{color:"#1c1c1e",fontSize:18,fontWeight:700}}>🏪 Medical Stores</div>
      </div>
      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
        {STORES.map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.9)",borderRadius:18,padding:18}}>
            <div style={{color:"#1c1c1e",fontSize:16,fontWeight:700,marginBottom:12}}>{s.emoji} {s.name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {s.items.map((item,j)=>(
                <span key={j} style={{background:`rgba(0,199,190,0.1)`,border:"1px solid rgba(0,199,190,0.2)",borderRadius:20,padding:"5px 12px",color:s.color,fontSize:13,fontWeight:600}}>{item}</span>
              ))}
            </div>
          </div>
        ))}
        <div style={{background:"rgba(255,159,10,0.08)",border:"1px solid rgba(255,159,10,0.2)",borderRadius:12,padding:"10px 14px",display:"flex",gap:8}}>
          <span>⚕️</span>
          <span style={{color:"rgba(60,60,67,0.6)",fontSize:12}}>For informational purposes only. Consult healthcare professionals before purchasing medical equipment.</span>
        </div>
      </div>
    </div>
  );
}
