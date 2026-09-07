'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LegalPageBack() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/')
  }

  return (
    <button
      type="button"
      aria-label="Back to Cliniverse AI"
      onClick={handleBack}
      style={{
        minWidth: 44,
        minHeight: 44,
        marginBottom: 14,
        padding: '8px 12px 8px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 12,
        border: '1px solid rgba(94,234,212,.32)',
        background: 'rgba(20,184,166,.08)',
        color: '#5eead4',
        font: 'inherit',
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      <ChevronLeft size={20} aria-hidden="true" />
      Back to Cliniverse
    </button>
  )
}
