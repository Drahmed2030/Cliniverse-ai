import { notFound } from 'next/navigation'
import { RECOVERY_ASSETS, RECOVERY_SUMMARY } from '../../lib/content/recoveryInventory'
import { CONTENT_NODES, CONTENT_EDGES } from '../../lib/content/contentGraph'
import { CONTENT_COLLECTIONS } from '../../lib/content/contentCollections'
import { CAPABILITY_REGISTRY } from '../../lib/platform/capabilityRegistry'
import { INSTITUTIONAL_COLLECTIONS } from '../../lib/institution/assignmentContract'
import './content-studio.css'

export const dynamic = 'force-dynamic'

export default function ContentStudioPage() {
  const enabled =
    process.env.CLINIVERSE_INTERNAL_STUDIO === '1' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NODE_ENV !== 'production'

  if (!enabled) notFound()

  return (
    <main className="cs-shell">
      <header className="cs-header">
        <div>
          <p className="cs-kicker">NEURAOPS INTELLIGENCE · INTERNAL</p>
          <h1>Cliniverse Content Studio</h1>
          <p className="cs-lead">Recovery, content operations and product recomposition. This surface is not part of the learner product.</p>
        </div>
        <dl className="cs-summary">
          <div><dt>Assets mapped</dt><dd>{RECOVERY_SUMMARY.assets}</dd></div>
          <div><dt>Known structured units</dt><dd>{RECOVERY_SUMMARY.units}</dd></div>
          <div><dt>Recoverable systems</dt><dd>{RECOVERY_SUMMARY.byState.recoverable ?? 0}</dd></div>
          <div><dt>Graph nodes</dt><dd>{CONTENT_NODES.length}</dd></div>
          <div><dt>Connections</dt><dd>{CONTENT_EDGES.length}</dd></div>
          <div><dt>Capabilities</dt><dd>{CAPABILITY_REGISTRY.length}</dd></div>
        </dl>
      </header>

      <section className="cs-pipeline" aria-label="Content operating model">
        {['Source / Legacy', 'Normalize', 'Validate', 'Connect', 'Publish', 'Measure'].map((step, index) => (
          <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>
        ))}
      </section>

      <section>
        <div className="cs-section-head">
          <h2>Collections</h2>
          <p>Cross-modality learning paths built from the same content graph.</p>
        </div>
        <div className="cs-grid">
          {CONTENT_COLLECTIONS.map(collection => (
            <article className="cs-card" key={collection.id}>
              <div className="cs-card-top">
                <span className="cs-layer">{collection.audience}</span>
                <span className="cs-state cs-state-active">{collection.nodeIds.length} units</span>
              </div>
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
              <dl><div><dt>Nodes</dt><dd>{collection.nodeIds.join(' · ')}</dd></div></dl>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="cs-section-head">
          <h2>Institutional collections</h2>
          <p>Cohort-ready paths remain separate from the individual learner surface.</p>
        </div>
        <div className="cs-grid">
          {INSTITUTIONAL_COLLECTIONS.map(collection => (
            <article className="cs-card" key={collection.id}>
              <div className="cs-card-top">
                <span className="cs-layer">institution</span>
                <span className="cs-state cs-state-institutional">cohort-ready</span>
              </div>
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
              <dl>
                <div><dt>Units</dt><dd>{collection.nodeIds.length}</dd></div>
                <div><dt>Assignment boundary</dt><dd>Organization + cohort required</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="cs-section-head">
          <h2>Capability registry</h2>
          <p>One inventory for learner, platform and institutional capabilities.</p>
        </div>
        <div className="cs-grid">
          {CAPABILITY_REGISTRY.map(item => (
            <article className="cs-card" key={item.id}>
              <div className="cs-card-top">
                <span className="cs-layer">{item.layer}</span>
                <span className={'cs-state cs-state-' + (item.state === 'active' ? 'active' : item.state === 'recoverable' ? 'recoverable' : 'institutional')}>{item.state}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.owner === 'neuraops' ? 'NeuraOps core' : 'Cliniverse product'} · {item.surface}</p>
              <dl>
                <div><dt>Dependencies</dt><dd>{item.dependencies.length ? item.dependencies.join(' · ') : 'None'}</dd></div>
                <div><dt>Source</dt><dd><code>{item.sourcePath}</code></dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="cs-section-head">
          <h2>Recovery manifest</h2>
          <p>Old code is treated as source material. Nothing returns unchanged simply because it already exists.</p>
        </div>
        <div className="cs-grid">
          {RECOVERY_ASSETS.map(asset => (
            <article className="cs-card" key={asset.id}>
              <div className="cs-card-top">
                <span className="cs-layer">{asset.layer.replaceAll('-', ' ')}</span>
                <span className={'cs-state cs-state-' + asset.state}>{asset.state}</span>
              </div>
              <h3>{asset.title}</h3>
              {asset.unitCount ? <p className="cs-count">{asset.unitCount} structured unit{asset.unitCount === 1 ? '' : 's'}</p> : null}
              <p>{asset.notes}</p>
              <dl>
                <div><dt>Source</dt><dd><code>{asset.sourcePath}</code></dd></div>
                <div><dt>Presentation</dt><dd>{asset.presentation === 'recompose' ? 'Rebuild in current Cliniverse system' : asset.presentation}</dd></div><div><dt>Recomposition</dt><dd>{asset.nextUse}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
