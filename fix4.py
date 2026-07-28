content = open('/Users/macbook/cliniverse-ai/app/page.tsx').read()

replacements = [
    # Purple text in PRO card
    ("color:'rgba(191,90,242,0.9)'", "color:'rgba(0,196,180,0.9)'"),
    ('"color:rgba(191,90,242,0.9)"', '"color:rgba(0,196,180,0.9)"'),
    # Yearly card glass
    ("background:'rgba(255,255,255,0.15)'", "background:'rgba(36,63,82,0.60)'"),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f'✅ {old[:60]}')

open('/Users/macbook/cliniverse-ai/app/page.tsx', 'w').write(content)
print(f'\n🎨 {count} fixes applied!')
