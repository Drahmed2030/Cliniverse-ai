import os

# 1. Add Live Heartbeat to HUB
path = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(path, 'r') as f:
    c = f.read()

heartbeat = """
            {/* Live Heartbeat Counter */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:16,padding:'10px 20px',background:'rgba(255,69,58,0.06)',borderRadius:20,border:'1px solid rgba(255,69,58,0.15)'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:'pulse 1s ease-in-out infinite',flexShrink:0}}/>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontWeight:600}} id="liveCount">1,247 doctors training right now</span>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 12px #ff453a',animation:'pulse 1s ease-in-out infinite 0.5s',flexShrink:0}}/>
            </div>
            <script dangerouslySetInnerHTML={{__html:`
              (function(){
                var base = 1100 + Math.floor(Math.random()*300);
                var el = document.getElementById('liveCount');
                if(!el) return;
                setInterval(function(){
                  base += Math.floor(Math.random()*5) - 2;
                  if(base < 900) base = 900;
                  if(base > 1500) base = 1500;
                  el.textContent = base.toLocaleString() + ' doctors training right now';
                }, 2000);
              })();
            `}}/>
"""

old = "            {/* Clinical Pulse */}"
if old in c:
    c = c.replace(old, heartbeat + old)
    print("Heartbeat: added before Clinical Pulse")
else:
    old2 = "            {/* Featured Case */}"
    c = c.replace(old2, heartbeat + old2, 1)
    print("Heartbeat: added before Featured Case")

with open(path, 'w') as f:
    f.write(c)
print("Done!")
