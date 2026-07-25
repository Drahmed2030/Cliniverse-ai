        {/* HUB */}
        {tab==='hub'&&(
          <div style={{paddingBottom:100}}>
            <div style={{padding:'16px 16px 0',marginBottom:16}}>
              <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.97),rgba(25,8,55,0.95))',borderRadius:24,padding:20,border:'1px solid rgba(139,92,246,0.2)'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:2,marginBottom:12,fontWeight:700}}>DAILY PROGRESS</div>
                <div style={{display:'flex',alignItems:'center',gap:20}}>
                  <div style={{position:'relative',width:110,height:110,flexShrink:0}}>
                    <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:'rotate(-90deg)'}}>
                      <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(10,132,255,0.15)" strokeWidth="8"/>
                      <circle cx="55" cy="55" r="48" fill="none" stroke="#0a84ff" strokeWidth="8" strokeLinecap="round" strokeDasharray="150 302" style={{filter:'drop-shadow(0 0 6px #0a84ff)'}}/>
                      <circle cx="55" cy="55" r="37" fill="none" stroke="rgba(48,209,88,0.15)" strokeWidth="8"/>
                      <circle cx="55" cy="55" r="37" fill="none" stroke="#30d158" strokeWidth="8" strokeLinecap="round" strokeDasharray="100 233" style={{filter:'drop-shadow(0 0 6px #30d158)'}}/>
                      <circle cx="55" cy="55" r="26" fill="none" stroke="rgba(255,69,58,0.15)" strokeWidth="8"/>
                      <circle cx="55" cy="55" r="26" fill="none" stroke="#ff453a" strokeWidth="8" strokeLinecap="round" strokeDasharray="80 164" style={{filter:'drop-shadow(0 0 6px #ff453a)'}}/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                      <div style={{fontSize:18,fontWeight:900,color:'white'}}>{xp}</div>
                      <div style={{fontSize:8,color:'rgba(255,255,255,0.4)'}}>XP</div>
                    </div>
                  </div>
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
                    {[{color:'#ff453a',label:'Accuracy',val:50},{color:'#30d158',label:'Speed',val:43},{color:'#0a84ff',label:'Knowledge',val:30}].map((r,i)=>(
                      <div key={i}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                          <span style={{fontSize:11,color:'white',fontWeight:600}}>{r.label}</span>
                          <span style={{fontSize:11,color:r.color,fontWeight:700}}>{r.val}%</span>
                        </div>
                        <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:2,overflow:'hidden'}}>
                          <div style={{height:'100%',width:r.val+'%',background:r.color,borderRadius:2}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{padding:'0 16px',marginBottom:16}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontWeight:700,letterSpacing:1.5,marginBottom:10,textTransform:'uppercase'}}>Quick Access</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[{icon:'📋',label:'SBAR',color:'#0a84ff'},{icon:'⚡',label:'Rapid',color:'#ff453a'},{icon:'📈',label:'ECG',color:'#30d158'},{icon:'🧮',label:'Calc',color:'#ff9f0a'}].map((q,i)=>(
                  <div key={i} onClick={()=>{if(q.label==='SBAR')setTab('workshop');else{setTab('tools');setToolTab(q.label==='Rapid'?'rapid':q.label==='ECG'?'ecg':'calc')}}}
                    style={{background:q.color+'12',border:'1px solid '+q.color+'25',borderRadius:16,padding:'12px 8px',textAlign:'center',cursor:'pointer'}}>
                    <div style={{fontSize:22,marginBottom:4}}>{q.icon}</div>


<div style={{fontSize:11,fontWeight:700,color:'white'}}>{q.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'0 16px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'10px 20px',background:'rgba(255,69,58,0.06)',borderRadius:20,border:'1px solid rgba(255,69,58,0.15)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:'pulse 1s ease-in-out infinite',flexShrink:0}}/>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontWeight:600}} id="liveCount">1,247 doctors training right now</span>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:'pulse 1s ease-in-out infinite',flexShrink:0}}/>
              </div>
            </div>
            <div style={{padding:'0 16px',marginBottom:16}}>
              <div onClick={()=>setActiveCase('stemi')} style={{background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',borderRadius:22,padding:22,color:'white',cursor:'pointer',boxShadow:'0 8px 40px rgba(10,132,255,0.4)',border:'1px solid rgba(255,255,255,0.12)',position:'relative',overflow:'hidden'}}>
                <p style={{fontSize:10,opacity:0.7,margin:'0 0 6px',letterSpacing:2,textTransform:'uppercase'}}>TODAY'S FEATURED CASE</p>
                <h3 style={{fontSize:20,fontWeight:900,margin:'0 0 6px',letterSpacing:-0.5}}>🫀 STEMI Protocol</h3>
                <p style={{fontSize:13,opacity:0.75,margin:'0 0 14px',lineHeight:1.5}}>Master door-to-balloon · +80 XP</p>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.2)',borderRadius:20,padding:'7px 16px',fontSize:13,fontWeight:700}}>Start Case →</div>
              </div>
            </div>
            <div style={{padding:'0 16px'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontWeight:700,letterSpacing:1.5,marginBottom:12,textTransform:'uppercase'}}>Clinical Cases</div>
              {[{key:'critical',icon:'🏥',title:'Critical Care',sub:'ED · ICU · CCU · Neuro',color:'#ff453a',badge:null,badgeColor:'',cases:criticalCases},{key:'sports',icon:'⚽',title:'Sports Medicine',sub:'FIFA 2026 · 4 cases',color:'#30d158',badge:'NEW',badgeColor:'#30d158',cases:sportsCases},{key:'peds',icon:'🧸',title:'Pediatrics',sub:'2 cases · Vaccinations',color:'#8b5cf6',badge:'NEW',badgeColor:'#8b5cf6',cases:pedsCases}].map(section=>(
                <div key={section.key} style={{marginBottom:12}}>
                  <div onClick={()=>setOpenAccordion(openAccordion===section.key?null:section.key)} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,cursor:'pointer',padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid '+section.color+'18'}}>
                    <div style={{width:36,height:36,borderRadius:11,background:section.color+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{section.icon}</div>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:'white'}}>{section.title}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{section.sub}</div></div>
                    {section.badge&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:section.badgeColor+'18',color:section.badgeColor,fontWeight:800}}>{section.badge}</span>}
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:16}}>›</span>
                  </div>
                  {openAccordion===section.key&&(
                    <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:6,scrollbarWidth:'none'}}>
                      {section.cases.map((c:any)=>(
                        <div key={c.id} onClick={()=>{if(!c.free&&!isPro){setShowUpgrade(true);return}setActiveCase(c.id)}} style={{flexShrink:0,width:160,background:'rgba(255,255,255,0.


04)',borderRadius:18,padding:'14px',border:'1px solid '+c.color+'25',cursor:'pointer',opacity:!c.free&&!isPro?0.7:1}}>
                          <div style={{fontSize:28,marginBottom:8}}>{c.icon}</div>
                          <div style={{fontSize:13,fontWeight:700,color:'white',marginBottom:4,lineHeight:1.3}}>{c.title}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:8}}>{c.dept}</div>
                          <div style={{display:'flex',gap:4}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:c.color+'15',color:c.color,fontWeight:700}}>+{c.xpReward} XP</span>{!c.free&&!isPro&&<span style={{fontSize:8,padding:'2px 6px',borderRadius:5,background:'rgba(255,149,0,0.15)',color:'#ff9500',fontWeight:700}}>PRO</span>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}