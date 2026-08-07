import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function supabaseFetch(path: string, options: any = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers,
    }
  })
  return res.json()
}

const FALLBACK_CASES = [
  {
    title:'45F — Acute Dyspnea + Pleuritic Chest Pain',
    summary:'45F, sudden dyspnea, pleuritic chest pain. HR 118, SpO2 90%. Recent long-haul flight. Wells score 6.',
    tags:['PE','Emergency','Critical'],
    img_query:'chest xray hospital emergency',
    options:[
      {key:'ctpa',label:'CT Pulmonary Angiography',emoji:'🔬',color:'#0D9488'},
      {key:'heparin',label:'Empirical Heparin now',emoji:'💉',color:'#1E40AF'},
      {key:'vq',label:'V/Q Scan first',emoji:'🫁',color:'#7C3AED'},
    ]
  },
  {
    title:'68M — Confusion + Fever + Neck Stiffness',
    summary:'68M, 6h confusion, fever 39.6°C, neck stiffness, photophobia. Post-chemotherapy.',
    tags:['Neurology','Infection','Emergency'],
    img_query:'brain MRI hospital neurology',
    options:[
      {key:'abx',label:'Antibiotics immediately then LP',emoji:'💊',color:'#EF4444'},
      {key:'ct',label:'CT head first then LP',emoji:'🧠',color:'#1E40AF'},
      {key:'lp',label:'LP immediately',emoji:'🔬',color:'#7C3AED'},
    ]
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if(searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await supabaseFetch('nexus_cases?active=eq.true', {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
      prefer: 'return=minimal',
    })

    const unused = await supabaseFetch('nexus_cases?active=eq.false&activated_at=is.null&limit=1')

    if(unused?.length > 0) {
      await supabaseFetch(`nexus_cases?id=eq.${unused[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          active: true,
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString()
        }),
        prefer: 'return=minimal',
      })
      return NextResponse.json({ success: true, source: 'existing' })
    }

    const c = FALLBACK_CASES[Math.floor(Math.random() * FALLBACK_CASES.length)]
    await supabaseFetch('nexus_cases', {
      method: 'POST',
      body: JSON.stringify({
        ...c,
        active: true,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString()
      }),
    })

    return NextResponse.json({ success: true, source: 'fallback' })
  } catch(err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
