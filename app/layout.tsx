import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Online Programming Learning Platform",
  description: "Learn programming skills with interactive courses and a supportive community",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary fallback={<div className="p-4">Something went wrong. Please refresh the page.</div>}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}



import './globals.css'