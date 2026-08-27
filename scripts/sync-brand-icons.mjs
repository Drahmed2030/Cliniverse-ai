#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'

const writeMode = process.argv.includes('--write')
const sourcePath = 'assets/logo.svg'
const source = readFileSync(sourcePath, 'utf8').trimEnd()
const root = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'

if (!source.startsWith(root)) {
  console.error(`RC BLOCKED: ${sourcePath} has an unexpected SVG root`)
  process.exit(2)
}

const targets = new Map([
  ['public/icons/icon.svg', source],
  ...[72, 96, 128, 144, 152, 192, 384, 512].map(size => [
    `public/icons/icon-${size}.svg`,
    source.replace(root, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">`),
  ]),
])

const drifted = []
for (const [path, expected] of targets) {
  if (writeMode) writeFileSync(path, `${expected}\n`)
  const actual = readFileSync(path, 'utf8').trimEnd()
  if (actual !== expected) drifted.push(path)
}

if (drifted.length > 0) {
  console.error(`RC BLOCKED: brand icon drift detected: ${drifted.join(', ')}`)
  process.exit(2)
}

console.log(`PASS: ${targets.size} web icon assets derive from ${sourcePath}`)
