import type { Metadata } from "next"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"

export const metadata: Metadata = {
  title: "Cliniverse AI — Clinical Training Platform",
  description: "The most advanced clinical training platform built by a physician. 25+ cases, AI Generator, Global Competition, Surgical AI. Free to start.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Cliniverse AI — Train Like a Consultant",
    description: "Join 1,000+ physicians worldwide. AI-powered clinical cases, Rapid Fire, Surgical protocols. Free to start.",
    url: "https://cliniverse-ai-xmev.vercel.app",
    siteName: "Cliniverse AI",
    images: [{ url: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80", width: 1200, height: 630, alt: "Cliniverse AI" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliniverse AI — Train Like a Consultant",
    description: "AI-powered clinical training. 25+ cases, Global Competition, Surgical AI.",
    images: ["https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80"],
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
