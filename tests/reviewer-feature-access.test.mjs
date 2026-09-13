import test from 'node:test'
import assert from 'node:assert/strict'
import { reviewerFeatureAccess } from '../app/lib/reviewerFeatureAccess.ts'
const user = { id: 'a14514a7-620b-4add-adee-9583935438fd', email: 'reviewer@cliniverseai.com', email_confirmed_at: '2026-09-13' }
test('only the confirmed pinned review account receives review access in release environments', () => {
 assert.equal(reviewerFeatureAccess('preview',user),true)
 assert.equal(reviewerFeatureAccess('production',user),true)
 for (const env of ['development',undefined]) assert.equal(reviewerFeatureAccess(env,user),false)
 for (const other of [null,{...user,id:'other'},{...user,email:'other@example.com'},{...user,email_confirmed_at:undefined}]) { for (const env of ['preview','production']) assert.ok(!reviewerFeatureAccess(env,other)) }
})
