"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, MessageSquare, LogIn, LogOut, User, Code } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { isUserLoggedIn, getCurrentUser, logoutUser, clearLoggingOutFlag } from "@/lib/auth-utils"
import { DialogDescription } from "@/components/ui/dialog"

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Memoize the checkAuth function to avoid recreating it on each render
  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const loginStatus = isUserLoggedIn()
      setIsLoggedIn(loginStatus)

      // Get user name if logged in
      if (loginStatus) {
        const user = getCurrentUser()
        setUserName(user?.name || "")
      } else {
        setUserName("")
      }
    } catch (error) {
      console.error("Error checking login status:", error)
      // Reset to safe defaults on error
      setIsLoggedIn(false)
      setUserName("")
    }
  }, [])

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    // Clear any logging out flag on initial load
    clearLoggingOutFlag()

    setMounted(true)
    checkAuth()

    // Add event listener for storage changes (in case of logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "isLoggedIn" || e.key === null) {
        checkAuth()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [checkAuth])

  // Update login status when path changes, but only if component is mounted
  useEffect(() => {
    if (!mounted) return
    checkAuth()
  }, [pathname, mounted, checkAuth])

  const handleLogout = () => {
    if (isLoggingOut) return // Prevent multiple logout attempts

    setIsLoggingOut(true)
    try {
      // Use the updated logoutUser function that does a hard refresh
      logoutUser("/")
      // Note: We don't need to update state or navigate here
      // as the page will be refreshed by logoutUser
    } catch (error) {
      console.error("Error during logout:", error)
      setIsLoggingOut(false)
    }
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses", icon: <BookOpen className="h-4 w-4" /> },
    { name: "Practice", path: "/practice", icon: <Code className="h-4 w-4" /> },
    { name: "Community", path: "/community", icon: <MessageSquare className="h-4 w-4" /> },
  ]

  // Prevent server/client rendering mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-screen-2xl">
          <div className="flex items-center gap-2 w-[200px]">
            <div className="w-10 h-10"></div> {/* Placeholder for menu button */}
            <span className="font-bold text-xl">CodeLearn</span>
          </div>
          <div className="w-[200px]"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-screen-2xl">
        <div className="flex items-center gap-2 w-[200px]">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <DialogDescription className="sr-only">Navigation menu for mobile devices</DialogDescription>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 text-lg px-2 py-2 rounded-md hover:bg-accent ${
                      isActive(item.path) ? "font-medium text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t">
                  {isLoggedIn ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full mb-2">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full" variant="outline">
                          <LogIn className="mr-2 h-4 w-4" />
                          Admin Login
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">CodeLearn Platform</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center justify-center">
          <div className="flex items-center justify-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 hover:text-primary ${
                  isActive(item.path) ? "font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-2 w-[200px] justify-end">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {userName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/admin/login" className="hidden sm:block">
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

