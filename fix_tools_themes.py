#!/usr/bin/env python3
"""
fix_tools_themes.py
════════════════════════════════════════════════════════════════════════
Cliniverse AI — Fix hardcoded dark backgrounds in TOOLS internal components
so they respect Pure Hospital (and all themes) via CSS Variables.

Usage:
  cd /Users/macbook/cliniverse-ai
  python3 fix_tools_themes.py

What it does:
  1. Scans all 47 TOOLS component .tsx files
  2. Replaces hardcoded dark backgrounds on main containers with var(--bg-base)
  3. Replaces hardcoded dark card backgrounds with var(--bg-card)
  4. Replaces hardcoded text colors with var(--text-primary) / var(--text-secondary)
  5. Adds CSS variable fallbacks everywhere
  6. Creates a backup of each file before modifying
  7. Prints a summary of what changed
════════════════════════════════════════════════════════════════════════
"""

import re
import os
import shutil
from pathlib import Path

# ── CONFIG ──────────────────────────────────────────────────────────────
PROJECT = Path('/Users/macbook/cliniverse-ai')
COMPONENTS_DIR = PROJECT / 'app' / 'components'
BACKUP_DIR = PROJECT / '_theme_backups'

# All 47 tool components from ToolsPage.tsx
TARGET_FILES = [
    'CodeBlue.tsx',
    'RapidFire.tsx',
    'BLSACLSModule.tsx',
    'OnCallSystem.tsx',
    'NightShiftSurvival.tsx',
    'EcgChallenge.tsx',
    'CardiacSurgeryAI.tsx',
    'NeuroSurgeryAI.tsx',
    'ClinicalNexus.tsx',
    'GeneralSurgeryAI.tsx',
    'PharmacyModule.tsx',
    'NursingModule.tsx',
    'LabModule.tsx',
    'RadiologyModule.tsx',
    'AICaseGenerator.tsx',
    'PocketConsultant.tsx',
    'ShiftHandoverAI.tsx',
    'ClinicalWorkshop.tsx',
    'MedCalculators.tsx',
    'Guidelines.tsx',
    'ClinicalDuels.tsx',
    'GrandRoundsAI.tsx',
    'ClinicalToolkit.tsx',
    'RenalDosingAI.tsx',
    'DrugInteractionChecker.tsx',
    'ClinicalRiskCalculator.tsx',
    'ClinicalMemory.tsx',
    'PrescriptionAI.tsx',
    'ClinicalLogbook.tsx',
    'AmbientScribe.tsx',
    'ClinicalExplorer.tsx',
    'FHIRIntegration.tsx',
    'EnterprisePage.tsx',
    'MedicalTerminology.tsx',
    'WeeklyClinicalPearl.tsx',
    'TeleconsultModule.tsx',
    'NonInvasiveTech.tsx',
    'CriticalCareModule.tsx',
    'PediatricsModule.tsx',
    'SportsMedicineModule.tsx',
    'DrugInteractionAI.tsx',
]

# ── REPLACEMENT RULES ────────────────────────────────────────────────────
# Each rule: (description, compiled_regex, replacement_string)
# Order matters — more specific patterns first.

RULES = [

    # ── 1. minHeight:'100vh' containers with hardcoded dark backgrounds ──
    # Catches: background:'#0d1117', background:'#0a1628', #1e2d40, #162030,
    #          #0f1923, #111827, #0d1b2a, #1a1a2e, #12181f, #0c1426, etc.
    (
        'Main container dark bg → var(--bg-base)',
        re.compile(
            r"(minHeight\s*:\s*['\"]100vh['\"].*?)"
            r"background\s*:\s*['\"](?:#(?:[0-9a-fA-F]{3,8})|(?:linear-gradient|radial-gradient)\([^'\"]+)['\"]",
            re.DOTALL
        ),
        lambda m: m.group(0).replace(
            re.search(r"background\s*:\s*['\"][^'\"]+['\"]", m.group(0)).group(0),
            "background:'var(--bg-base,#F7F9FC)'"
        )
    ),

    # ── 2. Any background with specific dark hex colors ──
    (
        'Dark hex backgrounds → var(--bg-base)',
        re.compile(
            r"background\s*:\s*['\"]"
            r"(#(?:0[0-9a-fA-F]{5}|1[0-5][0-9a-fA-F]{4}|0[a-fA-F][0-9a-fA-F]{4}))"
            r"['\"]"
        ),
        "background:'var(--bg-base,#F7F9FC)'"
    ),

    # ── 3. backgroundColor with dark hex ──
    (
        'Dark hex backgroundColor → var(--bg-base)',
        re.compile(
            r"backgroundColor\s*:\s*['\"]"
            r"(#(?:0[0-9a-fA-F]{5}|1[0-5][0-9a-fA-F]{4}|0[a-fA-F][0-9a-fA-F]{4}))"
            r"['\"]"
        ),
        "backgroundColor:'var(--bg-base,#F7F9FC)'"
    ),

    # ── 4. Card/panel backgrounds with specific dark patterns ──
    # rgba(13,17,23,*), rgba(10,22,40,*), rgba(14,21,32,*), rgba(22,32,48,*) etc.
    (
        'Dark rgba card backgrounds → var(--bg-card)',
        re.compile(
            r"background\s*:\s*['\"]"
            r"rgba\(\s*(?:1[0-9]|[0-9])\s*,\s*(?:[0-9]|[1-3][0-9])\s*,\s*(?:[0-9]|[1-5][0-9])\s*,\s*[\d.]+\s*\)"
            r"['\"]"
        ),
        "background:'var(--bg-card,rgba(255,255,255,0.06))'"
    ),

    # ── 5. Specific common dark background strings ──
    (
        'Common dark bg strings → var(--bg-base)',
        re.compile(
            r"background\s*:\s*['\"]"
            r"(?:#1e2d40|#162030|#0f1923|#111827|#0d1b2a|#1a1a2e|#12181f|#0c1426"
            r"|#0a0f1a|#0d1117|#0a1628|#1a2332|#0f1729|#131f30|#1c2a3a|#0e1a28"
            r"|#151e2d|#1b2838|#0b1520|#16212e|#1f2937|#111523|#0d1520|#18243a)"
            r"['\"]"
        ),
        "background:'var(--bg-base,#F7F9FC)'"
    ),

    # ── 6. Dark gradient backgrounds (linear-gradient with dark colors) ──
    (
        'Dark linear-gradient backgrounds → var(--bg-base)',
        re.compile(
            r"background\s*:\s*['\"]linear-gradient\([^'\"]*"
            r"#(?:0[0-9a-fA-F]{5}|1[0-5][0-9a-fA-F]{4})[^'\"]*\)['\"]"
        ),
        "background:'var(--bg-base,#F7F9FC)'"
    ),

    # ── 7. Hardcoded white text colors ──
    # #ffffff, #F2F8FC, #E8EDF5 — replace with CSS variable
    (
        'Hardcoded white text → var(--text-primary)',
        re.compile(
            r"color\s*:\s*['\"]"
            r"(?:#(?:fff(?:fff)?|F2F8FC|E8EDF5|f0f0f0|FFFFFF|ffffff|e5e7eb|f1f5f9))"
            r"['\"]"
        ),
        "color:'var(--text-primary,#0A1628)'"
    ),

    # ── 8. Hardcoded muted/secondary white-ish text ──
    (
        'Hardcoded rgba white text → var(--text-secondary)',
        re.compile(
            r"color\s*:\s*['\"]"
            r"rgba\(\s*(?:242|255|248|240)\s*,\s*(?:248|255|243|241)\s*,\s*(?:252|255|249|245)\s*,\s*(0\.[3-7]\d*)\s*\)"
            r"['\"]"
        ),
        "color:'var(--text-secondary,rgba(10,22,40,0.55))'"
    ),

    # ── 9. T.text / T.sub hardcoded fallbacks (if T object used) ──
    # These are fine — T objects use CSS variables already.
    # But if someone hardcoded T.text as a string, catch it:
    (
        'T.text hardcoded string references',
        re.compile(r"color\s*:\s*T\.text(?!\w)"),
        "color:'var(--text-primary,#0A1628)'"
    ),
    (
        'T.sub hardcoded string references',
        re.compile(r"color\s*:\s*T\.sub(?!\w)"),
        "color:'var(--text-secondary,rgba(10,22,40,0.55))'"
    ),

    # ── 10. Border colors that are hardcoded dark rgba ──
    (
        'Dark border rgba → var(--border-card)',
        re.compile(
            r"border(?:Color)?\s*:\s*['\"]"
            r"rgba\(\s*(?:1[0-9]|[0-9])\s*,\s*(?:[0-9]|[1-3][0-9])\s*,\s*(?:[0-9]|[1-5][0-9])\s*,\s*[\d.]+\s*\)"
            r"['\"]"
        ),
        "border:'1px solid var(--border-card,rgba(255,255,255,0.10))'"
    ),
]

# ── SIMPLE STRING REPLACEMENTS (faster for exact known strings) ──────────
SIMPLE_REPLACEMENTS = [
    # Main page containers — the most common hardcoded dark wrappers
    ("background: '#0d1117'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ('background: "#0d1117"',           'background: "var(--bg-base,#F7F9FC)"'),
    ("background: '#0a1628'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ('background: "#0a1628"',           'background: "var(--bg-base,#F7F9FC)"'),
    ("background: '#1e2d40'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ('background: "#1e2d40"',           'background: "var(--bg-base,#F7F9FC)"'),
    ("background: '#162030'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ('background: "#162030"',           'background: "var(--bg-base,#F7F9FC)"'),
    ("background: '#0f1923'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#111827'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0d1b2a'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#1a1a2e'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#12181f'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0c1426'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0a0f1a'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#1a2332'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0f1729'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#131f30'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#1c2a3a'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0e1a28'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#151e2d'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#1b2838'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0b1520'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#16212e'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#1f2937'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#111523'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0d1520'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#18243a'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#13202e'",           "background: 'var(--bg-base,#F7F9FC)'"),
    ("background: '#0c1522'",           "background: 'var(--bg-base,#F7F9FC)'"),

    # Card dark backgrounds → var(--bg-card)
    ("background: 'rgba(255,255,255,0.03)'", "background: 'var(--bg-card,rgba(255,255,255,0.06))'"),
    ("background: 'rgba(255,255,255,0.02)'", "background: 'var(--bg-card,rgba(255,255,255,0.06))'"),

    # Hardcoded white text
    ("color: '#F2F8FC'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#ffffff'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#FFFFFF'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#fff'",       "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#E8EDF5'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#f0f0f0'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#e5e7eb'",    "color: 'var(--text-primary,#0A1628)'"),
    ("color: '#f1f5f9'",    "color: 'var(--text-primary,#0A1628)'"),

    # Already-correct patterns that have wrong fallbacks — fix fallbacks
    ("var(--text-primary,#F2F8FC)",           "var(--text-primary,#0A1628)"),
    ("var(--text-secondary,rgba(242,248,252,0.55))", "var(--text-secondary,rgba(10,22,40,0.55))"),
    ("var(--text-muted,rgba(242,248,252,0.45))",     "var(--text-muted,rgba(10,22,40,0.40))"),
    ("var(--text-muted,rgba(242,248,252,0.40))",     "var(--text-muted,rgba(10,22,40,0.40))"),
    ("var(--text-muted,rgba(242,248,252,0.30))",     "var(--text-muted,rgba(10,22,40,0.30))"),
    ("var(--bg-base,#0A1628)",                       "var(--bg-base,#F7F9FC)"),
    ("var(--bg-base,#0d1117)",                       "var(--bg-base,#F7F9FC)"),
    ("var(--bg-base,#0a1628)",                       "var(--bg-base,#F7F9FC)"),
]

# ── HELPERS ──────────────────────────────────────────────────────────────

def apply_simple_replacements(content: str) -> tuple[str, int]:
    """Apply exact string replacements. Returns (new_content, count)."""
    count = 0
    for old, new in SIMPLE_REPLACEMENTS:
        if old in content:
            n = content.count(old)
            content = content.replace(old, new)
            count += n
    return content, count


def fix_file(filepath: Path) -> dict:
    """Process one file. Returns stats dict."""
    if not filepath.exists():
        return {'status': 'missing', 'changes': 0}

    original = filepath.read_text(encoding='utf-8')

    # Backup
    backup_path = BACKUP_DIR / filepath.name
    if not backup_path.exists():  # Don't overwrite existing backup
        backup_path.write_text(original, encoding='utf-8')

    content = original
    total_changes = 0

    # Apply simple replacements first (fast, exact)
    content, n = apply_simple_replacements(content)
    total_changes += n

    # If no changes yet, try regex rules on remaining patterns
    for desc, pattern, replacement in RULES:
        if callable(replacement):
            new_content, n = re.subn(pattern, replacement, content)
        else:
            new_content, n = re.subn(pattern, replacement, content)
        if n > 0:
            content = new_content
            total_changes += n

    if content != original:
        filepath.write_text(content, encoding='utf-8')
        return {'status': 'fixed', 'changes': total_changes}
    else:
        return {'status': 'clean', 'changes': 0}


# ── ALSO: Add CSS variable wrapper to any file missing it ────────────────

def check_needs_css_vars(filepath: Path) -> bool:
    """Returns True if file uses hardcoded colors but no CSS variables."""
    if not filepath.exists():
        return False
    content = filepath.read_text(encoding='utf-8')
    has_dark_bg = bool(re.search(r"background.*#[0-9a-fA-F]{6}", content))
    has_css_vars = 'var(--bg' in content or 'var(--text' in content
    return has_dark_bg and not has_css_vars


# ── MAIN ─────────────────────────────────────────────────────────────────

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — TOOLS Theme Fix")
    print("  Pure Hospital compatibility patch")
    print("═"*60 + "\n")

    # Create backup directory
    BACKUP_DIR.mkdir(exist_ok=True)
    print(f"📁 Backups → {BACKUP_DIR}\n")

    # Find component directory
    if not COMPONENTS_DIR.exists():
        # Try alternate locations
        alts = [
            PROJECT / 'components',
            PROJECT / 'src' / 'components',
            PROJECT / 'app',
        ]
        for alt in alts:
            if alt.exists():
                print(f"⚠️  Using alternate components dir: {alt}")
                components = alt
                break
        else:
            print(f"❌ Could not find components directory in {PROJECT}")
            return
    else:
        components = COMPONENTS_DIR

    # Process each file
    results = {'fixed': [], 'clean': [], 'missing': []}

    for filename in TARGET_FILES:
        filepath = components / filename
        stats = fix_file(filepath)

        if stats['status'] == 'fixed':
            results['fixed'].append((filename, stats['changes']))
            print(f"  ✅ {filename:<40} {stats['changes']} replacements")
        elif stats['status'] == 'clean':
            results['clean'].append(filename)
            print(f"  ✓  {filename:<40} already clean")
        else:
            results['missing'].append(filename)
            print(f"  ⚠️  {filename:<40} NOT FOUND")

    # Summary
    print("\n" + "═"*60)
    print(f"  Fixed:   {len(results['fixed'])} files")
    print(f"  Clean:   {len(results['clean'])} files")
    print(f"  Missing: {len(results['missing'])} files")
    print("═"*60)

    if results['missing']:
        print("\n⚠️  Missing files (check component names):")
        for f in results['missing']:
            print(f"   • {f}")

    total_replacements = sum(n for _, n in results['fixed'])
    print(f"\n✨ Total replacements: {total_replacements}")

    # Also check globals.css has the CSS variables for Pure Hospital
    globals_css = PROJECT / 'app' / 'globals.css'
    if globals_css.exists():
        css_content = globals_css.read_text(encoding='utf-8')
        if '--bg-base' not in css_content:
            print("\n⚠️  WARNING: globals.css missing --bg-base CSS variable!")
            print("   Add this to your [data-theme='hospital'] section:")
            print_css_vars()
        else:
            print("\n✅ globals.css has CSS variables — theme switching ready")
    else:
        print("\n⚠️  globals.css not found at expected path")

    print("\n🚀 Next: git add -A && git commit -m 'fix: TOOLS components theme-aware Pure Hospital'\n")


def print_css_vars():
    """Print the CSS variables needed if missing from globals.css."""
    print("""
  [data-theme='hospital'] {
    --bg-base:         #F7F9FC;
    --bg-card:         rgba(255,255,255,0.85);
    --bg-elevated:     #FFFFFF;
    --border-card:     rgba(0,100,180,0.12);
    --text-primary:    #0A1628;
    --text-secondary:  rgba(10,22,40,0.65);
    --text-muted:      rgba(10,22,40,0.40);
    --accent:          #0064B4;
    --accent-glow:     rgba(0,100,180,0.15);
  }
""")


if __name__ == '__main__':
    main()
