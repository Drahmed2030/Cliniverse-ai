export const metadata = {
  title: 'Cliniverse AI Terms',
  description: 'Terms of use for Cliniverse AI.',
}

const sectionStyle = {
  background: '#111827',
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 18,
  padding: 22,
  marginBottom: 14,
}

export default function TermsPage() {
  return (
    <main style={{minHeight:'100vh',background:'#080c16',color:'#f8fafc',fontFamily:'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'56px 22px 72px'}}>
        <div style={{fontSize:12,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#14b8a6'}}>Cliniverse AI · by NeuraOps</div>
        <h1 style={{fontSize:'clamp(34px,6vw,50px)',lineHeight:1.05,letterSpacing:'-.04em',margin:'14px 0 8px'}}>Terms of Use</h1>
        <p style={{fontSize:12,color:'#64748b',margin:'0 0 30px'}}>Last updated: September 2, 2026</p>

        <section style={{...sectionStyle,borderColor:'rgba(20,184,166,.28)',background:'rgba(20,184,166,.07)'}}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Purpose of the current release</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Cliniverse AI provides clinical learning, simulation and workflow-support tools for healthcare professionals. Educational and simulation outputs are not a substitute for independent professional judgment, local policy, supervision, or emergency medical services.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Patient information</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>The current release is not approved as a repository for identifiable patient records or protected health information. Do not enter real patient names, medical record numbers, records, images, or other patient-identifiable information unless a future feature explicitly states that its separate privacy, security and operational controls have been enabled.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Accounts</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>You are responsible for maintaining the security of your account and for information you submit through it. Do not share passwords, authentication links, API keys, or other credentials. Profile information should be accurate and should not be used to falsely represent professional qualifications.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>AI and generated content</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>AI-enabled features can produce incomplete or incorrect outputs. Review relevant clinical sources and apply professional judgment before relying on generated content. Educational ranks, badges and in-product certificates do not represent licensure, board certification, seniority, continuing-medical-education credit, or external accreditation unless Cliniverse AI explicitly identifies a separately verified accreditation.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Acceptable use</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Do not misuse the service, attempt unauthorized access, interfere with security controls, submit unlawful content, impersonate another person, or use the product in a way that creates avoidable risk to patients or other users.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Paid features</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Cliniverse PRO provides expanded fictional Ward cases, Cardiology Operations, QAPAS workflow simulation, Nexus Learning and Related Evidence for supported simulation templates. It is offered through Apple in-app purchase on iOS. The App Store purchase sheet presents the localized price and renewal terms before confirmation. Subscriptions renew automatically unless cancelled through your Apple account before renewal. Apple handles billing, cancellation and refund requests under its terms. A plan label alone does not grant access. Cliniverse activates PRO only after verifying the StoreKit transaction.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Availability and changes</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Features may be improved, restricted, gated or removed as the product evolves, particularly where safety, privacy, platform-review or reliability requirements apply. We may update these terms to reflect material changes to the service.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Support and privacy</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>For product support, use the Support page. For information about data practices, read the Privacy notice.</p>
          <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:14}}>
            <a href="/support" style={{color:'#5eead4',fontWeight:800,textDecoration:'none'}}>Support →</a>
            <a href="/privacy" style={{color:'#5eead4',fontWeight:800,textDecoration:'none'}}>Privacy →</a>
          </div>
        </section>

        <p style={{marginTop:28,fontSize:12,color:'#64748b'}}>Cliniverse AI is a NeuraOps product.</p>
      </div>
    </main>
  )
}
