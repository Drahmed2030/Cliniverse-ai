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
vm.runInNewContext(code,{exports,require(name){return name.startsWith('./')?{default:()=>null}:require(name)}})
const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)]
test('Me embeds account learning, opens existing Progress and exposes real support routes',()=>{
 let opened=0; const learning={type:'div',props:{'data-test-learning':true}};
 const rendered=nodes(exports.default({learningSummary:learning,onOpenProgress:()=>opened++}));
 assert.ok(rendered.includes(learning));
 const action=rendered.find(n=>n.type==='button'&&n.props.children==='View learning progress →');assert.ok(action);action.props.onClick();assert.equal(opened,1);
 const hrefs=rendered.filter(n=>n.type==='a').map(n=>n.props.href);assert.deepEqual(hrefs,['/support','/privacy','/terms']);
 for(const href of hrefs)assert.ok(fs.existsSync(new URL(`../app${href}/page.tsx`,import.meta.url)));
 assert.equal(rendered.filter(n=>n.type==='details').length,1)
})
