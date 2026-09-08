#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function arg(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const dir = resolve(arg('--dir') ?? '.')
const manifestPath = resolve(arg('--manifest') ?? 'docs/echo-media-lab-2026-09-07/pipeline/echo-batch-01-probe-manifest.json')
const outPath = resolve(arg('--out') ?? 'echo-batch-01-probe-evidence.json')

function requireTool(name) {
  const result = spawnSync(name, ['-version'], { encoding: 'utf8' })
  if (result.error || result.status !== 0) throw new Error(`${name} is required but unavailable`)
  return (result.stdout || result.stderr || '').split('\n')[0].trim()
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function walk(root) {
  const entries = []
  for (const name of readdirSync(root)) {
    const path = join(root, name)
    const stat = statSync(path)
    if (stat.isDirectory()) entries.push(...walk(path))
    else entries.push(path)
  }
  return entries
}

function parseRate(rate) {
  if (!rate || rate === '0/0') return null
  const [n, d] = rate.split('/').map(Number)
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null
  return n / d
}

function runProbe(path) {
  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-count_frames',
    '-show_streams',
    '-show_format',
    '-of', 'json',
    path,
  ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })

  if (probe.status !== 0) {
    return { probeSucceeded: false, probeError: (probe.stderr || '').trim() }
  }

  const parsed = JSON.parse(probe.stdout)
  const video = (parsed.streams ?? []).find(stream => stream.codec_type === 'video')
  const audioStreams = (parsed.streams ?? []).filter(stream => stream.codec_type === 'audio').length
  const videoStreams = (parsed.streams ?? []).filter(stream => stream.codec_type === 'video').length
  const durationSeconds = Number(video?.duration ?? parsed.format?.duration)
  const frameCount = Number(video?.nb_read_frames ?? video?.nb_frames)
  const fps = parseRate(video?.avg_frame_rate ?? video?.r_frame_rate)
  const tags = { ...(parsed.format?.tags ?? {}), ...(video?.tags ?? {}) }
  const unexpectedMetadataPresent = Object.keys(tags).some(key => !['major_brand','minor_version','compatible_brands','encoder'].includes(key.toLowerCase()))

  const decode = spawnSync('ffmpeg', [
    '-v', 'error',
    '-i', path,
    '-map', '0:v:0',
    '-f', 'null',
    '-',
  ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })

  return {
    probeSucceeded: true,
    container: extname(path).replace('.', '').toLowerCase(),
    videoCodec: video?.codec_name ?? null,
    audioStreams,
    videoStreams,
    width: Number.isFinite(Number(video?.width)) ? Number(video.width) : null,
    height: Number.isFinite(Number(video?.height)) ? Number(video.height) : null,
    durationMs: Number.isFinite(durationSeconds) ? Math.round(durationSeconds * 1000) : null,
    frameCount: Number.isFinite(frameCount) && frameCount > 0 ? frameCount : null,
    nominalFps: Number.isFinite(fps) ? fps : null,
    timestampsMonotonic: null,
    decodeComplete: decode.status === 0,
    decodeError: decode.status === 0 ? null : (decode.stderr || '').trim(),
    unexpectedMetadataPresent,
    corruptionDetected: decode.status !== 0,
  }
}

const ffprobeVersion = requireTool('ffprobe')
const ffmpegVersion = requireTool('ffmpeg')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const candidates = manifest.candidates ?? []
if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('manifest candidates are required')

const files = walk(dir).filter(path => ['.mp4', '.mov', '.m4v'].includes(extname(path).toLowerCase()))
const bySha = new Map(files.map(path => [sha256(path), path]))

const assets = candidates.map(candidate => {
  const expected = String(candidate.derivativeSha256).toLowerCase()
  const matched = bySha.get(expected)
  if (!matched) {
    return {
      assetId: candidate.assetId,
      expectedDerivativeSha256: expected,
      matched: false,
      decision: 'HOLD',
      blockers: ['exact-sha-file-not-found'],
    }
  }

  const probe = runProbe(matched)
  const blockers = []
  if (!probe.probeSucceeded) blockers.push('ffprobe-failed')
  if (!probe.decodeComplete) blockers.push('decode-incomplete')
  if (probe.corruptionDetected) blockers.push('corruption-detected')

  return {
    assetId: candidate.assetId,
    expectedDerivativeSha256: expected,
    observedDerivativeSha256: sha256(matched),
    matched: true,
    fileName: basename(matched),
    byteLength: statSync(matched).size,
    ...probe,
    decision: blockers.length ? 'REJECT' : 'PROBED',
    blockers,
  }
})

const output = {
  schemaVersion: '1.0.0',
  runner: 'clinical-media-probe.mjs',
  generatedAt: new Date().toISOString(),
  sourceDirectory: dir,
  manifestPath,
  tools: { ffprobe: ffprobeVersion, ffmpeg: ffmpegVersion },
  totals: {
    expected: candidates.length,
    matched: assets.filter(asset => asset.matched).length,
    probed: assets.filter(asset => asset.decision === 'PROBED').length,
    rejected: assets.filter(asset => asset.decision === 'REJECT').length,
    held: assets.filter(asset => asset.decision === 'HOLD').length,
  },
  assets,
  boundary: {
    technicallyVerified: false,
    privacyCleared: false,
    clinicalReviewed: false,
    learnerEligible: false,
    note: 'This runner emits machine evidence only. It does not grant governance, privacy, clinical, device-baseline, or learner-ready approval by itself.',
  },
}

writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${outPath}`)
console.log(JSON.stringify(output.totals))
