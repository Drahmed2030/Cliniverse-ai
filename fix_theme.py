content = open('/Users/macbook/cliniverse-ai/app/page.tsx').read()

replacements = [
    # Backgrounds
    ('#1a0533', '#1e3d52'),
    ('#0d0118', '#162e3e'),
    ('#12303f', '#243f52'),
    ('#1a0a2e', '#1e3d52'),
    ('#0f0a1e', '#162e3e'),
    ('#13002a', '#1e3d52'),
    ('#160028', '#162e3e'),
    ('#1c0040', '#243f52'),
    ('#0a0015', '#162e3e'),
    # Purple → Teal
    ('#8b5cf6', '#00C4B4'),
    ('#7c3aed', '#00B4A6'),
    ('#6d28d9', '#009e90'),
    ('#a78bfa', '#00DFD0'),
    ('#9f7aea', '#00CFC0'),
    ('#c4b5fd', '#6ee7e1'),
    # Purple rgba → Teal rgba
    ('rgba(139,92,246,', 'rgba(0,196,180,'),
    ('rgba(139, 92, 246,', 'rgba(0, 196, 180,'),
    ('rgba(124,58,237,', 'rgba(0,180,166,'),
    ('rgba(109,40,217,', 'rgba(0,158,144,'),
    # Card glass
    ('rgba(255,255,255,0.04)', 'rgba(36,63,82,0.45)'),
    ('rgba(255,255,255,0.05)', 'rgba(36,63,82,0.50)'),
    ('rgba(255,255,255,0.06)', 'rgba(36,63,82,0.55)'),
    ('rgba(255,255,255,0.03)', 'rgba(36,63,82,0.40)'),
    # Gold stays gold — no change needed
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f'✅ {old} → {new}')

open('/Users/macbook/cliniverse-ai/app/page.tsx', 'w').write(content)
print(f'\n🎨 Done! {count} replacements made.')
