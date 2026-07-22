import os

# Read current file
target = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(target, 'r') as f:
    code = f.read()

# Add images to onboarding slides
old = """      { icon:'🏥', bg:'#007AFF', title:'Welcome to Cliniverse AI', sub:'The clinical companion built by a physician, for physicians worldwide.' },
      { icon:'⚡', bg:'#FF3B30', title:'Daily Case Challenge', sub:'One new case every 24 hours. Compete with doctors globally.' },
      { icon:'📋', bg:'#34C759', title:'Quick Reference at Your Fingertips', sub:'Sepsis criteria, STEMI protocols, AKI staging — in seconds.' },
      { icon:'🏆', bg:'#FF9500', title:'Climb the Global Ranks', sub:'Earn XP, unlock badges, and reach Chief of Medicine.' },"""

new = """      { icon:'🏥', bg:'#007AFF', title:'Welcome to Cliniverse AI', sub:'The clinical companion built by a physician, for physicians worldwide.', img:'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80' },
      { icon:'⚡', bg:'#FF3B30', title:'Daily Case Challenge', sub:'One new case every 24 hours. Compete with doctors globally.', img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
      { icon:'📋', bg:'#34C759', title:'Quick Reference at Your Fingertips', sub:'Sepsis criteria, STEMI protocols, AKI staging — in seconds.', img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80' },
      { icon:'🏆', bg:'#FF9500', title:'Climb the Global Ranks', sub:'Earn XP, unlock badges, and reach Chief of Medicine.', img:'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80' },"""

code = code.replace(old, new, 1)

# Update onboarding display to show image
old2 = """          <div style={{width:130,height:130,borderRadius:34,background:sl.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:58,marginBottom:36,boxShadow:`0 12px 40px ${sl.bg}50`}}>{sl.icon}</div>"""

new2 = """          <div style={{width:'100%',height:220,borderRadius:24,overflow:'hidden',marginBottom:28,position:'relative',boxShadow:`0 12px 40px ${sl.bg}40`}}>
            <img src={sl.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
            <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom, transparent 40%, ${sl.bg}dd)`}}/>
            <div style={{position:'absolute',bottom:16,left:16,fontSize:44}}>{sl.icon}</div>
          </div>"""

code = code.replace(old2, new2, 1)

with open(target, 'w') as f:
    f.write(code)

print(f'Done! {len(code)} chars written')
