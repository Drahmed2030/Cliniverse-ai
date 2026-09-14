// Read pinned Git content, never evaluate a legacy React module or call its APIs.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'
import ts from 'typescript'

export const origin = {
  repository: 'https://github.com/Drahmed2030/Cliniverse-ai',
  commit: 'd019f5fccbe0606090a1ab5ee88944c29d268b15',
  path: 'app/components/ClinicalLibrary.tsx',
  blob: '531a63de5a14dd310e8dad89b64431ef8ad2b3cd',
}
const root = fileURLToPath(new URL('../', import.meta.url))
export const hashContent = content => createHash('sha256').update(JSON.stringify(content)).digest('hex')

export function parseCardiology(source) {
  const ast = ts.createSourceFile(origin.path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function literal(node) {
    if (ts.isStringLiteral(node)) return node.text
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal)
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(property => {
      if (!ts.isPropertyAssignment(property) || !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) {
        throw new Error('Unsupported legacy property; manual review required')
      }
      return [property.name.text, literal(property.initializer)]
    }))
    throw new Error('Non-literal legacy content; extraction refused')
  }
  let cardiology
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'CASES' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      const property = node.initializer.properties.find(p => p.name?.getText(ast) === 'cardiology')
      if (property && ts.isPropertyAssignment(property)) cardiology = literal(property.initializer)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  if (!cardiology || cardiology.map(c => c.id).join(',') !== 'c1,c2,c3') throw new Error('Unexpected source case inventory')
  return cardiology
}

export function extractDrafts() {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trimEnd()
  if (git(['rev-parse', `${origin.commit}:${origin.path}`]) !== origin.blob) throw new Error('Source blob mismatch')
  return parseCardiology(git(['show', `${origin.commit}:${origin.path}`])).map(content => ({
    schemaVersion: 1,
    id: `legacy-cardiology-${content.id}`,
    version: 1,
    specialty: 'cardiology',
    status: 'draft',
    provenance: { ...origin, legacyId: content.id, contentSha256: hashContent(content) },
    legacyContent: content,
    learningObjectives: [],
    prerequisites: [],
    decisionPoints: [],
    references: [],
    mediaBindings: [],
    review: {
      status: 'pending', reviewer: null, reviewedAt: null, reviewDueAt: null,
      licenseStatus: 'unverified',
      blockers: [
        'Verify clinical consistency, management, thresholds and quantitative claims against current primary sources.',
        'Define learning objectives, decision points and assessment rubric.',
        'Record clinical reviewer approval for the revised version.',
        'Verify content and image reuse rights; the legacy image URL is not an approved clinical media binding.',
        'Bind only reviewed media that match this scenario; do not pair unrelated ECG and Echo records.',
      ],
    },
  }))
}

export function renderDrafts(drafts) {
  return `// Historical drafts only. Regenerate with node scripts/extract-legacy-cardiology.mjs.\n// No application imports: scientific revision and publication are separate steps.\nimport type { MedicalCaseDraft } from './caseDraft.ts'\n\nexport const cardiologyDrafts = ${JSON.stringify(drafts, null, 2)} satisfies MedicalCaseDraft[]\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('../content/medical/cardiologyDrafts.ts', import.meta.url), renderDrafts(extractDrafts()))
  console.log('Extracted 3 historical cardiology drafts; no APIs called or application routes changed.')
}
