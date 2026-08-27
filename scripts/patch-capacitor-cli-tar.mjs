import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const cliRoot = join(process.cwd(), 'node_modules', '@capacitor', 'cli')
const packagePath = join(cliRoot, 'package.json')
const targetPath = join(cliRoot, 'dist', 'util', 'template.js')

if (!existsSync(packagePath) || !existsSync(targetPath)) {
  console.log('Capacitor CLI is not installed; fixed-tar compatibility patch not required.')
  process.exit(0)
}

const cliPackage = JSON.parse(readFileSync(packagePath, 'utf8'))
if (cliPackage.version !== '6.2.1') {
  throw new Error(`Refusing to patch unexpected @capacitor/cli version ${cliPackage.version}`)
}

const source = readFileSync(targetPath, 'utf8')
const originalImport = 'const tar_1 = tslib_1.__importDefault(require("tar"));'
const patchedImport = 'const tar_1 = require("tar");'
const originalCall = 'await tar_1.default.extract({ file: src, cwd: dir });'
const patchedCall = 'await tar_1.extract({ file: src, cwd: dir });'

if (source.includes(patchedImport) && source.includes(patchedCall)) {
  console.log('PASS: Capacitor CLI fixed-tar compatibility patch already applied.')
  process.exit(0)
}

if (!source.includes(originalImport) || !source.includes(originalCall)) {
  throw new Error('Refusing to patch unexpected Capacitor template extractor source')
}

const patched = source
  .replace(originalImport, patchedImport)
  .replace(originalCall, patchedCall)

writeFileSync(targetPath, patched)
console.log('PASS: Capacitor CLI 6.2.1 is compatible with patched tar 7.x.')
