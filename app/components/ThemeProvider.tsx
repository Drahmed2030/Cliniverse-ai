'use client'
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('cliniverse-theme') || 'dark'
    const map: Record<string,string> = { light:'light', midnight:'midnight', dark:'' }
    const attr = map[theme] || ''
    if (attr) document.documentElement.setAttribute('data-theme', attr)
    else document.documentElement.removeAttribute('data-theme')
  }, [])
  return <>{children}</>
}
