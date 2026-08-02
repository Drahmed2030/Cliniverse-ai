'use client'
import { ClinicalThemeProvider } from './ClinicalTheme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClinicalThemeProvider>
      {children}
    </ClinicalThemeProvider>
  )
}
