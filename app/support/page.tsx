import LegalPageBack from '../components/release/LegalPageBack'

export const metadata = {
  title: 'Cliniverse AI Support',
  description: 'Support information for Cliniverse AI users.',
}

export default function SupportPage() {
  return (
    <main style={{minHeight:'100vh',background:'#080c16',color:'#f8fafc',fontFamily:'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'56px 22px 72px'}}>
        <LegalPageBack />
        <div style={{fontSize:12,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#14b8a6'}}>Cliniverse AI · by NeuraOps</div>
        <h1 style={{fontSize:'clamp(34px,6vw,54px)',lineHeight:1.05,letterSpacing:'-.04em',margin:'14px 0 18px'}}>Support</h1>
        <p style={{fontSize:16,lineHeight:1.7,color:'#cbd5e1',margin:'0 0 34px'}}>Need help with Cliniverse AI? Use the support options below for app access, technical issues, account questions, or general product support.</p>

        <section style={{background:'#111827',border:'1px solid rgba(148,163,184,.16)',borderRadius:20,padding:24,marginBottom:16}}>
          <h2 style={{fontSize:20,margin:'0 0 10px'}}>Contact support</h2>
          <p style={{color:'#94a3b8',lineHeight:1.7,margin:'0 0 14px'}}>Email our support team and include your device model, operating system version, and a short description of the issue. Please do not include patient-identifiable or sensitive health information.</p>
          <a href="mailto:support@cliniverseai.com" style={{display:'inline-block',background:'#2563eb',color:'#fff',textDecoration:'none',padding:'12px 16px',borderRadius:12,fontWeight:800}}>support@cliniverseai.com</a>
        </section>

        <section style={{background:'#111827',border:'1px solid rgba(148,163,184,.16)',borderRadius:20,padding:24,marginBottom:16}}>
          <h2 style={{fontSize:20,margin:'0 0 10px'}}>Before contacting us</h2>
          <ul style={{color:'#cbd5e1',lineHeight:1.8,paddingLeft:20,margin:0}}>
            <li>Confirm that your device has an active internet connection.</li>
            <li>Close and reopen the app.</li>
            <li>Make sure you are using the latest available app version.</li>
            <li>If the app does not launch correctly, include a screenshot or screen recording if possible.</li>
          </ul>
        </section>

        <section style={{background:'#111827',border:'1px solid rgba(148,163,184,.16)',borderRadius:20,padding:24}}>
          <h2 style={{fontSize:20,margin:'0 0 10px'}}>Safety and privacy</h2>
          <p style={{color:'#94a3b8',lineHeight:1.7,margin:0}}>Cliniverse AI support channels are not for emergency medical care. Do not submit private patient data, medical records, passwords, API keys, or other sensitive credentials through support email.</p>
        </section>
      </div>
    </main>
  )
}
