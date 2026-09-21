import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require=createRequire(import.meta.url)
const source=fs.readFileSync(new URL('../app/components/release/MeHub.tsx',import.meta.url),'utf8')
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText
const exports={}
// Every relative import is a marker component, so the render shows exactly what MeHub composes.
vm.runInNewContext(code,{exports,require(name){return name.startsWith('.')?{default:Object.assign(()=>null,{displayName:name.split('/').pop()})}:require(name)}})
const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)]
test('Me composes identity/plan, preferences, real support routes and the one existing sign-out action, in that order',()=>{
 const rendered=nodes(exports.default());
 const composed=rendered.filter(n=>typeof n.type==='function').map(n=>n.type.displayName);
 assert.deepEqual(composed,['MeAccountSummary','AppearanceSettings','TopicsIFollow','AccountSessionActions']);
 const rows=rendered.filter(n=>n.type==='a');
 assert.deepEqual(rows.map(n=>n.props.href),['/privacy','/terms','/support']);
 for(const href of rows.map(n=>n.props.href))assert.ok(fs.existsSync(new URL(`../app${href}/page.tsx`,import.meta.url)));
 // The section is labelled by the shared header's heading and owns no heading of its own called "Me".
 const section=rendered.find(n=>n.type==='section');assert.equal(section.props['aria-labelledby'],'me-title');assert.equal(section.props['data-commercial-surface'],'me')
 assert.equal(rendered.some(n=>n.type==='h1'),false)
})
test('Me no longer embeds saved learning, a Progress shortcut or a Connections & devices block',()=>{
 assert.equal(exports.default.length,0)
 const rendered=nodes(exports.default());
 assert.equal(rendered.some(n=>n.type==='button'||n.type==='details'),false)
 assert.doesNotMatch(source,/learningSummary|onOpenProgress|View learning progress|Connections|Apple Health|Apple Watch|NeuraOps/)
})
