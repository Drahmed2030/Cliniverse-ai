'use client'
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { WorkGateway } from './contracts'
import { createWorkReviewRuntime } from './reviewRuntime'

export function useWorkReview(gateway: WorkGateway) {
  const runtime = useMemo(() => createWorkReviewRuntime(gateway, { available: () => typeof document !== 'undefined' && document.visibilityState === 'visible' && navigator.onLine }), [gateway])
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot)
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void runtime.start()
      else runtime.suspend()
    }
    const hide = () => runtime.suspend()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('online', refresh)
    window.addEventListener('offline', hide)
    window.addEventListener('pagehide', hide)
    window.addEventListener('pageshow', refresh)
    refresh()
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', hide)
      window.removeEventListener('pagehide', hide)
      window.removeEventListener('pageshow', refresh)
      runtime.suspend()
    }
  }, [runtime])
  return { ...snapshot, runtime }
}
