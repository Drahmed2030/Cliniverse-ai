import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400','500','600','700','800','900'],
})

export const metadata: Metadata = {
  title: 'Cliniverse AI — Clinical Intelligence',
  description: 'AI-powered medical simulation for healthcare professionals. 500+ clinical cases, SBAR generator, difficult conversations simulator.',
  keywords: ['medical education', 'clinical simulation', 'SBAR', 'NHS', 'USMLE', 'MRCPI'],
  authors: [{ name: 'Cliniverse AI' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cliniverse AI',
  },
  openGraph: {
    title: 'Cliniverse AI — Clinical Intelligence',
    description: 'AI-powered medical simulation for healthcare professionals',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0015',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="theme-color" content="#0a0015"/>
        {/* Register service worker */}
        <script dangerouslySetInnerHTML={{__html:`
          if('serviceWorker' in navigator){
            window.addEventListener('load',()=>{
              navigator.serviceWorker.register('/sw.js').catch(()=>{})
            })
          }
        `}}/>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0015',
        fontFamily: 'var(--font-inter), -apple-system, SF Pro Rounded, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        overscrollBehavior: 'none',
      }}>
        {children}
      </body>
    </html>
  )
}
