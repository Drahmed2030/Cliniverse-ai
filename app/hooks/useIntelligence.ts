'use client'
import { useEffect, useCallback } from 'react'

export function useIntelligence(userId: string, specialty: string) {
  
  // تتبع النشاط
  const track = useCallback(async (component: string, action: string, metadata?: any) => {
    try {
      await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track',
          userId,
          specialty,
          data: { component, action, metadata }
        })
      })
    } catch {}
  }, [userId, specialty])

  // جلب توصيات مخصصة
  const getRecommendation = useCallback(async () => {
    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'personalize',
          userId,
          specialty
        })
      })
      return await res.json()
    } catch { return null }
  }, [userId, specialty])

  // بث محتوى جديد
  const broadcast = useCallback(async (type: string, content: any, source: string) => {
    try {
      await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          userId,
          specialty,
          data: { type, content, source }
        })
      })
    } catch {}
  }, [userId, specialty])

  return { track, getRecommendation, broadcast }
}
