"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      // Remove login state from localStorage
      localStorage.removeItem("adminLoggedIn")
      localStorage.removeItem("adminUserId")

      // Clear any other potential auth data
      localStorage.clear()
      sessionStorage.clear()

      // Use window.location for a hard refresh
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Error during logout:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
      <LogOut className="h-4 w-4 mr-2" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  )
}

