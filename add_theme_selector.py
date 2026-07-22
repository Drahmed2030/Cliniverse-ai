import os

path = os.path.expanduser('~/cliniverse-ai/app/components/OnboardingFunnel.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change TOTAL from 6 to 7
content = content.replace('const TOTAL = 6', 'const TOTAL = 7')

# 2. Add theme screen before the closing of screens array
# Find the last screen and add theme screen after it
theme_screen = """
    // 6 — THEME SELECTOR
    <div key="s6" style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px'}}>
      <div style={{textAlign:'center',marginBottom:32,animation:'rise 0.5s ease both'}}>
        <div style={{fontSize:48,marginBottom:12}}>🎨</div>
        <h2 style={{fontSize:28,fontWeight:900,color:'white',margin:'0 0 8px',letterSpacing:-0.5}}>Choose Your Style</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.5)',margin:0,lineHeight:1.6}}>Pick the look that works best for you.<br/>You can change this anytime in Settings.</p>
      </div>

      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:14,marginBottom:32}}>

        {/* Clinical White */}
        <div onClick={()=>{localStorage.setItem('cliniverse-theme','light');onComplete()}}
          style={{background:'white',borderRadius:22,padding:'18px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer',border:'2px solid rgba(255,255,255,0.9)',boxShadow:'0 8px 32px rgba(255,255,255,0.2)',transition:'transform 0.2s'}}
          onMouseDown={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#007AFF,#34C759)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>☀️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:'#1C1C1E',marginBottom:3}}>Clinical White</div>
            <div style={{fontSize:13,color:'#8E8E93'}}>Clean · Professional · iOS style</div>
            <div style={{fontSize:11,color:'#007AFF',fontWeight:600,marginTop:4}}>Recommended for most doctors</div>
          </div>
          <div style={{fontSize:22}}>›</div>
        </div>

        {/* Dark Cosmic */}
        <div onClick={()=>{localStorage.setItem('cliniverse-theme','dark');onComplete()}}
          style={{background:'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(10,132,255,0.15))',borderRadius:22,padding:'18px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer',border:'1.5px solid rgba(139,92,246,0.4)',boxShadow:'0 8px 32px rgba(139,92,246,0.2)',transition:'transform 0.2s'}}
          onMouseDown={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>🌌</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:'white',marginBottom:3}}>Dark Cosmic</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}>Premium · Modern · Immersive</div>
            <div style={{fontSize:11,color:'#8b5cf6',fontWeight:600,marginTop:4}}>Popular with night shift doctors</div>
          </div>
          <div style={{fontSize:22,color:'rgba(255,255,255,0.5)'}}>›</div>
        </div>

        {/* Midnight Blue */}
        <div onClick={()=>{localStorage.setItem('cliniverse-theme','midnight');onComplete()}}
          style={{background:'linear-gradient(135deg,rgba(10,132,255,0.15),rgba(48,209,88,0.1))',borderRadius:22,padding:'18px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer',border:'1.5px solid rgba(10,132,255,0.3)',boxShadow:'0 8px 32px rgba(10,132,255,0.15)',transition:'transform 0.2s'}}
          onMouseDown={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#0a84ff,#30d158)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>💙</div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:'white',marginBottom:3}}>Midnight Blue</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}>Medical · Clear · Easy on eyes</div>
            <div style={{fontSize:11,color:'#0a84ff',fontWeight:600,marginTop:4}}>Perfect for on-call duty</div>
          </div>
          <div style={{fontSize:22,color:'rgba(255,255,255,0.5)'}}>›</div>
        </div>

      </div>

      <p style={{fontSize:12,color:'rgba(255,255,255,0.25)',textAlign:'center'}}>Tap any theme to enter Cliniverse AI</p>
    </div>,"""

# Find where to insert — before the closing bracket of screens array
# Look for the last screen ending
old_str = "const CTA_STYLE"
new_str = theme_screen + "\n  ]\n\nconst CTA_STYLE"

# Remove existing array closing and add our screen
content = content.replace(
    "  ]\n\nconst CTA_STYLE",
    theme_screen + "\n  ]\n\nconst CTA_STYLE"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Theme selector screen added!')
print('Now add theme reading in page.tsx...')

# 2. Add theme reading in page.tsx
page_path = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(page_path, 'r', encoding='utf-8') as f:
    page = f.read()

# Add theme state after existing useState declarations
old_state = "  const [dark] = useState(true)"
new_state = """  const [dark, setDark] = useState(true)"""
page = page.replace(old_state, new_state)

# Add theme loading effect
old_effect = "  useEffect(() => {\n    const seen = localStorage.getItem('cliniverse-onboarded')"
new_effect = """  useEffect(() => {
    const theme = localStorage.getItem('cliniverse-theme')
    if (theme === 'light') setDark(false)
    else if (theme === 'midnight') setDark(false) // use light base for midnight
    else setDark(true) // default dark
  }, [])

  useEffect(() => {
    const seen = localStorage.getItem('cliniverse-onboarded')"""
page = page.replace(old_effect, new_effect)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page)

print('✅ Theme reading added to page.tsx!')
print('\n🚀 Run: git add . && git commit -m "add theme selector" && git push')
