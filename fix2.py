content = open('/Users/macbook/cliniverse-ai/app/page.tsx').read()

# Fix dark theme card colors
old1 = "cardBg: 'rgba(255,255,255,0.15)',"
new1 = "cardBg: 'rgba(36,63,82,0.55)',"

old2 = "cardBorder: 'rgba(0,196,180,0.25)',"
new2 = "cardBorder: 'rgba(0,196,180,0.30)',"

# Fix featured case black card
old3 = "background:'radial-gradient(135deg at 70% 50%,rgba(139,92,246,0.3),rgba(109,40,217,0.8))'"
new3 = "background:'radial-gradient(135deg at 70% 50%,rgba(0,196,180,0.25),rgba(30,61,82,0.95))'"

old4 = "background:'linear-gradient(135deg,rgba(109,40,217,0.4)"
new4 = "background:'linear-gradient(135deg,rgba(0,196,180,0.15)"

# Fix ambient glow background
old5 = "background:'radial-gradient(circle,rgba(139,92,246,0.18)"
new5 = "background:'radial-gradient(circle,rgba(0,196,180,0.15)"

# Fix body/page background
old6 = "background: dark ? 'linear-gradient(135deg,#0a0015"
new6 = "background: dark ? 'linear-gradient(135deg,#162e3e"

old7 = "'#0a0015'"
new7 = "'#1e3d52'"

old8 = "'#13002a'"
new8 = "'#162e3e'"

old9 = "'#1c0040'"
new9 = "'#243f52'"

old10 = "rgba(139,92,246,0.18)"
new10 = "rgba(0,196,180,0.15)"

old11 = "rgba(109,40,217,0.8)"
new11 = "rgba(30,61,82,0.9)"

old12 = "rgba(109,40,217,0.4)"
new12 = "rgba(0,196,180,0.15)"

replacements = [
    (old1,new1),(old2,new2),(old3,new3),(old4,new4),
    (old5,new5),(old6,new6),(old7,new7),(old8,new8),
    (old9,new9),(old10,new10),(old11,new11),(old12,new12),
]

count = 0
for old,new in replacements:
    if old in content:
        content = content.replace(old,new)
        count += 1
        print(f'✅ Fixed: {old[:50]}')

open('/Users/macbook/cliniverse-ai/app/page.tsx','w').write(content)
print(f'\n🎨 {count} fixes applied!')
