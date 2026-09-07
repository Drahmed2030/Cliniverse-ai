import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LOCAL_DCM_REVIEW, localDcmReviewAllowed } from '../app/lib/clinicalMedia/localDcmReview.ts'
import { GET } from '../app/api/local-echo-review/route.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../app/lib/clinicalMedia/licensedEchoAsset.ts'

test('DCM has a separate development-only endpoint and no learner authority', () => {
  assert.notEqual(LOCAL_DCM_REVIEW.mediaUrl, A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.mediaPath)
  assert.notEqual(LOCAL_DCM_REVIEW.sha256, A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256)
  assert.equal(LOCAL_DCM_REVIEW.learnerReady, false)
  assert.equal(LOCAL_DCM_REVIEW.assessmentsEnabled, false)
  assert.equal(LOCAL_DCM_REVIEW.persistenceEnabled, false)
  assert.equal(localDcmReviewAllowed('development', LOCAL_DCM_REVIEW.sha256), true)
  for (const mode of ['production', 'test', undefined]) assert.equal(localDcmReviewAllowed(mode, LOCAL_DCM_REVIEW.sha256), false)
  assert.equal(localDcmReviewAllowed('development', '0'.repeat(64)), false)
})

test('Studio excludes navigation, lesson/scoring and summary from DCM mode', () => {
  const source=readFileSync(new URL('../app/components/clinical-media/ClinicalMediaPreview.tsx', import.meta.url),'utf8')
  assert.match(source, /!dcmReview&&program==='echo-a4c-normal'\?<EchoStudyNavigation/)
  assert.match(source, /!dcmReview&&program==='echo-a4c-normal'\?<>\s*<EchoA4cLesson/)
  assert.match(source, /dcmReview&&dcmStatus!=='ready'/)
  assert.equal((source.match(/<Player /g)||[]).length,1)
})

test('media endpoint fails closed for production, missing and altered derivatives', async () => {
  const originalMode=process.env.NODE_ENV
  const originalPath=process.env.CLINIVERSE_LOCAL_DCM_FILE
  const dir=mkdtempSync(join(tmpdir(),'dcm-local-review-'))
  const request=new Request('http://localhost/api/local-echo-review')
  try {
    process.env.NODE_ENV='production'
    assert.equal((await GET(request)).status,404)
    process.env.NODE_ENV='development'
    delete process.env.CLINIVERSE_LOCAL_DCM_FILE
    assert.equal((await GET(request)).status,404)
    process.env.CLINIVERSE_LOCAL_DCM_FILE=join(dir,'missing.mp4')
    assert.equal((await GET(request)).status,404)
    writeFileSync(process.env.CLINIVERSE_LOCAL_DCM_FILE,'mismatched bytes')
    const rejected=await GET(request)
    assert.equal(rejected.status,409)
    assert.equal(rejected.headers.get('cache-control'),'no-store')
    assert.equal((await GET(new Request(request,{headers:{range:'bytes=0-1'}}))).status,409)
  } finally {
    if(originalMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=originalMode
    if(originalPath===undefined)delete process.env.CLINIVERSE_LOCAL_DCM_FILE;else process.env.CLINIVERSE_LOCAL_DCM_FILE=originalPath
    rmSync(dir,{recursive:true,force:true})
  }
})
