export default function Loading() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#080c16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, margin: '0 auto 14px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', fontWeight: 900 }}>N</div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>Starting Cliniverse AI</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Healthcare Intelligence by NeuraOps</div>
      </div>
    </main>
  )
}
