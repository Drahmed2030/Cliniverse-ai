import type { Metadata, Viewport } from "next"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"

export const viewport: Viewport = {
  themeColor: "#1e3d52",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Cliniverse AI — Train Like a Consultant",
  description: "AI-powered clinical training platform. 25+ cases, Dynamic MCQ, Surgical AI. Built by a doctor, for doctors.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cliniverse AI",
    startupImage: [
      { url: "/icons/icon-512.svg", media: "(device-width: 390px)" },
    ],
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.svg",
    shortcut: "/icons/icon.svg",
  },
  openGraph: {
    title: "Cliniverse AI — Train Like a Consultant",
    description: "Join 1,000+ physicians. AI-powered clinical cases, Rapid Fire, Surgical protocols. Free to start.",
    url: "https://cliniverseai.com",
    siteName: "Cliniverse AI",
    images: [{ url: "https://cliniverseai.com/og.png", width: 1200, height: 630, alt: "Cliniverse AI" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliniverse AI",
    description: "AI-powered clinical training platform. Train like a consultant from day one.",
    images: ["https://cliniverseai.com/og.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <script src="/register-sw.js" defer/>
      </head>
      <body style={{position:'relative',minHeight:'100vh'}}>
        {/* ── Logo Watermark ── */}
        <div style={{
          position:'fixed',
          inset:0,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          pointerEvents:'none',
          zIndex:0,
          overflow:'hidden',
          opacity:0.07,
        }}>
          <svg width="520" height="520" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="90" height="90" rx="23" fill="rgba(255,213,79,0.15)" stroke="rgba(255,213,79,0.8)" strokeWidth="2"/>
            <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68" stroke="rgba(255,213,79,1)" strokeWidth="9" strokeLinecap="round" fill="none"/>
            <path d="M36 50L46 63L70 36" stroke="rgba(0,229,255,1)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="69" cy="32" r="5" fill="rgba(255,213,79,1)"/>
            <circle cx="69" cy="68" r="5" fill="rgba(255,213,79,1)"/>
          </svg>
        </div>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
