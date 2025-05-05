"use client"

import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { isLoggingOut } from "@/lib/auth-utils"

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}

