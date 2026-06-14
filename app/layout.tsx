import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { AppProviders } from "@/components/app-providers"
import "./globals.css"

const dmSans = localFont({
  src: "../public/fonts/DMSans-Variable.ttf",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "100 1000",
})

const clashDisplay = localFont({
  src: "../public/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
  display: "swap",
  weight: "200 700",
})

export const metadata: Metadata = {
  title: "Projetão - Conectando ONGs, professores e estudantes",
  description:
    "Plataforma que conecta ONGs, professores universitários e estudantes em projetos sociais.",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0f766e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${dmSans.variable} ${clashDisplay.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
