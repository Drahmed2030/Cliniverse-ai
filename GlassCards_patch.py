from pathlib import Path

f = Path("app/components/HubPage.tsx")
src = f.read_text()

# ── NEW GLASSMORPHIC CASE CARD ──
OLD_CARD = """flex:2,background:D.bg2,border:`1.5px solid rgba(255,69,58,.22)`,
              borderRadius:22,padding:'16px',cursor:'pointer',
              position:'relative',overflow:'hidden',minHeight:130,
              transition:'transform 0.15s',
            }}>
              <div style={{position:'absolute',top:-25,right:-25,width:90,height:90,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,.14),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:10,right:12,fontSize:9,fontWeight:800,color:'rgba(255,69,58,.30)',letterSpacing:1.2}}>TODAY</div>

              <div style={{width:40,height:40,borderRadius:13,background:'rgba(255,69,58,.14)',border:'1.5px solid rgba(255,69,58,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:10}}>🏥</div>
              <div style={{fontSize:10,color:D.red,fontWeight:700,letterSpacing:1.2,marginBottom:4}}>CASE OF THE DAY</div>
              <div style={{fontSize:14,fontWeight:800,color:D.t1,lineHeight:1.3,marginBottom:6}}>
                {dailyCase?.title||'AI Clinical Case'}
              </div>
              <div style={{fontSize:11,color:D.t2}}>{dailyCase?.specialty||'Emergency Medicine'}</div>
              <div style={{display:'flex',alignItems:'center',gap:5,marginTop:10}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:D.red,animation:'liveBlink 1.4s ease-in-out infinite'}}/>
                <span style={{fontSize:9,color:D.red,fontWeight:700,letterSpacing:0.5}}>LIVE INTERACTIVE</span>
              </div>
            </div>"""

NEW_CARD = """flex:2,
              background:'rgba(255,255,255,0.05)',
              backdropFilter:'blur(40px) saturate(180%)',
              WebkitBackdropFilter:'blur(40px) saturate(180%)',
              border:'1px solid rgba(255,69,58,0.20)',
              borderRadius:28,padding:'18px',cursor:'pointer',
              position:'relative',overflow:'hidden',minHeight:140,
              transition:'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s',
              boxShadow:'0 8px 32px rgba(255,69,58,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}>
              {/* Ambient glow */}
              <div style={{position:'absolute',top:-30,right:-30,width:110,height:110,borderRadius:'50%',
                background:'radial-gradient(circle,rgba(255,69,58,0.18),transparent 70%)',pointerEvents:'none'}}/>
              {/* Inner shimmer */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
                pointerEvents:'none'}}/>
              {/* TODAY badge */}
              <div style={{
                position:'absolute',top:12,right:12,
                background:'rgba(255,69,58,0.12)',
                border:'1px solid rgba(255,69,58,0.25)',
                borderRadius:8,padding:'3px 8px',
                fontSize:8,fontWeight:900,color:'#FF453A',letterSpacing:1.5,
              }}>TODAY</div>

              {/* Icon */}
              <div style={{
                width:44,height:44,borderRadius:15,
                background:'rgba(255,69,58,0.12)',
                border:'1px solid rgba(255,69,58,0.22)',
                backdropFilter:'blur(10px)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:22,marginBottom:12,
                boxShadow:'0 4px 12px rgba(255,69,58,0.15)',
              }}>🏥</div>

              <div style={{fontSize:9,color:'#FF453A',fontWeight:800,letterSpacing:1.8,marginBottom:5}}>
                CASE OF THE DAY
              </div>
              <div style={{fontSize:15,fontWeight:900,color:'var(--text-primary,#F2F8FC)',lineHeight:1.3,marginBottom:6,letterSpacing:-0.3}}>
                {dailyCase?.title||'AI Clinical Case'}
              </div>
              <div style={{fontSize:11,color:'var(--text-secondary,rgba(242,248,252,0.60))',marginBottom:10}}>
                {dailyCase?.specialty||'Emergency Medicine'}
              </div>

              {/* Live indicator + XP */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#FF453A',
                    boxShadow:'0 0 8px rgba(255,69,58,0.8)',animation:'liveBlink 1.4s ease-in-out infinite'}}/>
                  <span style={{fontSize:9,color:'#FF453A',fontWeight:800,letterSpacing:0.8}}>LIVE INTERACTIVE</span>
                </div>
                <div style={{
                  background:'rgba(255,69,58,0.10)',
                  border:'1px solid rgba(255,69,58,0.20)',
                  borderRadius:8,padding:'2px 8px',
                  fontSize:9,fontWeight:800,color:'#FF453A',
                }}>+30 XP</div>
              </div>
            </div>"""

# ── NEW ACADEMY CARD ──
OLD_ACADEMY = """flex:1,background:D.bg2,border:`1.5px solid rgba(191,90,242,.22)`,
                borderRadius:18,padding:'13px 11px',cursor:'pointer',
                display:'flex',flexDirection:'column',gap:4,
                transition:'transform 0.15s',
              }}>
                <div style={{fontSize:22}}>🎙️</div>
                <div style={{fontSize:12,fontWeight:800,color:D.t1}}>Academy</div>
                <div style={{fontSize:10,color:D.t3}}>AI Lectures</div>
              </div>"""

NEW_ACADEMY = """flex:1,
                background:'rgba(191,90,242,0.08)',
                backdropFilter:'blur(30px) saturate(160%)',
                WebkitBackdropFilter:'blur(30px) saturate(160%)',
                border:'1px solid rgba(191,90,242,0.20)',
                borderRadius:22,padding:'14px 12px',cursor:'pointer',
                display:'flex',flexDirection:'column',gap:5,
                transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow:'0 4px 20px rgba(191,90,242,0.08), inset 0 1px 0 rgba(255,255,255,0.10)',
                position:'relative',overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{
                  width:36,height:36,borderRadius:12,
                  background:'rgba(191,90,242,0.15)',
                  border:'1px solid rgba(191,90,242,0.25)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                }}>🎙️</div>
                <div style={{fontSize:12,fontWeight:800,color:'var(--text-primary,#F2F8FC)'}}>Academy</div>
                <div style={{fontSize:9,color:'var(--text-muted,rgba(242,248,252,0.45))'}}>AI Lectures</div>
              </div>"""

# ── NEW XP CARD ──
OLD_XP = """flex:1,background:D.bg2,border:`1.5px solid rgba(255,214,10,.18)`,
                borderRadius:18,padding:'13px 11px',
                display:'flex',flexDirection:'column',gap:2,
              }}>
                <div style={{fontSize:16,fontWeight:900,color:D.gold}}>{xp}</div>
                <div style={{fontSize:10,fontWeight:700,color:D.t3}}>XP Points</div>
                <div style={{fontSize:9,color:D.orange}}>🔥 {streak}d</div>
              </div>"""

NEW_XP = """flex:1,
                background:'rgba(255,214,10,0.06)',
                backdropFilter:'blur(30px) saturate(160%)',
                WebkitBackdropFilter:'blur(30px) saturate(160%)',
                border:'1px solid rgba(255,214,10,0.18)',
                borderRadius:22,padding:'14px 12px',
                display:'flex',flexDirection:'column',gap:3,
                boxShadow:'0 4px 20px rgba(255,214,10,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
                position:'relative',overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{fontSize:18,fontWeight:900,color:'#FFD60A',letterSpacing:-0.5}}>{xp}</div>
                <div style={{fontSize:10,fontWeight:700,color:'var(--text-secondary,rgba(242,248,252,0.55))'}}>XP Points</div>
                <div style={{fontSize:9,color:'#FF9F0A',fontWeight:700}}>🔥 {streak}d streak</div>
              </div>"""

# ── NEW MINI STATS CARDS ──
OLD_MINI = """flex:1,background:D.bg2,border:`1.5px solid ${c.color}18`,
                borderRadius:18,padding:'12px 8px',
                display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:3,
                cursor:'pointer',
              }}>
                <span style={{fontSize:20}}>{c.icon}</span>
                <span style={{fontSize:15,fontWeight:900,color:c.color}}>{c.value}</span>
                <span style={{fontSize:9,color:D.t4,fontWeight:600}}>{c.label}</span>
              </div>"""

NEW_MINI = """flex:1,
                background:'var(--bg-card,rgba(255,255,255,0.04))',
                backdropFilter:'blur(24px) saturate(160%)',
                WebkitBackdropFilter:'blur(24px) saturate(160%)',
                border:`1px solid ${c.color}20`,
                borderRadius:22,padding:'13px 8px',
                display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:4,
                cursor:'pointer',
                boxShadow:`0 4px 16px ${c.color}08, inset 0 1px 0 rgba(255,255,255,0.08)`,
                position:'relative',overflow:'hidden',
                transition:'transform 0.15s',
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                  background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)',
                  pointerEvents:'none'}}/>
                <div style={{
                  width:36,height:36,borderRadius:11,
                  background:`${c.color}12`,
                  border:`1px solid ${c.color}20`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:18,
                }}>{c.icon}</div>
                <span style={{fontSize:16,fontWeight:900,color:c.color,letterSpacing:-0.3}}>{c.value}</span>
                <span style={{fontSize:8,color:'var(--text-muted,rgba(242,248,252,0.40))',fontWeight:700,letterSpacing:0.5}}>{c.label}</span>
              </div>"""

count = 0
for old, new in [(OLD_CARD, NEW_CARD), (OLD_ACADEMY, NEW_ACADEMY), (OLD_XP, NEW_XP), (OLD_MINI, NEW_MINI)]:
    if old in src:
        src = src.replace(old, new, 1)
        count += 1
        print(f"✅ Card {count} updated")
    else:
        print(f"❌ Card {count+1} pattern not found")

f.write_text(src)
print(f"\n🎉 {count} cards upgraded to Liquid Glass!")
