import os, sys

print("🚀 Cliniverse AI — Master Restore Script")
print("=" * 50)

# ══════════════════════════════════════════
# 1. RESTORE page.tsx — النسخة الكاملة
# ══════════════════════════════════════════
page_path = os.path.expanduser('~/cliniverse-ai/app/page.tsx')

with open('/Users/macbook/Downloads/page.tsx', 'r', encoding='utf-8') as f:
    page_content = f.read()

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print(f"✅ 1. page.tsx restored — {len(page_content)} chars, {page_content.count(chr(10))} lines")

# ══════════════════════════════════════════
# 2. FIX route.ts — نظيف 100%
# ══════════════════════════════════════════
route_content = '''import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const specialty = body.specialty || 'Emergency Medicine'
    const difficulty = body.difficulty || 'Intermediate'
    const sysPrompt = body.systemPrompt || 'You are an expert medical educator creating realistic clinical simulation cases.'
    const userPrompt = body.userPrompt || ('Generate a ' + difficulty + ' level ' + specialty + ' case in JSON format.')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: sysPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    return NextResponse.json({ success: true, case: JSON.parse(match[0]) })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('Generate case error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
'''

route_path = os.path.expanduser('~/cliniverse-ai/app/api/generate-case/route.ts')
os.makedirs(os.path.dirname(route_path), exist_ok=True)
with open(route_path, 'w', encoding='utf-8') as f:
    f.write(route_content)
print("✅ 2. route.ts fixed — clean, no template literal errors")

# ══════════════════════════════════════════
# 3. VERIFY all components exist
# ══════════════════════════════════════════
components_dir = os.path.expanduser('~/cliniverse-ai/app/components')
required = [
    'AICaseGenerator.tsx', 'AdminDashboard.tsx', 'BLSACLSModule.tsx',
    'BoardExam.tsx', 'ClinicalDuels.tsx', 'ClinicalWorkshop.tsx',
    'CodeBlue.tsx', 'DiagnosticDetective.tsx', 'DifficultConversations.tsx',
    'DynamicMCQ.tsx', 'EcgChallenge.tsx', 'ErrorAutopsy.tsx',
    'HealthInsights.tsx', 'LabModule.tsx', 'Leaderboard.tsx',
    'LiveCasesSystem.tsx', 'MedCalculators.tsx', 'NightShiftSurvival.tsx',
    'NursingModule.tsx', 'OnCallSystem.tsx', 'OnboardingFunnel.tsx',
    'PWAInstall.tsx', 'PharmacyModule.tsx', 'RadiologyModule.tsx',
    'STEMICase.tsx', 'SocialHub.tsx', 'TeleconsultModule.tsx',
]

print("\n📋 Component Status:")
missing = []
for comp in required:
    path = os.path.join(components_dir, comp)
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f"  ✅ {comp} ({size:,} bytes)")
    else:
        print(f"  ❌ MISSING: {comp}")
        missing.append(comp)

if missing:
    print(f"\n⚠️  {len(missing)} components missing!")
else:
    print(f"\n✅ All {len(required)} components present!")

print("\n" + "=" * 50)
print("✅ Done! Now run: git add . && git commit -m 'restore full app' && git push")
