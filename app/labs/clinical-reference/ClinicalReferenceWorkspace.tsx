'use client'

import { ChevronLeft, ChevronRight, ArrowLeft, Search } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CLINICAL_CALCULATOR_REGISTRY,
  findClinicalCalculator,
} from '../../lib/clinicalReference/calculatorRegistry.ts'
import {
  scoreClinicalCalculator,
  type ClinicalCalculatorDefinition,
  type ClinicalCalculatorResult,
} from '../../lib/clinicalReference/calculatorContract.ts'
import {
  GOVERNED_SEED_DRUG_IDENTITIES,
  type DrugIdentity,
} from '../../lib/clinicalReference/drugIdentity.ts'
import {
  findDrugInteractionsAmong,
  type DrugInteractionRule,
  type DrugInteractionSeverity,
} from '../../lib/clinicalReference/drugInteractionRules.ts'
import { findRenalDoseRule } from '../../lib/clinicalReference/renalDosingRules.ts'
import { findGovernedSeedLabelEvidence } from '../../lib/clinicalReference/drugLabelEvidence.ts'
import styles from './clinical-reference.module.css'

type SearchResultKind = 'calculator' | 'drug'

interface SearchResult {
  kind: SearchResultKind
  id: string
  title: string
  subtitle: string
  reviewStatus: 'reviewed' | 'pending_clinical_review'
}

const ALL_RXCUIS = GOVERNED_SEED_DRUG_IDENTITIES.map(identity => identity.rxcui)

function calculatorToResult(definition: ClinicalCalculatorDefinition): SearchResult {
  return { kind: 'calculator', id: definition.calculatorId, title: definition.name, subtitle: definition.clinicalDomain, reviewStatus: definition.reviewStatus }
}

function drugToResult(identity: DrugIdentity): SearchResult {
  return { kind: 'drug', id: identity.rxcui, title: identity.genericName, subtitle: identity.brandNames.length ? identity.brandNames.join(', ') : 'generic', reviewStatus: 'pending_clinical_review' }
}

function matchesQuery(haystacks: string[], query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return haystacks.some(text => text.toLowerCase().includes(normalized))
}

export default function ClinicalReferenceWorkspace() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<{ kind: SearchResultKind; id: string } | null>(null)

  const calculatorResults = useMemo(
    () => CLINICAL_CALCULATOR_REGISTRY.filter(def => matchesQuery([def.name, def.clinicalDomain, def.calculatorId], query)).map(calculatorToResult),
    [query],
  )
  const drugResults = useMemo(
    () => GOVERNED_SEED_DRUG_IDENTITIES.filter(identity => matchesQuery([identity.genericName, ...identity.brandNames], query)).map(drugToResult),
    [query],
  )

  const totalResults = calculatorResults.length + drugResults.length

  if (view?.kind === 'calculator') {
    const definition = findClinicalCalculator(view.id)
    if (definition) return <CalculatorDetail definition={definition} onBack={() => setView(null)} />
  }
  if (view?.kind === 'drug') {
    const identity = GOVERNED_SEED_DRUG_IDENTITIES.find(candidate => candidate.rxcui === view.id)
    if (identity) return <DrugDetail identity={identity} onBack={() => setView(null)} onOpenDrug={id => setView({ kind: 'drug', id })} />
  }

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CLINIVERSE AI · CLINICAL REFERENCE</p>
          <h1>Clinical Reference</h1>
          <p className={styles.subtitle}>Search calculators, drugs, dosing and interactions — every result shows its source and review status.</p>
          <Link className={styles.backLink} href="/">← Back to Cliniverse</Link>
        </header>

        <div className={styles.searchBar}>
          <input
            aria-label="Search clinical reference"
            className={styles.searchInput}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search e.g. 'apixaban', 'AF stroke', 'CURB-65'..."
            type="search"
            value={query}
          />
          <p className={styles.searchHint}><Search aria-hidden="true" size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{totalResults} result{totalResults === 1 ? '' : 's'}</p>
        </div>

        <ResultGroup heading="Calculators" onOpen={id => setView({ kind: 'calculator', id })} results={calculatorResults} />
        <ResultGroup heading="Drugs" onOpen={id => setView({ kind: 'drug', id })} results={drugResults} />

        {totalResults === 0 ? <p className={styles.emptyState}>No results for &quot;{query}&quot;.</p> : null}

        <p className={styles.disclaimer}>Educational reference only — not a substitute for clinical judgment, current local guidelines, or a pharmacist. Not a source of patient-specific prescribing advice.</p>
      </div>
    </main>
  )
}

function ResultGroup({ heading, results, onOpen }: { heading: string; results: SearchResult[]; onOpen: (id: string) => void }) {
  if (!results.length) return null
  return (
    <section className={styles.groupSection} aria-labelledby={`group-${heading}`}>
      <div className={styles.groupHeading}>
        <h2 id={`group-${heading}`}>{heading}</h2>
        <span>{results.length}</span>
      </div>
      <ul className={styles.resultList}>
        {results.map(result => (
          <li key={result.id}>
            <button className={styles.resultRow} onClick={() => onOpen(result.id)} type="button">
              <span>
                <strong>{result.title}</strong>
                <small>{result.subtitle}</small>
              </span>
              <span className={`${styles.resultBadge} ${result.reviewStatus === 'reviewed' ? styles.badgeReviewed : styles.badgePending}`}>
                {result.reviewStatus === 'reviewed' ? 'Reviewed' : 'Pending review'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProvenanceCard({ sourceRefs, reviewStatus, lastReviewed, intendedUse }: {
  sourceRefs: readonly string[]
  reviewStatus: string
  lastReviewed: string
  intendedUse: string
}) {
  return (
    <div className={styles.provenanceCard} aria-label="Source and provenance">
      <div className={styles.provenanceItem}><span>Source</span><strong>{sourceRefs[0]}</strong></div>
      <div className={styles.provenanceItem}><span>Review status</span><strong>{reviewStatus === 'reviewed' ? 'Reviewed' : 'Pending clinical review'}</strong></div>
      <div className={styles.provenanceItem}><span>Last reviewed</span><strong>{lastReviewed}</strong></div>
      <div className={styles.provenanceItem}><span>Intended use</span><strong>{intendedUse}</strong></div>
    </div>
  )
}

function CalculatorDetail({ definition, onBack }: { definition: ClinicalCalculatorDefinition; onBack: () => void }) {
  const [values, setValues] = useState<Record<string, boolean | string>>({})
  const [result, setResult] = useState<ClinicalCalculatorResult | null>(null)

  const isComplete = definition.inputs.every(field => values[field.id] !== undefined)

  function calculate() {
    if (!isComplete) return
    setResult(scoreClinicalCalculator(definition, values))
  }

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <div className={styles.detailShell}>
          <button className={styles.inlineBack} onClick={onBack} type="button">
            <ArrowLeft aria-hidden="true" size={18} /> Back to search
          </button>
          <header className={styles.detailHeader}>
            <p className={styles.eyebrow}>CALCULATOR · v{definition.version}</p>
            <h1>{definition.name}</h1>
            <p>{definition.intendedUse}</p>
          </header>

          <ProvenanceCard intendedUse={definition.intendedUse} lastReviewed={definition.sourceRevision} reviewStatus={definition.reviewStatus} sourceRefs={definition.sourceRefs} />

          {definition.positioningNote ? <div className={styles.positioningNote}>{definition.positioningNote}</div> : null}

          <div className={styles.formCard}>
            {definition.inputs.map(field => (
              <div className={styles.formField} key={field.id}>
                <div className={styles.formFieldLabel}>{field.label}</div>
                {field.type === 'boolean' ? (
                  <div className={styles.toggleRow}>
                    <span />
                    <button
                      aria-pressed={values[field.id] === true}
                      className={`${styles.switch} ${values[field.id] === true ? styles.switchOn : ''}`}
                      onClick={() => setValues(current => ({ ...current, [field.id]: !current[field.id] }))}
                      type="button"
                    >
                      <span className={`${styles.switchKnob} ${values[field.id] === true ? styles.switchOnKnob : ''}`} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.optionGroup} role="radiogroup">
                    {field.options?.map(option => (
                      <button
                        aria-pressed={values[field.id] === option.id}
                        className={`${styles.optionButton} ${values[field.id] === option.id ? styles.optionButtonSelected : ''}`}
                        key={option.id}
                        onClick={() => setValues(current => ({ ...current, [field.id]: option.id }))}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className={styles.calculateAction} disabled={!isComplete} onClick={calculate} type="button">
            Calculate
          </button>

          {result ? (
            <div className={styles.resultCard} role="status" style={{ marginTop: 16 }}>
              <span className={styles.eyebrow}>{result.score} {definition.outputUnit} · {result.band.label}</span>
              <strong>{result.band.riskDescription}</strong>
              <p>{result.band.managementGuidance}</p>
              <ul className={styles.resultSourceList}>
                {result.band.sourceRefs.map(ref => <li key={ref}>{ref}</li>)}
              </ul>
            </div>
          ) : null}

          <p className={styles.disclaimer}>Educational reference only. This score is not a diagnosis, and management guidance here is general reference information, not a patient-specific instruction.</p>
        </div>
      </div>
    </main>
  )
}

const SEVERITY_LABEL: Record<DrugInteractionSeverity, string> = {
  informational: 'Informational',
  caution: 'Caution',
  major: 'Major',
  contraindicated: 'Contraindicated',
}
const SEVERITY_CLASS: Record<DrugInteractionSeverity, string> = {
  informational: 'severityInformational',
  caution: 'severityCaution',
  major: 'severityMajor',
  contraindicated: 'severityContraindicated',
}

function DrugDetail({ identity, onBack, onOpenDrug }: {
  identity: DrugIdentity
  onBack: () => void
  onOpenDrug: (rxcui: string) => void
}) {
  const reducedMotion = useReducedMotion()
  const [relatedIndex, setRelatedIndex] = useState(0)

  const interactions = useMemo(() => findDrugInteractionsAmong(ALL_RXCUIS).filter(rule => rule.drugA === identity.rxcui || rule.drugB === identity.rxcui), [identity.rxcui])
  const doseRule = findRenalDoseRule(identity.rxcui)
  const labelEvidence = findGovernedSeedLabelEvidence(identity.rxcui)

  const related = interactions.map(rule => {
    const otherRxcui = rule.drugA === identity.rxcui ? rule.drugB : rule.drugA
    const otherLabel = rule.drugA === identity.rxcui ? rule.drugBLabel : rule.drugALabel
    return { rule, otherRxcui, otherLabel }
  })

  function moveRelated(delta: 1 | -1) {
    setRelatedIndex(current => Math.max(0, Math.min(related.length - 1, current + delta)))
  }

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <div className={styles.detailShell}>
          <button className={styles.inlineBack} onClick={onBack} type="button">
            <ArrowLeft aria-hidden="true" size={18} /> Back to search
          </button>
          <header className={styles.detailHeader}>
            <p className={styles.eyebrow}>DRUG · RXCUI {identity.rxcui}</p>
            <h1>{identity.genericName}</h1>
            <p>{identity.brandNames.length ? `Brand names: ${identity.brandNames.join(', ')}` : 'No brand name on file for this generic.'}</p>
          </header>

          <ProvenanceCard intendedUse="Educational drug-identity reference" lastReviewed={identity.retrievedAt.slice(0, 10)} reviewStatus="reviewed" sourceRefs={[identity.sourceVersion]} />

          {doseRule ? (
            <section aria-labelledby="dosing-title" className={styles.formCard}>
              <h2 id="dosing-title" style={{ margin: '0 0 10px', fontSize: 15 }}>Reference dosing information</h2>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--ref-muted)' }}>Normal reference dose: {doseRule.normalDoseText}. Renal basis: {doseRule.renalFunctionBasis}.</p>
              <ProvenanceCard intendedUse="Reference dosing information — not a patient-specific prescription" lastReviewed={doseRule.labelRevision} reviewStatus={doseRule.reviewStatus} sourceRefs={doseRule.sourceRefs} />
            </section>
          ) : null}

          {labelEvidence ? (
            <section aria-labelledby="label-title" className={styles.formCard}>
              <h2 id="label-title" style={{ margin: '0 0 10px', fontSize: 15 }}>Label evidence</h2>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--ref-secondary)' }}>{labelEvidence.dosageSection}</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--ref-secondary)' }}>{labelEvidence.renalImpairmentSection}</p>
              <ProvenanceCard intendedUse="Concise, human-authored label summary" lastReviewed={labelEvidence.effectiveDate} reviewStatus={labelEvidence.reviewStatus} sourceRefs={[labelEvidence.sourceUrl]} />
            </section>
          ) : null}

          {related.length ? (
            <section aria-labelledby="related-title">
              <h2 id="related-title" style={{ fontSize: 15, marginBottom: 10 }}>Known interactions ({related.length})</h2>
              <motion.div
                animate={reducedMotion ? undefined : { x: -relatedIndex * 232 }}
                className={styles.relatedRail}
                drag={reducedMotion ? false : 'x'}
                dragConstraints={{ left: -(related.length - 1) * 232, right: 0 }}
                onDragEnd={(_event, info) => {
                  if (info.offset.x < -60) moveRelated(1)
                  else if (info.offset.x > 60) moveRelated(-1)
                }}
              >
                {related.map(({ rule, otherRxcui, otherLabel }) => (
                  <button
                    className={styles.relatedCard}
                    key={rule.interactionId}
                    onClick={() => onOpenDrug(otherRxcui)}
                    style={{ cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left' }}
                    type="button"
                  >
                    <span className={`${styles.severityBadge} ${styles[SEVERITY_CLASS[rule.severity]]}`}>{SEVERITY_LABEL[rule.severity]}</span>
                    <strong>+ {otherLabel}</strong>
                    <span>{rule.clinicalEffect}</span>
                  </button>
                ))}
              </motion.div>
              <div className={styles.relatedNav}>
                <button aria-label="Previous interaction" disabled={relatedIndex === 0} onClick={() => moveRelated(-1)} type="button"><ChevronLeft aria-hidden="true" size={16} /></button>
                <span style={{ fontSize: 11, color: 'var(--ref-muted)' }}>{relatedIndex + 1} / {related.length}</span>
                <button aria-label="Next interaction" disabled={relatedIndex === related.length - 1} onClick={() => moveRelated(1)} type="button"><ChevronRight aria-hidden="true" size={16} /></button>
              </div>
              {related[relatedIndex] ? (
                <div className={styles.resultCard} style={{ marginTop: 12 }}>
                  <strong>{identity.genericName} + {related[relatedIndex].otherLabel}</strong>
                  <p>{related[relatedIndex].rule.mechanism}</p>
                  <p>{related[relatedIndex].rule.managementText}</p>
                  <ul className={styles.resultSourceList}>
                    {related[relatedIndex].rule.sourceRefs.map(ref => <li key={ref}>{ref}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : (
            <p className={styles.emptyState}>No governed interaction rule involves this drug in the current reference set.</p>
          )}

          <p className={styles.disclaimer}>Educational reference only. Always verify with current local guidelines and a pharmacist before any prescribing decision.</p>
        </div>
      </div>
    </main>
  )
}
