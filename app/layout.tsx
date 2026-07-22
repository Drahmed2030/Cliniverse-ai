import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from './components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Cliniverse AI',
  description: 'The clinical companion built by a physician, for physicians worldwide.',
  manifest: '/manifest.json',
  themeColor: '#0a0015',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cliniverse AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
