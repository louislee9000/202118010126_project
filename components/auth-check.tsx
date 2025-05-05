"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { isUserLoggedIn } from "@/lib/auth-utils"

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthCheck({ children, fallback }: AuthCheckProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setIsLoggedIn(isUserLoggedIn())
  }, [])

  // Show nothing while checking auth status or before client-side rendering
  if (!isMounted || isLoggedIn === null) {
    return null
  }

  // If logged in, show the children
  if (isLoggedIn) {
    return <>{children}</>
  }

  // If not logged in and fallback is provided, show fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Default login prompt
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>Login Required</CardTitle>
        <CardDescription>You need to be logged in to access this content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Please log in to your account to view this content, participate in discussions, and solve coding challenges.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push("/login")} className="w-full gap-2">
          <LogIn className="h-4 w-4" />
          Login to Continue
        </Button>
      </CardFooter>
    </Card>
  )
}

