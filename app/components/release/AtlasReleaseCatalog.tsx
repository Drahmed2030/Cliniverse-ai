import Link from 'next/link'
import WardCaseConnections from '../ward/WardCaseConnections'

type ReleaseDestination = 'care' | 'me'

export interface AtlasDestination {
  tab: ReleaseDestination
  workspace?: 'ward' | 'cardiology' | 'nexus' | 'codelab'
}

interface Props {
  onNavigate: (destination: AtlasDestination) => void
  caseLibraryPreview?: boolean
}

// Explore is curated discovery: four destinations that do not compete with the core learning journey.
// Learn owns practice entry (ECG, Echo, Ward), Me owns account and plan actions, and Code Lab and Nexus stay
// reachable inside the Learn workspaces. Their routes and engines are untouched; they are just not listed here.
//
// Each status is a claim about real state and is checked against the content catalog by
// tests/explore-curated-discovery.test.mjs, so a row cannot say "Available" for content the catalog holds:
//   Clinical Reference  Available  the RxNorm and DailyMed lookups are ready; calculators, dosing and interactions
//                                  are review_required and the workspace itself hides them
//   Cardiology Operations  PRO     catalog tier is pro, and the Learn workspace switcher enforces the plan
//   Resuscitation  In review       the scenarios and drills are review_required; the hub disables them
//   Pathway Replay  Available      every visible row is ready, and the replay is fictional
const DESTINATIONS = [
  {
    id: 'reference',
    title: 'Clinical Reference',
    status: 'Available',
    description: 'Source-linked drug and label lookups. Calculators, dosing and interactions appear as they clear clinical review.',
    href: '/labs/clinical-reference',
    destination: null,
  },
  {
    id: 'cardiology',
    title: 'Cardiology Operations',
    status: 'PRO',
    description: 'Structured learning workspace for pathways, tasks and handover.',
    href: null,
    destination: { tab: 'care', workspace: 'cardiology' },
  },
  {
    id: 'resuscitation',
    title: 'Resuscitation',
    status: 'In review',
    description: 'Curriculum and simulations as reviewed content becomes available.',
    href: '/labs/resuscitation-hub',
    destination: null,
  },
  {
    id: 'pathway',
    title: 'Pathway Replay',
    status: 'Available',
    description: 'Replay a fictional clinical pathway and inspect the decisions that shaped it.',
    href: '/labs/pathway-replay',
    destination: null,
  },
] as const

// Layout and control styling lives in commercial-visual-system.css under [data-commercial-surface="explore"].
// The page title and support line live in the shared header, so this surface is labelled by that heading.
export default function AtlasReleaseCatalog({ onNavigate, caseLibraryPreview = false }: Props) {
  return (
    <section aria-labelledby="explore-title" data-commercial-surface="explore" data-commercial-explore-surface>
      {caseLibraryPreview && <WardCaseConnections context="atlas" />}
      <ul className="cv-explore-list" aria-label="Explore destinations">
        {DESTINATIONS.map(item => {
          const body = (
            <>
              <span>
                <span className="cv-explore-row-head">
                  <span className="cv-explore-row-title">{item.title}</span>
                  <span className="cv-explore-row-status">{item.status}</span>
                </span>
                <span className="cv-explore-row-text">{item.description}</span>
              </span>
              <span className="cv-explore-row-go" aria-hidden="true">→</span>
            </>
          )
          const destination = item.destination
          return (
            <li key={item.id}>
              {item.href
                ? <Link className="cv-explore-row" href={item.href}>{body}</Link>
                : destination && <button type="button" className="cv-explore-row" onClick={() => onNavigate(destination)}>{body}</button>}
            </li>
          )
        })}
      </ul>
      <p className="cv-explore-boundary">Designed for learning and simulation. Not for diagnosis, prescribing or managing real patient care.</p>
    </section>
  )
}
