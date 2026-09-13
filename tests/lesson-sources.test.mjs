import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {BLS_LESSONS} from '../app/lib/codelab/blsLessons.ts'
import {ACLS_LESSONS} from '../app/lib/codelab/aclsLessons.ts'
import {LESSON_SOURCE_REVIEWS,LESSON_SOURCES,getLessonSourceReview} from '../app/lib/codelab/lessonSources.ts'
test('every lesson has an explicit pending source review tied to exact content',()=>{
 const lessons=[...BLS_LESSONS,...ACLS_LESSONS];assert.equal(Object.keys(LESSON_SOURCE_REVIEWS).length,lessons.length);
 for(const lesson of lessons){const r=getLessonSourceReview(lesson.id);assert.ok(r);assert.equal(r.reviewState,'pending');assert.equal(r.reviewedBy,null);assert.equal(r.reviewedAt,null);assert.equal(r.contentSha256,createHash('sha256').update(JSON.stringify(lesson)).digest('hex'));assert.ok(r.sourceIds.length);for(const id of r.sourceIds)assert.ok(LESSON_SOURCES[id])}
})
test('reference URLs are restricted to verified official guideline pages',()=>{
 for(const s of Object.values(LESSON_SOURCES)){const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.equal(u.hostname,'cpr.heart.org');assert.ok(u.pathname.startsWith('/en/resuscitation-science/cpr-and-ecc-guidelines/'));assert.equal(u.username,'');assert.equal(u.password,'')}
})
test('unknown or prototype lesson IDs never inherit a reference record',()=>{for(const id of ['missing','__proto__','toString'])assert.equal(getLessonSourceReview(id),null)})
