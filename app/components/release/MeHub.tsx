'use client'

import MeAccountSummary from './MeAccountSummary'
import AppearanceSettings from './AppearanceSettings'
import TopicsIFollow from './TopicsIFollow'
import AccountSessionActions from '../auth/AccountSessionActions'
import DeleteAccountAction from '../auth/DeleteAccountAction'

const links = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Support', href: '/support' },
]

// Me is the account surface: identity, plan, preferences, then account and support. The page title and support
// line live in the shared header, so this surface is labelled by that heading. Layout and control styling lives in
// commercial-visual-system.css under [data-commercial-surface="me"]. Progress owns learning history, so it is not repeated here.
export default function MeHub() {
  return <section aria-labelledby="me-title" data-commercial-surface="me" data-commercial-me-surface>
    <MeAccountSummary />
    <section className="cv-me-group" aria-labelledby="preferences-title">
      <h2 id="preferences-title" className="cv-me-group-title">Preferences</h2>
      <ul className="cv-me-list">
        <li><AppearanceSettings /></li>
        <li><TopicsIFollow /></li>
      </ul>
    </section>
    <section className="cv-me-group" aria-labelledby="support-title">
      <h2 id="support-title" className="cv-me-group-title">Account & support</h2>
      <ul className="cv-me-list">
        {links.map(link => <li key={link.href}>
          <a className="cv-me-row" href={link.href}>
            <span>{link.label}</span>
            <span className="cv-me-row-go" aria-hidden="true">→</span>
          </a>
        </li>)}
        <li><AccountSessionActions /></li>
        <li><DeleteAccountAction /></li>
      </ul>
    </section>
  </section>
}
