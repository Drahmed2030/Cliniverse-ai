import os, re

# كل الألوان القديمة → الجديدة
REPLACEMENTS = [
    # Backgrounds
    ("'#0a0015'",           "'#1e3d52'"),
    ('"#0a0015"',           '"#1e3d52"'),
    ("'#0d0118'",           "'#162e3e'"),
    ('"#0d0118"',           '"#162e3e"'),
    ("'#1a0533'",           "'#1e3d52'"),
    ('"#1a0533"',           '"#1e3d52"'),
    ("'#13002a'",           "'#162e3e'"),
    ('"#13002a"',           '"#162e3e"'),
    ("'#0f0a1e'",           "'#1e3d52'"),
    ('"#0f0a1e"',           '"#1e3d52"'),
    ("'#160028'",           "'#162e3e'"),
    ('"#160028"',           '"#162e3e"'),
    ("'#1c0040'",           "'#243f52'"),
    ('"#1c0040"',           '"#243f52"'),
    ("'#0d0030'",           "'#162e3e'"),
    ('"#0d0030"',           '"#162e3e"'),
    ("'#2d0a6e'",           "'#1e3d52'"),
    ('"#2d0a6e"',           '"#1e3d52"'),

    # Purple → Teal
    ("'#8b5cf6'",           "'#00C4B4'"),
    ('"#8b5cf6"',           '"#00C4B4"'),
    ("'#7c3aed'",           "'#00B4A6'"),
    ('"#7c3aed"',           '"#00B4A6"'),
    ("'#6d28d9'",           "'#009e90'"),
    ('"#6d28d9"',           '"#009e90"'),
    ("'#a78bfa'",           "'#00DFD0'"),
    ('"#a78bfa"',           '"#00DFD0"'),
    ("'#c4b5fd'",           "'#6ee7e1'"),
    ('"#c4b5fd"',           '"#6ee7e1"'),
    ("'#9f7aea'",           "'#00CFC0'"),
    ('"#9f7aea"',           '"#00CFC0"'),

    # Purple rgba → Teal rgba
    ("rgba(139,92,246,0.05)",  "rgba(0,196,180,0.05)"),
    ("rgba(139,92,246,0.08)",  "rgba(0,196,180,0.08)"),
    ("rgba(139,92,246,0.10)",  "rgba(0,196,180,0.10)"),
    ("rgba(139,92,246,0.12)",  "rgba(0,196,180,0.12)"),
    ("rgba(139,92,246,0.15)",  "rgba(0,196,180,0.15)"),
    ("rgba(139,92,246,0.18)",  "rgba(0,196,180,0.18)"),
    ("rgba(139,92,246,0.20)",  "rgba(0,196,180,0.20)"),
    ("rgba(139,92,246,0.25)",  "rgba(0,196,180,0.25)"),
    ("rgba(139,92,246,0.30)",  "rgba(0,196,180,0.30)"),
    ("rgba(139,92,246,0.35)",  "rgba(0,196,180,0.35)"),
    ("rgba(139,92,246,0.40)",  "rgba(0,196,180,0.40)"),
    ("rgba(139, 92, 246,",     "rgba(0, 196, 180,"),
    ("rgba(124,58,237,",       "rgba(0,180,166,"),
    ("rgba(109,40,217,",       "rgba(0,158,144,"),
    ("rgba(167,139,250,",      "rgba(0,223,208,"),
    ("rgba(191,90,242,",       "rgba(0,196,180,"),

    # Old glass cards → Teal glass
    ("rgba(255,255,255,0.03)", "rgba(36,63,82,0.40)"),
    ("rgba(255,255,255,0.04)", "rgba(36,63,82,0.45)"),
    ("rgba(255,255,255,0.05)", "rgba(36,63,82,0.50)"),
    ("rgba(255,255,255,0.06)", "rgba(36,63,82,0.55)"),
    ("rgba(255,255,255,0.07)", "rgba(36,63,82,0.55)"),
    ("rgba(255,255,255,0.08)", "rgba(36,63,82,0.55)"),
    ("rgba(255,255,255,0.10)", "rgba(36,63,82,0.60)"),
    ("rgba(255,255,255,0.11)", "rgba(36,63,82,0.60)"),
    ("rgba(255,255,255,0.12)", "rgba(36,63,82,0.65)"),
    ("rgba(255,255,255,0.15)", "rgba(36,63,82,0.65)"),

    # Blue iOS → Teal
    ("'#0a84ff'",           "'#00C4B4'"),
    ('"#0a84ff"',           '"#00C4B4"'),
    ("rgba(10,132,255,0.1)","rgba(0,196,180,0.10)"),
    ("rgba(10,132,255,0.12)","rgba(0,196,180,0.12)"),
    ("rgba(10,132,255,0.15)","rgba(0,196,180,0.15)"),
    ("rgba(10,132,255,0.2)","rgba(0,196,180,0.20)"),
    ("rgba(10,132,255,0.25)","rgba(0,196,180,0.25)"),
    ("rgba(10,132,255,0.3)","rgba(0,196,180,0.30)"),

    # Borders white → teal
    ("rgba(255,255,255,0.1)'", "rgba(0,196,180,0.20)'"),
    ("rgba(255,255,255,0.15)'","rgba(0,196,180,0.25)'"),
    ("rgba(255,255,255,0.2)'", "rgba(0,196,180,0.25)'"),

    # Gradient purples
    ("linear-gradient(135deg,rgba(139,92,246,", "linear-gradient(135deg,rgba(0,196,180,"),
    ("linear-gradient(135deg,#8b5cf6,",         "linear-gradient(135deg,#00C4B4,"),
    ("linear-gradient(135deg,#6d28d9,",         "linear-gradient(135deg,#009e90,"),
    ("linear-gradient(145deg,#2d0a6e,#0d0030)", "linear-gradient(145deg,#0d3347,#162e3e)"),
    ("linear-gradient(135deg,#0a0015,",         "linear-gradient(135deg,#162e3e,"),
]

# Process all tsx/ts files
root = '/Users/macbook/cliniverse-ai/app'
total_files = 0


total_changes = 0

for dirpath, _, files in os.walk(root):
    for fname in files:
        if fname.endswith(('.tsx', '.ts', '.css')):
            fpath = os.path.join(dirpath, fname)
            try:
                original = open(fpath, 'r', encoding='utf-8').read()
                modified = original
                file_changes = 0
                for old, new in REPLACEMENTS:
                    if old in modified:
                        count = modified.count(old)
                        modified = modified.replace(old, new)
                        file_changes += count
                if modified != original:
                    open(fpath, 'w', encoding='utf-8').write(modified)
                    print(f"✅ {fname}: {file_changes} changes")
                    total_files += 1
                    total_changes += file_changes
            except Exception as e:
                print(f"❌ {fname}: {e}")

print(f"\n🎨 Done! {total_files} files, {total_changes} total changes")
