{activeTab === 'profile' && (
        <div>
          <div style={{ padding: '8px 20px 16px' }}><div style={s.title}>Profile</div></div>
          <div style={{ background: '#fff', borderRadius: 22, margin: '0 20px 16px', padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#007AFF,#AF52DE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#fff', fontWeight: 700 }}>A</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Dr. Ahmed Osman</div>
              <div style={{ fontSize: 13, color: '#007AFF', fontWeight: 600 }}>Senior Resident</div>
              <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>Cardiac Specialist · KSA</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '0.5px solid rgba(60,60,67,0.29)', display: 'flex', padding: '8px 0 24px', zIndex: 200 }}>
        {[['home','Home'],['departments','Depts'],['tools','Tools'],['profile','Profile']].map(([id,label])=>(
          <div key={id} onClick={()=>setActiveTab(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '6px 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: activeTab===id ? '#007AFF' : '#E5E5EA' }} />
            <span style={{ fontSize: 10, fontWeight: 500, color: activeTab===id ? '#007AFF' : 'rgba(60,60,67,0.6)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
