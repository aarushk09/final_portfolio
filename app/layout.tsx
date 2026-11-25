import type React from "react"
import { Inter, Crimson_Text } from "next/font/google"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable}`}>
      <body className={`${inter.className} bg-[#f6f4ef] text-[#111] antialiased`}>{children}</body>
    </html>
  )
}

export const metadata = {
  title: "Aarush Kute",
  description:
    "Aarush Kute is a computer engineering student building production ML systems, automated data pipelines, and applied software.",
  openGraph: {
    title: "Aarush Kute",
    description:
      "Computer engineering, production ML systems, and applied software. Photographs, experience, projects, and research.",
    url: "https://aarushk.me",
    siteName: "Aarush Kute",
    type: "website",
  },
}
