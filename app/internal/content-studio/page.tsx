import { notFound } from 'next/navigation'
import { RECOVERY_ASSETS, RECOVERY_SUMMARY } from '../../lib/content/recoveryInventory'
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
        </dl>
      </header>

      <section className="cs-pipeline" aria-label="Content operating model">
        {['Source / Legacy', 'Normalize', 'Validate', 'Connect', 'Publish', 'Measure'].map((step, index) => (
          <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>
        ))}
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
