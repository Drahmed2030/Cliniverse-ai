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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
