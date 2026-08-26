import type { Metadata, Viewport } from "next"
import "./globals.css"
import "./cliniverse-v1.css"
import ThemeProvider from "./components/ThemeProvider"

export const viewport: Viewport = {
  themeColor: "#080c16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Cliniverse AI — Healthcare Intelligence by NeuraOps",
  description:
    "Cliniverse AI is the healthcare intelligence and workflow vertical of NeuraOps, combining clinical operations, evidence, tools, and simulation in one platform.",
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
    title: "Cliniverse AI — Healthcare Intelligence by NeuraOps",
    description:
      "Healthcare workflow intelligence, clinical evidence, tools, and simulation by NeuraOps.",
    url: "https://cliniverseai.com",
    siteName: "Cliniverse AI",
    images: [
      {
        url: "https://cliniverseai.com/og.png",
        width: 1200,
        height: 630,
        alt: "Cliniverse AI by NeuraOps",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliniverse AI — Healthcare Intelligence by NeuraOps",
    description:
      "Healthcare workflow intelligence, clinical evidence, tools, and simulation by NeuraOps.",
    images: ["https://cliniverseai.com/og.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <script src="/register-sw.js" defer />
      </head>
      <body style={{ position: "relative", minHeight: "100vh" }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
