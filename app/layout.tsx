import type { Metadata } from "next"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"

const ogImage = "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80"

export const metadata: Metadata = {
  title: "Cliniverse AI",
  description: "Clinical training platform built by a physician.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Cliniverse AI",
    description: "Join 1000+ physicians. AI cases, Global Competition, Surgical protocols.",
    url: "https://cliniverse-ai-xmev.vercel.app",
    images: [{ url: ogImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliniverse AI",
    images: [ogImage],
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
