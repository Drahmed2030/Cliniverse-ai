#!/usr/bin/env python3
"""
fix_globals_css.py
════════════════════════════════════════════════════════════════════════
Cliniverse AI — Ensure globals.css has correct Pure Hospital CSS vars
AND that all fallback values in component files match the light theme.

Run BEFORE fix_tools_themes.py so variables exist when components load.

Usage:
  cd /Users/macbook/cliniverse-ai
  python3 fix_globals_css.py
════════════════════════════════════════════════════════════════════════
"""

from pathlib import Path
import re

PROJECT    = Path('/Users/macbook/cliniverse-ai')
GLOBALS    = PROJECT / 'app' / 'globals.css'
BACKUP     = PROJECT / '_theme_backups' / 'globals.css.bak'

# ── The complete CSS Variables block we need ─────────────────────────────
# This adds/replaces the [data-theme] sections in globals.css

HOSPITAL_VARS = """
/* ══════════════════════════════════════════════════
   Pure Hospital Theme — Light clinical white
   Applied when data-theme="hospital" on <html>
══════════════════════════════════════════════════ */
[data-theme='hospital'],
[data-theme='hospital'] * {
  --bg-base:           #F7F9FC;
  --bg-card:           rgba(255, 255, 255, 0.88);
  --bg-elevated:       #FFFFFF;
  --bg-overlay:        rgba(247, 249, 252, 0.95);

  --border-card:       rgba(0, 100, 180, 0.10);
  --border-subtle:     rgba(0, 100, 180, 0.06);

  --text-primary:      #0A1628;
  --text-secondary:    rgba(10, 22, 40, 0.65);
  --text-muted:        rgba(10, 22, 40, 0.38);
  --text-inverse:      #F7F9FC;

  --accent:            #0064B4;
  --accent-soft:       rgba(0, 100, 180, 0.10);
  --accent-glow:       rgba(0, 100, 180, 0.15);

  --red:               #D93025;
  --green:             #1A7F37;
  --amber:             #B45309;
  --purple:            #6B21A8;

  --shadow-card:       0 2px 16px rgba(0, 100, 180, 0.08);
  --shadow-elevated:   0 8px 32px rgba(0, 100, 180, 0.12);
}

/* ══════════════════════════════════════════════════
   Dark Cyber Theme (default) — cosmic navy
   Applied when data-theme="cyber" or no data-theme
══════════════════════════════════════════════════ */
:root,
[data-theme='cyber'] {
  --bg-base:           #0A1628;
  --bg-card:           rgba(255, 255, 255, 0.04);
  --bg-elevated:       rgba(255, 255, 255, 0.07);
  --bg-overlay:        rgba(10, 22, 40, 0.95);

  --border-card:       rgba(255, 255, 255, 0.09);
  --border-subtle:     rgba(255, 255, 255, 0.05);

  --text-primary:      #F2F8FC;
  --text-secondary:    rgba(242, 248, 252, 0.55);
  --text-muted:        rgba(242, 248, 252, 0.38);
  --text-inverse:      #0A1628;

  --accent:            #00C8B8;
  --accent-soft:       rgba(0, 200, 184, 0.10);
  --accent-glow:       rgba(0, 200, 184, 0.15);

  --red:               #FF453A;
  --green:             #30D158;
  --amber:             #FF9F0A;
  --purple:            #BF5AF2;

  --shadow-card:       0 2px 16px rgba(0, 0, 0, 0.30);
  --shadow-elevated:   0 8px 32px rgba(0, 0, 0, 0.40);
}

/* ══════════════════════════════════════════════════
   Midnight Blue Theme
══════════════════════════════════════════════════ */
[data-theme='midnight'] {
  --bg-base:           #05101F;
  --bg-card:           rgba(255, 255, 255, 0.04);
  --bg-elevated:       rgba(255, 255, 255, 0.06);
  --bg-overlay:        rgba(5, 16, 31, 0.96);

  --border-card:       rgba(100, 160, 255, 0.10);
  --border-subtle:     rgba(100, 160, 255, 0.06);

  --text-primary:      #E8F0FE;
  --text-secondary:    rgba(232, 240, 254, 0.55);
  --text-muted:        rgba(232, 240, 254, 0.38);
  --text-inverse:      #05101F;

  --accent:            #4A90E2;
  --accent-soft:       rgba(74, 144, 226, 0.12);
  --accent-glow:       rgba(74, 144, 226, 0.18);

  --red:               #FF6B6B;
  --green:             #51CF66;
  --amber:             #FFD43B;
  --purple:            #CC5DE8;

  --shadow-card:       0 2px 16px rgba(0, 0, 0, 0.40);
  --shadow-elevated:   0 8px 32px rgba(0, 0, 0, 0.55);
}
"""

# ── Body / root reset needed for Pure Hospital ────────────────────────────
BODY_RESET = """
/* Theme-aware body */
body {
  background: var(--bg-base, #0A1628);
  color: var(--text-primary, #F2F8FC);
  transition: background 0.3s ease, color 0.3s ease;
}
"""

def patch_globals():
    print("\n" + "═"*60)
    print("  Cliniverse AI — globals.css Theme Variables Patch")
    print("═"*60 + "\n")

    if not GLOBALS.exists():
        print(f"❌ globals.css not found at {GLOBALS}")
        return

    # Backup
    BACKUP.parent.mkdir(exist_ok=True)
    if not BACKUP.exists():
        import shutil
        shutil.copy2(GLOBALS, BACKUP)
        print(f"📁 Backup saved → {BACKUP}")

    content = GLOBALS.read_text(encoding='utf-8')
    original = content

    # Remove any existing data-theme blocks (we'll replace with our clean version)
    content = re.sub(
        r"/\*\s*══+.*?Pure Hospital.*?══+.*?\*/\s*\[data-theme=['\"]hospital['\"]\][^}]*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"\[data-theme=['\"]hospital['\"]\][^{]*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"\[data-theme=['\"]cyber['\"]\][^{]*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"\[data-theme=['\"]midnight['\"]\][^{]*\{[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )
    # Remove old :root block if it only has vars
    content = re.sub(
        r":root\s*\{[^}]*--bg-base[^}]*\}",
        '',
        content,
        flags=re.DOTALL
    )

    # Also fix body if it has hardcoded dark background
    content = re.sub(
        r"body\s*\{([^}]*background\s*:\s*#[0-9a-fA-F]{6}[^}]*)\}",
        lambda m: "body {" + m.group(1).replace(
            re.search(r"background\s*:\s*#[0-9a-fA-F]{6}", m.group(1)).group(0),
            "background: var(--bg-base, #0A1628)"
        ) + "}",
        content,
        flags=re.DOTALL
    )

    # Inject our CSS variables at the top (after any @import or @tailwind)
    # Find the right insertion point
    insertion_point = 0
    for pattern in [r'@tailwind\s+utilities;', r'@import\s+[^;]+;']:
        matches = list(re.finditer(pattern, content))
        if matches:
            insertion_point = max(insertion_point, matches[-1].end())

    if insertion_point == 0:
        # Insert at the very start
        content = HOSPITAL_VARS + "\n" + content
    else:
        content = content[:insertion_point] + "\n" + HOSPITAL_VARS + content[insertion_point:]

    # Write back
    if content != original:
        GLOBALS.write_text(content, encoding='utf-8')
        print("✅ globals.css patched with all 3 theme variable sets")
        print("   • Pure Hospital (light)")
        print("   • Dark Cyber (default)")
        print("   • Midnight Blue")
    else:
        print("✓  globals.css already up to date")

    # Check ThemeProvider
    theme_provider = PROJECT / 'app' / 'components' / 'ThemeProvider.tsx'
    if not theme_provider.exists():
        theme_provider = PROJECT / 'app' / 'ThemeProvider.tsx'

    if theme_provider.exists():
        tp_content = theme_provider.read_text(encoding='utf-8')
        if 'hospital' not in tp_content:
            print("\n⚠️  ThemeProvider.tsx doesn't handle 'hospital' theme!")
            print("   Make sure it sets data-theme='hospital' when theme is 'hospital'")
        else:
            print("✅ ThemeProvider.tsx handles 'hospital' theme")
    else:
        print("\n⚠️  ThemeProvider.tsx not found — make sure theme is applied to <html>")

    print("\n" + "═"*60)
    print("  Run next: python3 fix_tools_themes.py")
    print("  Then:     git add -A && git commit -m 'fix: Pure Hospital theme system'")
    print("═"*60 + "\n")


if __name__ == '__main__':
    patch_globals()
