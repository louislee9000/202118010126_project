"use server"

import { cookies } from "next/headers"

// Types
export type Session = {
  user?: {
    id: string
    name: string
    role: string
    enrolledCourseIds?: string[]
  }
}

// Get the current session
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get("auth")
  if (!authCookie?.value) return null

  try {
    const sessionData = JSON.parse(authCookie.value)
    return sessionData
  } catch (error) {
    console.error("Error parsing session data:", error)
    return null
  }
}

// In a real application, you would use a secure authentication system
// This is a simplified version for demonstration purposes only
export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Check if credentials match (both username and password should be "admin")
  if (username === "admin" && password === "admin") {
    // Create a session object
    const session: Session = {
      user: {
        id: "admin",
        name: "Admin User",
        role: "admin",
        enrolledCourseIds: []
      }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("auth", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth")
  return { success: true }
}

export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

