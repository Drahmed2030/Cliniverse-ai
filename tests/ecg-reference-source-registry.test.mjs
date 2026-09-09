import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_REFERENCE_SOURCES,
  canIngestEcgSourceIntoCommercialContent,
  getCommerciallyIngestibleEcgSources,
  getReferenceOnlyEcgSources,
} from '../app/lib/clinicalIntelligence/ecgReferenceSourceRegistry.ts'

test('PTB-XL remains the only currently ingestion-eligible commercial ECG source', () => {
  const ingestible = getCommerciallyIngestibleEcgSources()
  assert.deepEqual(ingestible.map(source => source.id), ['physionet-ptb-xl-v1.0.3'])
  assert.equal(canIngestEcgSourceIntoCommercialContent('physionet-ptb-xl-v1.0.3'), true)
})

test('ECGpedia is reference-only because its standard license is non-commercial', () => {
  const source = ECG_REFERENCE_SOURCES.find(item => item.id === 'ecgpedia-de-voogt-archive')
  assert.ok(source)
  assert.equal(source.useMode, 'REFERENCE_ONLY')
  assert.equal(source.commercialIngestionAllowed, false)
  assert.equal(canIngestEcgSourceIntoCommercialContent(source.id), false)
})

test('LITFL and Wave-Maven cannot silently become commercial content sources', () => {
  assert.equal(canIngestEcgSourceIntoCommercialContent('litfl-ecg-library'), false)
  assert.equal(canIngestEcgSourceIntoCommercialContent('bidmc-ecg-wave-maven'), false)
})

test('reference-only registry contains multiple independent reviewer sources', () => {
  const sources = getReferenceOnlyEcgSources()
  assert.ok(sources.length >= 3)
})
