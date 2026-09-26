import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CONTINUITY_LAB_V1_BOUNDARY,
  CONTINUITY_STAGE_ORDER,
  validateContinuityLabCase,
} from '../app/lib/continuity/continuityLab.ts'
import {
  INSTITUTION_MODE_BOUNDARY,
  institutionConfigurationStatus,
} from '../app/lib/institution/institutionConfiguration.ts'
import {
  HEALTH_CLOUD_LEARNING_BOUNDARY,
  isSafeHealthCloudLearningConfiguration,
  resolveHealthCloudLearningAccess,
} from '../app/lib/integrations/healthCloudLearningBoundary.ts'

test('continuity lab preserves the full reasoning sequence', () => {
  assert.deepEqual(CONTINUITY_STAGE_ORDER, [
    'observe',
    'interpret',
    'decide',
    'change',
    'reconcile',
    'communicate',
    'close',
    'remember',
  ])
  assert.equal(CONTINUITY_LAB_V1_BOUNDARY.livePhi, false)
  assert.equal(CONTINUITY_LAB_V1_BOUNDARY.directHospitalConnection, false)
})

test('learner exposure fails closed when changed evidence is not learner ready', () => {
  const result = validateContinuityLabCase({
    id: 'continuity-001',
    title: 'Corrected echo context after ECG decision',
    stages: CONTINUITY_STAGE_ORDER,
    evidence: [
      {
        id: 'ecg-1',
        kind: 'ecg',
        label: 'Initial ECG',
        authority: 'cliniverse-governed',
        version: '1',
        learningReady: true,
      },
      {
        id: 'echo-2',
        kind: 'echo',
        label: 'Updated echo report',
        authority: 'health-cloud-context',
        version: '2',
        learningReady: false,
        sourceRef: 'institution-source-context',
      },
    ],
    change: {
      beforeEvidenceId: 'ecg-1',
      afterEvidenceId: 'echo-2',
      changeKind: 'new-evidence',
      learnerPrompt: 'What changed your interpretation?',
    },
    institutionEligible: true,
    learnerExposure: 'learner',
  })

  assert.equal(result.valid, false)
  assert.ok(
    result.issues.includes('learner-exposure-requires-learning-ready-evidence'),
  )
})

test('institution mode stays disabled until explicit organization configuration exists', () => {
  assert.equal(institutionConfigurationStatus().state, 'disabled')
  assert.equal(INSTITUTION_MODE_BOUNDARY.defaultState, 'disabled')

  const ready = institutionConfigurationStatus({
    organizationId: 'org-demo',
    cohortId: 'cohort-a',
    assignmentSource: 'institution-service',
    collectionId: 'resident-onboarding',
    completionReceipt: 'event',
  })

  assert.equal(ready.state, 'ready')
  assert.equal(ready.organizationId, 'org-demo')
  assert.equal(ready.collectionId, 'resident-onboarding')
})

test('health cloud diagnostic access is deferred by default, never invented', () => {
  assert.deepEqual(resolveHealthCloudLearningAccess('labs'), {
    state: 'deferred',
    domain: 'labs',
    reason: 'health-cloud-configuration-required',
  })
  assert.equal(
    HEALTH_CLOUD_LEARNING_BOUNDARY.directHospitalApiInCliniverseFoundation,
    false,
  )
})

test('health cloud configuration rejects credential-like or endpoint expansion', () => {
  assert.equal(
    isSafeHealthCloudLearningConfiguration({
      provider: 'health-cloud',
      institutionId: 'org-demo',
      tenantContextId: 'tenant-demo',
      endpoint: 'https://hospital.example',
      token: 'secret',
      domains: {},
    }),
    false,
  )
})

test('configured diagnostic domain resolves only through health cloud capability id', () => {
  const config = {
    provider: 'health-cloud',
    institutionId: 'org-demo',
    tenantContextId: 'tenant-demo',
    domains: {
      'echo-report': {
        enabled: true,
        capabilityId: 'diagnostics.echo.report-context.v1',
      },
    },
  }

  assert.equal(isSafeHealthCloudLearningConfiguration(config), true)

  assert.deepEqual(resolveHealthCloudLearningAccess('echo-report', config), {
    state: 'configured',
    domain: 'echo-report',
    provider: 'health-cloud',
    capabilityId: 'diagnostics.echo.report-context.v1',
    institutionId: 'org-demo',
    tenantContextId: 'tenant-demo',
  })

  assert.deepEqual(resolveHealthCloudLearningAccess('labs', config), {
    state: 'unavailable',
    domain: 'labs',
    reason: 'domain-not-configured',
  })
})
