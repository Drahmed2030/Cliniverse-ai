import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { localDcmReviewAllowed } from '../../lib/clinicalMedia/localDcmReview.ts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const path = process.env.CLINIVERSE_LOCAL_DCM_FILE
  if (process.env.NODE_ENV !== 'development' || !path) return new Response(null, { status: 404 })
  let bytes: Buffer
  try { bytes = await readFile(path) } catch { return new Response(null, { status: 404 }) }
  if (!localDcmReviewAllowed(process.env.NODE_ENV, createHash('sha256').update(bytes).digest('hex'))) {
    return new Response('Local derivative checksum mismatch', { status: 409, headers: { 'Cache-Control': 'no-store' } })
  }
  const headers = new Headers({ 'Content-Type': 'video/mp4', 'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' })
  const range = request.headers.get('range')
  let start = 0
  let end = bytes.length - 1
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416 })
    if (!match[1]) start = Math.max(0, bytes.length - Number(match[2]))
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])) }
    if (start > end || start < 0 || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
      headers.set('Content-Range', `bytes */${bytes.length}`)
      return new Response(null, { status: 416, headers })
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${bytes.length}`)
  }
  headers.set('Content-Length', String(end - start + 1))
  return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status: range ? 206 : 200, headers })
}

export async function HEAD(request: Request) {
  const response = await GET(request)
  return new Response(null, { status: response.status, headers: response.headers })
}
