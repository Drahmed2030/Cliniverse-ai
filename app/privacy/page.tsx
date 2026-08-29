export const metadata = {
  title: 'Cliniverse AI Privacy',
  description: 'Privacy information for Cliniverse AI users.',
}

const sectionStyle = {
  background: '#111827',
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 18,
  padding: 22,
  marginBottom: 14,
}

export default function PrivacyPolicy() {
  return (
    <main style={{minHeight:'100vh',background:'#080c16',color:'#f8fafc',fontFamily:'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'56px 22px 72px'}}>
        <div style={{fontSize:12,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#14b8a6'}}>Cliniverse AI · by NeuraOps</div>
        <h1 style={{fontSize:'clamp(34px,6vw,50px)',lineHeight:1.05,letterSpacing:'-.04em',margin:'14px 0 8px'}}>Privacy</h1>
        <p style={{fontSize:12,color:'#64748b',margin:'0 0 30px'}}>Last updated: August 26, 2026</p>

        <section style={{...sectionStyle,borderColor:'rgba(20,184,166,.28)',background:'rgba(20,184,166,.07)'}}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Release safety boundary</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Cliniverse AI is designed for clinical learning, simulation and workflow support. The current release is not intended for entering or storing identifiable patient records or protected health information. Please do not submit real patient names, medical record numbers, records, images, or other patient-identifiable information.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Information associated with your account</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>When you use an account in this release, Cliniverse AI processes your sign-in email, account identifier and profile name through its authentication and database providers. Technical request information needed to operate, secure and troubleshoot the service may also be processed for the time required by those providers.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>How information is used</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>We use account information to provide sign-in, preserve your profile, operate requested features, maintain security, diagnose failures, and improve the reliability of the service. We do not treat educational ranks or achievements as professional licensure, board status, or external accreditation.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Service providers and AI features</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>Cliniverse AI uses configured infrastructure providers, including hosting and authentication/database services, to operate the product. When an AI-enabled feature is made available, content submitted to that feature may be processed by the configured AI service needed to provide the requested function. Do not submit patient-identifiable or other highly sensitive information to AI features.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Security and access controls</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>We use application, authentication and database access controls appropriate to the current release and continue to test those controls before broader healthcare-data use. No internet service can guarantee absolute security. Real patient-data workflows will not be enabled unless their separate privacy, security and operational requirements are completed.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Your choices and requests</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>You may contact us to request help with your account or to ask about access, correction or deletion of information associated with your account, subject to applicable requirements. Use the support page for the current contact route.</p>
          <a href="/support" style={{display:'inline-block',marginTop:14,color:'#5eead4',fontWeight:800,textDecoration:'none'}}>Open Support →</a>
        </section>

        <section style={sectionStyle}>
          <h2 style={{fontSize:18,margin:'0 0 8px'}}>Policy changes</h2>
          <p style={{color:'#cbd5e1',lineHeight:1.7,margin:0}}>This notice may be updated as Cliniverse AI features and data practices change. The date above identifies the current version presented with the release.</p>
        </section>

        <p style={{marginTop:28,fontSize:12,color:'#64748b'}}>Cliniverse AI is a NeuraOps product.</p>
      </div>
    </main>
  )
}
