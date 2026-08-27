import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SPECIALTIES = ['cardiology','emergency medicine','internal medicine','neurology','respiratory','pediatrics','critical care']

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  try {
    const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)]
    const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
    const searchUrl = base + '/esearch.fcgi?db=pubmed&term=' + encodeURIComponent(specialty) + '[majr]&retmax=5&sort=date&retmode=json'
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()
    const ids: string[] = searchData.esearchresult?.idlist ?? []
    if (ids.length === 0) return NextResponse.json({ success: true, message: 'No new articles' })
    const detailUrl = base + '/esummary.fcgi?db=pubmed&id=' + ids.join(',') + '&retmode=json'
    const detailRes = await fetch(detailUrl)
    const detailData = await detailRes.json()
    const articles = Object.values(detailData.result ?? {}).filter((a: any) => a.uid)
    const rows = (articles as any[]).map((a: any) => ({
      id: 'pubmed_' + a.uid,
      title: a.title,
      abstract: a.source,
      authors: a.authors?.map((au: any) => au.name).join(', ') ?? '',
      journal: a.fulljournalname ?? a.source,
      specialty: specialty,
      pubmed_id: a.uid,
      url: 'https://pubmed.ncbi.nlm.nih.gov/' + a.uid + '/',
      published_at: new Date().toISOString(),
    }))
    await supabase.from('pubmed_articles').upsert(rows, { onConflict: 'id' })
    return NextResponse.json({ success: true, count: rows.length })
  } catch {
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 })
  }
}
