content = open('/Users/macbook/cliniverse-ai/app/page.tsx').read()

replacements = [
    # Featured case / upgrade modal backgrounds
    ("'linear-gradient(145deg,#2d0a6e,#0d0030)'", "'linear-gradient(145deg,#0d3347,#162e3e)'"),
    ('"linear-gradient(145deg,#2d0a6e,#0d0030)"', '"linear-gradient(145deg,#0d3347,#162e3e)"'),
    # ME profile dark backgrounds
    ("'#0d0030'", "'#162e3e'"),
    ('"#0d0030"', '"#162e3e"'),
    ("'#2d0a6e'", "'#1e3d52'"),
    ('"#2d0a6e"', '"#1e3d52"'),
    # Stats cards mini backgrounds
    ("background:'rgba(10,132,255,0.1)'", "background:'rgba(0,196,180,0.1)'"),
    ("background:'rgba(10,132,255,0.12)'", "background:'rgba(0,196,180,0.12)'"),
    ("border:'1px solid rgba(10,132,255,0.2)'", "border:'1px solid rgba(0,196,180,0.25)'"),
    ("color:'#0a84ff'", "color:'#00C4B4'"),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f'✅ {old[:60]}')

open('/Users/macbook/cliniverse-ai/app/page.tsx', 'w').write(content)
print(f'\n🎨 {count} fixes applied!')
