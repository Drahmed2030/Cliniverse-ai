#!/usr/bin/env python3
"""
update_components_theme.py — Cliniverse AI
══════════════════════════════════════════════════════════════════
يحدث كل مكون ليستخدم useTheme() بدل C object القديم

الخطوات:
1. يضيف import { useTheme } من ClinicalTheme
2. يستبدل const C = { ... } بـ const { T } = useTheme()
3. يستبدل C.text → T.text, C.card → T.bgCard إلخ
══════════════════════════════════════════════════════════════════
"""

from pathlib import Path
import re
import shutil

PROJECT = Path('/Users/macbook/cliniverse-ai')
COMP    = PROJECT / 'app' / 'components'
BACKUP  = PROJECT / '_theme_backups'
BACKUP.mkdir(exist_ok=True)

# ── C object → T mapping ─────────────────────────────────────────
# C.xxx → T.xxx
C_TO_T = {
    # Text
    'C.text':    'T.text',
    'C.sub':     'T.textSub',
    'C.muted':   'T.textMuted',
    'C.dim':     'T.textMuted',
    # Backgrounds
    'C.card':    'T.bgCard',
    'C.bg':      'T.bg',
    'C.bg1':     'T.bgCardSolid',
    'C.bg2':     'T.bgDeep',
    # Borders
    'C.border':  'T.border',
    # Accent
    'C.accent':  'T.accent',
    'C.teal':    'T.accent',
    'C.blue':    'T.accentBlue',
    'C.red':     'T.accentCoral',
    'C.green':   'T.accentMint',
    'C.amber':   'T.accentAmber',
    'C.violet':  'T.accentViolet',
    # Nav
    'C.navBg':   'T.navBg',
    'C.navBorder':'T.navBorder',
}

# Patterns للـ C object definition
C_OBJECT_PATTERNS = [
    # const C = { ... }
    r"const C\s*=\s*\{[^}]+\}",
    # const COLORS = { ... }
    r"const COLORS\s*=\s*\{[^}]+\}",
    # const COL = { ... }
    r"const COL\s*=\s*\{[^}]+\}",
    # const THEME = { text: ..., card: ... }  (local theme objects)
    r"const T\s*=\s*\{[^}]*text\s*:[^}]*\}",
]

# Import line to add
IMPORT_LINE = "import { useTheme } from './ClinicalTheme'"
HOOK_LINE   = "  const { T } = useTheme()"

def has_c_object(content: str) -> bool:
    """Check if file has a C/COLORS object with theme colors."""
    patterns = [
        r"const C\s*=\s*\{",
        r"const COLORS\s*=\s*\{",
        r"const COL\s*=\s*\{",
    ]
    for p in patterns:
        if re.search(p, content):
            return True
    return False

def has_c_usage(content: str) -> bool:
    """Check if file uses C.text, C.card etc."""
    return bool(re.search(r'\bC\.(text|sub|muted|card|bg|border|accent|teal|blue|red|green|amber|violet|nav)', content))

def add_import(content: str, filename: str) -> str:
    """Add useTheme import if not present."""
    if 'useTheme' in content:
        return content
    if 'ClinicalTheme' in content:
        return content

    # Add after first import line
    lines = content.split('\n')
    insert_at = 0
    for i, line in enumerate(lines):
        if line.startswith("'use client'") or line.startswith('"use client"'):
            insert_at = i + 1
            break
        elif line.startswith('import '):
            insert_at = i + 1

    lines.insert(insert_at, IMPORT_LINE)
    return '\n'.join(lines)

def add_hook(content: str) -> str:
    """Add const { T } = useTheme() inside component function."""
    if "const { T } = useTheme()" in content:
        return content

    # Find export default function or function declaration
    patterns = [
        r'(export default function \w+[^{]*\{)',
        r'(export function \w+[^{]*\{)',
        r'(function \w+[^{]*\{(?!\s*return))',
    ]

    for p in patterns:
        m = re.search(p, content)
        if m:
            insert_pos = m.end()
            return content[:insert_pos] + '\n' + HOOK_LINE + content[insert_pos:]

    return content

def replace_c_refs(content: str) -> tuple[str, int]:
    """Replace C.xxx with T.xxx."""
    count = 0
    for old, new in C_TO_T.items():
        if old in content:
            n = content.count(old)
            content = content.replace(old, new)
            count += n
    return content, count

def remove_c_object(content: str) -> str:
    """Remove the C = {...} object definition."""
    # Remove const C = { ... } blocks
    patterns = [
        r"\n*const C\s*=\s*\{[^}]*\}\s*\n",
        r"\n*const COLORS\s*=\s*\{[^}]*\}\s*\n",
        r"\n*const COL\s*=\s*\{[^}]*\}\s*\n",
    ]
    for p in patterns:
        content = re.sub(p, '\n', content, flags=re.DOTALL)
    return content

def process_file(filepath: Path) -> dict:
    """Process one component file."""
    content = filepath.read_text(encoding='utf-8')
    original = content

    # Skip if no C usage
    if not has_c_usage(content):
        return {'status': 'skip', 'changes': 0}

    # Backup
    bak = BACKUP / filepath.name
    if not bak.exists():
        shutil.copy2(filepath, bak)

    # 1. Add import
    content = add_import(content, filepath.name)

    # 2. Add hook inside component
    content = add_hook(content)

    # 3. Replace C.xxx → T.xxx
    content, n = replace_c_refs(content)

    # 4. Remove old C object
    if has_c_object(original):
        content = remove_c_object(content)

    if content != original:
        filepath.write_text(content, encoding='utf-8')
        return {'status': 'fixed', 'changes': n}

    return {'status': 'unchanged', 'changes': 0}

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — Update Components to useTheme()")
    print("═"*60 + "\n")

    files = sorted(COMP.glob('*.tsx'))
    results = {'fixed': [], 'skip': [], 'unchanged': []}
    total_changes = 0

    for f in files:
        # Skip the theme files themselves
        if f.name in ('ClinicalTheme.tsx', 'ThemeProvider.tsx', 'ThemeToggle.tsx'):
            continue

        r = process_file(f)
        if r['status'] == 'fixed':
            results['fixed'].append((f.name, r['changes']))
            total_changes += r['changes']
            print(f"  ✅ {f.name:<45} {r['changes']} changes")
        elif r['status'] == 'unchanged':
            results['unchanged'].append(f.name)
        # skip = no C usage, don't print

    print(f"\n{'═'*60}")
    print(f"  Fixed:     {len(results['fixed'])} files")
    print(f"  Skipped:   {len(results['skip'])} files (no C usage)")
    print(f"  Unchanged: {len(results['unchanged'])} files")
    print(f"  Total changes: {total_changes}")
    print(f"{'═'*60}")
    print(f"\n🚀 Next:")
    print(f"   npx next build")
    print(f"   git add -A && git commit -m 'feat: all components use useTheme()'")
    print(f"   git push\n")

if __name__ == '__main__':
    main()
