import type React from "react"
import { Inter, Crimson_Text, Press_Start_2P } from "next/font/google"
import { PixelModeProvider } from "@/contexts/pixel-mode-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
})

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson-text",
})

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable} ${pressStart2P.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <PixelModeProvider>{children}</PixelModeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
