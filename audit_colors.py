#!/usr/bin/env python3
"""
audit_colors.py — Cliniverse AI
════════════════════════════════
Run AFTER fix_tools_themes.py to verify no hardcoded colors remain.

Usage:
  cd /Users/macbook/cliniverse-ai
  python3 audit_colors.py
"""

import re
from pathlib import Path

PROJECT       = Path('/Users/macbook/cliniverse-ai')
COMPONENTS    = PROJECT / 'app' / 'components'

TARGET_FILES = [
    'CodeBlue.tsx','RapidFire.tsx','BLSACLSModule.tsx','OnCallSystem.tsx',
    'NightShiftSurvival.tsx','EcgChallenge.tsx','CardiacSurgeryAI.tsx',
    'NeuroSurgeryAI.tsx','ClinicalNexus.tsx','GeneralSurgeryAI.tsx',
    'PharmacyModule.tsx','NursingModule.tsx','LabModule.tsx','RadiologyModule.tsx',
    'AICaseGenerator.tsx','PocketConsultant.tsx','ShiftHandoverAI.tsx',
    'ClinicalWorkshop.tsx','MedCalculators.tsx','Guidelines.tsx',
    'ClinicalDuels.tsx','GrandRoundsAI.tsx','ClinicalToolkit.tsx',
    'RenalDosingAI.tsx','DrugInteractionChecker.tsx','ClinicalRiskCalculator.tsx',
    'ClinicalMemory.tsx','PrescriptionAI.tsx','ClinicalLogbook.tsx',
    'AmbientScribe.tsx','ClinicalExplorer.tsx','FHIRIntegration.tsx',
    'EnterprisePage.tsx','MedicalTerminology.tsx','WeeklyClinicalPearl.tsx',
    'TeleconsultModule.tsx','NonInvasiveTech.tsx','CriticalCareModule.tsx',
    'PediatricsModule.tsx','SportsMedicineModule.tsx','DrugInteractionAI.tsx',
]

# Patterns that indicate a problem
PROBLEM_PATTERNS = [
    (r"background\s*:\s*'#[01][0-9a-fA-F]{5}'",         'dark bg hex'),
    (r'background\s*:\s*"#[01][0-9a-fA-F]{5}"',         'dark bg hex'),
    (r"background\s*:\s*'linear-gradient[^']*#[01]",     'dark gradient'),
    (r"color\s*:\s*'#(?:F2F8FC|ffffff|FFFFFF|fff)'",     'white text'),
    (r"color\s*:\s*\"#(?:F2F8FC|ffffff|FFFFFF|fff)\"",   'white text'),
    (r"var\(--bg-base,#[01]",                            'wrong fallback (dark)'),
    (r"var\(--text-primary,#F2F8FC\)",                   'wrong text fallback'),
    (r"minHeight.*100vh.*background.*#[01]",             'dark fullscreen bg'),
]

print("\n" + "═"*60)
print("  Cliniverse AI — Color Audit")
print("═"*60 + "\n")

total_issues = 0

for filename in TARGET_FILES:
    filepath = COMPONENTS / filename
    if not filepath.exists():
        continue

    content = filepath.read_text(encoding='utf-8')
    file_issues = []

    for pattern, desc in PROBLEM_PATTERNS:
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            file_issues.append(f"  [{desc}] × {len(matches)}")
            total_issues += len(matches)

    if file_issues:
        print(f"⚠️  {filename}")
        for issue in file_issues:
            print(issue)
        print()

if total_issues == 0:
    print("✅ All components are theme-clean! No hardcoded dark colors found.")
else:
    print(f"❌ {total_issues} issues remaining — re-run fix_tools_themes.py")

print("\n" + "═"*60 + "\n")
