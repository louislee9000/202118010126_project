"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MyCoursesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard with courses tab active
    router.push("/dashboard?tab=courses")
  }, [router])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to your courses...</p>
        </div>
      </div>
    </div>
  )
}

