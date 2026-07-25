import type { Metadata } from "next"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"

export const metadata: Metadata = {
  title: "Cliniverse AI",
  description: "Clinical training platform built by a physician. 25+ cases, AI Generator, Global Competition, Surgical AI.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Cliniverse AI — Train Like a Consultant",
    description: "Join 1,000+ physicians. AI-powered clinical cases, Rapid Fire, Surgical protocols. Free to start.",
    url: "https://cliniverse-ai-xmev.vercel.app",
    siteName: "Cliniverse AI",
    images: [{ url: "https://cliniverse-ai-xmev.vercel.app/og.png", width: 1200, height: 630, alt: "Cliniverse AI" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliniverse AI",
    description: "AI-powered clinical training platform.",
    images: ["https://cliniverse-ai-xmev.vercel.app/og.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
// redeploy
