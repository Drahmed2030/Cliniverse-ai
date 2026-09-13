import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const code = ts.transpileModule(fs.readFileSync(new URL('../app/components/release/AppearanceSettings.tsx', import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText
function app(stored = null, blocked = false) {
  const events = new EventTarget(), exports = {}; let observer, notices = 0
  const storage = {getItem(){ if(blocked) throw Error('blocked'); return stored },setItem(k,v){ if(blocked) throw Error('blocked'); stored=v }}
  vm.runInNewContext(code,{exports,Event,window:events,localStorage:storage,require(name){return name==='react'?{useSyncExternalStore(sub,get,server){observer={sub,get,server};return get()}}:require(name)}})
  function nodes(n){return !n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)]}
  function choose(label){nodes(exports.default()).find(n=>n.type==='button'&&n.props.children===label).props.onClick()}
  exports.useAppearance();const cleanup=observer.sub(()=>notices++)
  return {choose,value:()=>exports.useAppearance(),server:()=>observer.server(),stored:()=>stored,notices:()=>notices,cleanup,external(value){stored=value;const e=new Event('storage');e.key='cliniverse.appearance.v1';events.dispatchEvent(e)}}
}
test('appearance persists a choice, restores it on a fresh mount and follows cross-tab changes',()=>{
 const a=app();assert.equal(a.value(),'system');assert.equal(a.server(),'system');a.choose('Dark');assert.equal(a.value(),'dark');assert.equal(a.stored(),'dark');assert.equal(a.notices(),1);assert.equal(app(a.stored()).value(),'dark');a.external('light');assert.equal(a.value(),'light');a.choose('System');assert.equal(a.value(),'system');a.cleanup()
})
test('invalid stored appearance falls back to system',()=>{assert.equal(app('unexpected').value(),'system')})
test('blocked storage still allows a session choice',()=>{const a=app(null,true);a.choose('Dark');assert.equal(a.value(),'dark');assert.equal(a.stored(),null)})
