import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const SPECIALTIES = [
  'cardiology', 'emergency medicine', 'internal medicine',
  'neurology', 'respiratory', 'pediatrics', 'critical care'
]

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)]

    // Fetch from PubMed
    const searchRes = await fetch(
      https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(specialty)}[majr]&retmax=5&sort=date&retmode=json
    )
    const searchData = await searchRes.json()
    const ids = searchData.esearchresult?.idlist || []

    if (ids.length === 0) return NextResponse.json({ success: true, message: 'No new articles' })

    // Fetch article details
    const detailRes = await fetch(
      https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json
    )
    const detailData = await detailRes.json()
    const articles = Object.values(detailData.result || {}).filter((a: any) => a.uid)

    // Save to Supabase
    const rows = (articles as any[]).map((a: any) => ({
      id: pubmed_${a.uid},
      title: a.title,
      abstract: a.source,
      authors: a.authors?.map((au: any) => au.name).join(', ') || '',
      journal: a.fulljournalname || a.source,
      specialty: specialty,
      pubmed_id: a.uid,
      url: https://pubmed.ncbi.nlm.nih.gov/${a.uid}/,
      published_at: new Date(a.pubdate).toISOString(),
    }))

    await supabase.from('pubmed_articles').upsert(rows, { onConflict: 'id' })

    return NextResponse.json({ success: true, count: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
