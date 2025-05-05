"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { Users, BookOpen, LayoutDashboard, FileQuestion, MessageSquare } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
    setIsAuthenticated(isLoggedIn)

    if (!isLoggedIn && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [router, pathname])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Online Programming Learning Platform</h1>
          {isAuthenticated && <LogoutButton />}
        </div>
      </header>

      {isAuthenticated && pathname !== "/admin/login" && (
        <div className="bg-white border-b">
          <div className="container mx-auto">
            <nav className="flex flex-wrap">
              <Link
                href="/admin"
                className={`px-4 py-3 flex items-center gap-2 border-b-2 ${isActive("/admin") && pathname !== "/admin/users" && pathname !== "/admin/courses" && pathname !== "/admin/questions" && pathname !== "/admin/community" ? "border-primary text-primary font-medium" : "border-transparent hover:text-primary"}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className={`px-4 py-3 flex items-center gap-2 border-b-2 ${isActive("/admin/users") ? "border-primary text-primary font-medium" : "border-transparent hover:text-primary"}`}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
              <Link
                href="/admin/courses"
                className={`px-4 py-3 flex items-center gap-2 border-b-2 ${isActive("/admin/courses") ? "border-primary text-primary font-medium" : "border-transparent hover:text-primary"}`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </Link>
              <Link
                href="/admin/questions"
                className={`px-4 py-3 flex items-center gap-2 border-b-2 ${isActive("/admin/questions") ? "border-primary text-primary font-medium" : "border-transparent hover:text-primary"}`}
              >
                <FileQuestion className="h-4 w-4" />
                <span>Questions</span>
              </Link>
              <Link
                href="/admin/community"
                className={`px-4 py-3 flex items-center gap-2 border-b-2 ${isActive("/admin/community") ? "border-primary text-primary font-medium" : "border-transparent hover:text-primary"}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Community</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main>{children}</main>
    </div>
  )
}

