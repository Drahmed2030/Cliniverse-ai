'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Cliniverse route error', error)
  }, [error])

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: '#080c16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: '#14b8a6', marginBottom: 12 }}>CLINIVERSE AI</div>
        <h1 style={{ fontSize: 24, margin: '0 0 10px' }}>We could not finish loading this screen.</h1>
        <p style={{ margin: '0 0 20px', color: '#94a3b8', lineHeight: 1.6 }}>Your session has not been changed. Try loading the screen again. If the issue continues, use the support page from the App Store listing.</p>
        <button onClick={reset} style={{ width: '100%', border: 0, borderRadius: 14, padding: '13px 16px', fontSize: 15, fontWeight: 800, background: '#2563eb', color: '#fff' }}>Try again</button>
      </div>
    </main>
  )
}
