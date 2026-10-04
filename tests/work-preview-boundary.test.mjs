import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../app/labs/work-preview/page.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
function page(environment) {
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, process: { env: { NODE_ENV: environment, VERCEL_ENV: 'preview' } },
    require: name => name === 'next/navigation' ? { notFound: () => { throw Error('NEXT_NOT_FOUND') } }
      : name === './WorkPreview' ? { default: () => null } : require(name),
  })
  return exports.default
}
test('production, test and unknown environments reject the synthetic route even with VERCEL_ENV preview', () => {
  for (const environment of ['production', 'test', undefined]) assert.throws(page(environment), /NEXT_NOT_FOUND/)
})
test('development can render the synthetic preview boundary', () => {
  assert.ok(page('development')().type)
})
