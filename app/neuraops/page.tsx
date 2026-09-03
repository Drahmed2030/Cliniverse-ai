import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleGauge,
  Globe2,
  LockKeyhole,
  Network,
  ShieldCheck,
} from 'lucide-react'
import { MEDICAL_OPERATIONS_REGISTRY, summarizeEvidenceRegistry } from '../lib/evidence/medicalOperationsRegistry'
import AudienceNavigator from './AudienceNavigator'
import styles from './neuraops.module.css'

export const metadata: Metadata = {
  title: 'NeuraOps · Governed Intelligence for Clinical Operations',
  description: 'The operating company behind Cliniverse AI, connecting governed agents, pathway replay, traceable evidence and targeted learning.',
  alternates: { canonical: '/neuraops' },
  openGraph: {
    title: 'NeuraOps · Intelligence in Motion',
    description: 'The governed operating layer behind Cliniverse AI.',
    type: 'website',
  },
}

const evidenceSummary = summarizeEvidenceRegistry()

export default function NeuraOpsPage() {
  return (
    <main className={styles.shell}>
      <nav className={styles.nav} aria-label="NeuraOps company navigation">
        <Link className={styles.brand} href="/neuraops" aria-label="NeuraOps company home">
          <span className={styles.mark} aria-hidden="true">N</span>
          <span><strong>NeuraOps</strong><small>INTELLIGENCE IN MOTION</small></span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#two-sparks">Platform</a>
          <a href="#evidence">Evidence</a>
          <Link className={styles.navCta} href="/labs/pathway-replay">Open live prototype</Link>
        </div>
      </nav>

      <section className={styles.hero} aria-labelledby="company-title">
        <div className={styles.heroCopy}>
          <div className={styles.signal}><span aria-hidden="true" />Future company lane · Isolated from the Apple release</div>
          <p className={styles.eyebrow}>NEURAOPS ENTERPRISE INTELLIGENCE</p>
          <h1 id="company-title">Turn complex clinical operations into <em>explainable systems.</em></h1>
          <p className={styles.heroText}>
            NeuraOps is the governed operating company. Cliniverse AI is its first healthcare product — turning pathway events, timing, evidence and training needs into one accountable improvement loop.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/labs/pathway-replay">Experience Pathway Replay <ArrowRight aria-hidden="true" size={18} /></Link>
            <a className={styles.secondaryCta} href="#evidence">Inspect the evidence model</a>
          </div>
          <ul className={styles.boundaries} aria-label="Product boundaries">
            <li><ShieldCheck aria-hidden="true" size={16} />Human authority</li>
            <li><LockKeyhole aria-hidden="true" size={16} />Synthetic prototype</li>
            <li><BookOpenCheck aria-hidden="true" size={16} />Source traceability</li>
          </ul>
        </div>

        <div className={styles.heroVisual} aria-label="Illustration of a governed pathway improvement loop">
          <div className={styles.visualTop}><span>STEMI PATHWAY · FICTIONAL</span><strong>Review required</strong></div>
          <div className={styles.metricRow}>
            <div><small>DOOR → ECG</small><strong>12 min</strong><span>Target ≤ 10</span></div>
            <div><small>EVIDENCE</small><strong>86%</strong><span>1 gap open</span></div>
          </div>
          <div className={styles.pathRail}>
            {['Arrival', 'ECG', 'Activation', 'Cath Lab'].map((label, index) => (
              <div key={label}><span className={index === 1 ? styles.railWarning : undefined}>{index + 1}</span><strong>{label}</strong><small>{index === 1 ? '+2 min' : 'Recorded'}</small></div>
            ))}
          </div>
          <div className={styles.agentStrip}>
            <BrainCircuit aria-hidden="true" size={18} />
            <span>6 governed agents</span>
            <strong>Closure blocked pending review</strong>
          </div>
        </div>
      </section>

      <section className={styles.proofBar} aria-label="Prototype proof">
        <div><strong>1</strong><span>governed operating company</span></div>
        <div><strong>1</strong><span>healthcare product</span></div>
        <div><strong>6</strong><span>bounded agents</span></div>
        <div><strong>0</strong><span>autonomous clinical decisions</span></div>
      </section>

      <AudienceNavigator />

      <section className={styles.sparks} id="two-sparks" aria-labelledby="sparks-title">
        <div className={styles.sectionLead}>
          <p className={styles.eyebrow}>THE TWO-SPARK STRATEGY</p>
          <h2 id="sparks-title">One product demonstrates value. The second makes it defensible.</h2>
          <p>They share one operating contract: source → event → metric → gap → learning → human closure.</p>
        </div>
        <div className={styles.sparkGrid}>
          <article className={styles.sparkPrimary}>
            <div className={styles.sparkNumber}>01</div>
            <Activity aria-hidden="true" size={26} />
            <p className={styles.eyebrow}>EXPERIENCE SPARK</p>
            <h3>Clinical Pathway Replay</h3>
            <p>Reconstructs a fictional pathway, exposes the measurable gap, identifies accountable review, and opens targeted training.</p>
            <ul>
              <li><CheckCircle2 aria-hidden="true" size={16} />Working responsive prototype</li>
              <li><CheckCircle2 aria-hidden="true" size={16} />Deterministic and network-free</li>
              <li><CheckCircle2 aria-hidden="true" size={16} />Human closure gate</li>
            </ul>
            <Link href="/labs/pathway-replay">Open the prototype <ArrowRight aria-hidden="true" size={16} /></Link>
          </article>
          <article className={styles.sparkSecondary}>
            <div className={styles.sparkNumber}>02</div>
            <Network aria-hidden="true" size={26} />
            <p className={styles.eyebrow}>TRUST SPARK</p>
            <h3>Medical Operations Registry</h3>
            <p>Transforms preserved guidelines and standards into versioned, regional and pathway-linked source records.</p>
            <ul>
              <li><CheckCircle2 aria-hidden="true" size={16} />Source and version lineage</li>
              <li><CheckCircle2 aria-hidden="true" size={16} />Global, Gulf and EU context</li>
              <li><CheckCircle2 aria-hidden="true" size={16} />Review boundary on every record</li>
            </ul>
            <a href="#evidence">Inspect the registry <ArrowRight aria-hidden="true" size={16} /></a>
          </article>
        </div>
      </section>

      <section className={styles.evidence} id="evidence" aria-labelledby="evidence-title">
        <div className={styles.evidenceHeading}>
          <div className={styles.sectionLead}>
            <p className={styles.eyebrow}>MEDICAL OPERATIONS REGISTRY · V1</p>
            <h2 id="evidence-title">A governed library, not an untraceable answer engine.</h2>
            <p>Each entry says what it can inform, which future pathway it may support, and where human review remains mandatory.</p>
          </div>
          <div className={styles.registrySummary} aria-label="Registry summary">
            <div><strong>{evidenceSummary.sources}</strong><span>source records</span></div>
            <div><strong>{evidenceSummary.regions}</strong><span>regional layers</span></div>
            <div><strong>{evidenceSummary.linkedPathways}</strong><span>future mappings</span></div>
          </div>
        </div>
        <div className={styles.registryGrid}>
          {MEDICAL_OPERATIONS_REGISTRY.map(source => (
            <article className={styles.sourceCard} key={source.id}>
              <div className={styles.sourceMeta}>
                <span>{source.region}</span><span>{source.use.replace('-', ' ')}</span>
              </div>
              <h3>{source.title}</h3>
              <p className={styles.publisher}>{source.publisher} · {source.versionLabel}</p>
              <p>{source.operationalRole}</p>
              <div className={styles.reviewBoundary}><ShieldCheck aria-hidden="true" size={16} /><span>{source.reviewBoundary}</span></div>
              <a href={source.sourceUrl} target="_blank" rel="noreferrer">View primary source <ArrowRight aria-hidden="true" size={15} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.operatingModel} aria-labelledby="model-title">
        <div>
          <p className={styles.eyebrow}>NEURAOPS OPERATING LAYER</p>
          <h2 id="model-title">The company creates intelligence without pretending to practise medicine.</h2>
        </div>
        <ol>
          <li><CircleGauge aria-hidden="true" /><span><strong>Measure</strong>Configured operational events and KPIs</span></li>
          <li><BrainCircuit aria-hidden="true" /><span><strong>Explain</strong>Traceable draft gap attribution</span></li>
          <li><BookOpenCheck aria-hidden="true" /><span><strong>Improve</strong>Targeted simulation and education</span></li>
          <li><ShieldCheck aria-hidden="true" /><span><strong>Govern</strong>Human review and evidence closure</span></li>
        </ol>
      </section>

      <section className={styles.mediaSystem} aria-labelledby="media-title">
        <div className={styles.sectionLead}>
          <p className={styles.eyebrow}>MEDIA &amp; ADOPTION SYSTEM</p>
          <h2 id="media-title">One verified product story, adapted to three attention spans.</h2>
          <p>The media layer repeats the same bounded truth. It does not invent customers, outcomes, validation or clinical authority.</p>
        </div>
        <div className={styles.mediaGrid}>
          <article>
            <span>30 SEC</span>
            <h3>The signal</h3>
            <p>One fictional pathway. One visible delay. One accountable human next step.</p>
            <strong>Short-form awareness</strong>
          </article>
          <article>
            <span>90 SEC</span>
            <h3>The working loop</h3>
            <p>Walk through event integrity, KPI computation, gap explanation and targeted training.</p>
            <strong>Product understanding</strong>
          </article>
          <article>
            <span>5 MIN</span>
            <h3>The evidence brief</h3>
            <p>Show sources, version control, review boundaries, pilot question and measurable success gate.</p>
            <strong>Institutional diligence</strong>
          </article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <Globe2 aria-hidden="true" size={32} />
        <p className={styles.eyebrow}>BUILT FOR GLOBAL EVALUATION · GROUNDED IN CLINICAL REALITY</p>
        <h2>Evaluate the loop before we scale the platform.</h2>
        <p>The next milestone is not more features. It is a controlled institutional discovery session around one pathway, one team and one measurable operational question.</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryCta} href="/labs/pathway-replay">Review the working prototype</Link>
          <Link className={styles.secondaryCta} href="/">Return to Cliniverse</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>NeuraOps · Intelligence in Motion · Cliniverse AI is a NeuraOps product</span>
        <span>Illustrative and unvalidated · Human judgment leads</span>
      </footer>
    </main>
  )
}
