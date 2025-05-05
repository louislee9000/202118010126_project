"use client"

// Simple utility functions for authentication without context
export type User = {
  id: string
  name: string
  role: string
  enrolledCourseIds?: string[]
}

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },
  clear: (): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.clear()
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
    }
  },
}

// Check if user is logged in
export function isUserLoggedIn(): boolean {
  return safeLocalStorage.getItem("isLoggedIn") === "true"
}

// Get current user
export function getCurrentUser(): User | null {
  const isLoggedIn = safeLocalStorage.getItem("isLoggedIn") === "true"
  if (!isLoggedIn) return null

  const userId = safeLocalStorage.getItem("userId")
  const userName = safeLocalStorage.getItem("userName")
  const userRole = safeLocalStorage.getItem("userRole")
  const enrolledCourseIds = safeLocalStorage.getItem("enrolledCourseIds")

  if (!userId || !userName) return null

  return {
    id: userId,
    name: userName,
    role: userRole || "user",
    enrolledCourseIds: enrolledCourseIds ? JSON.parse(enrolledCourseIds) : [],
  }
}

// Login user
export function loginUser(userData: User): void {
  safeLocalStorage.setItem("isLoggedIn", "true")
  safeLocalStorage.setItem("userId", userData.id)
  safeLocalStorage.setItem("userName", userData.name)
  safeLocalStorage.setItem("userRole", userData.role)

  if (userData.enrolledCourseIds) {
    safeLocalStorage.setItem("enrolledCourseIds", JSON.stringify(userData.enrolledCourseIds))
  } else {
    safeLocalStorage.setItem("enrolledCourseIds", JSON.stringify([]))
  }
}

// Logout user - completely resets application state with hard refresh
export function logoutUser(redirectPath = "/"): void {
  // First remove specific items
  safeLocalStorage.removeItem("isLoggedIn")
  safeLocalStorage.removeItem("userId")
  safeLocalStorage.removeItem("userName")
  safeLocalStorage.removeItem("userRole")
  safeLocalStorage.removeItem("enrolledCourseIds")

  // For admin users, also clear admin-specific storage
  safeLocalStorage.removeItem("adminLoggedIn")
  safeLocalStorage.removeItem("adminUserId")

  // Force a clean slate by clearing session storage too
  if (typeof window !== "undefined") {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error("Error clearing sessionStorage:", error)
    }

    // Set a flag to indicate we're in the process of logging out
    // This prevents any components from trying to use auth state during navigation
    sessionStorage.setItem("logging_out", "true")

    // Use window.location for a hard refresh to completely reset React state
    // This is more reliable than client-side navigation for clearing context providers
    window.location.href = redirectPath
  }
}

// Get enrolled course IDs
export function getEnrolledCourseIds(): string[] {
  const enrolledCourseIds = safeLocalStorage.getItem("enrolledCourseIds")
  return enrolledCourseIds ? JSON.parse(enrolledCourseIds) : []
}

// Add a course to enrolled courses
export function addEnrolledCourse(courseId: string): void {
  const enrolledCourseIds = getEnrolledCourseIds()
  if (!enrolledCourseIds.includes(courseId)) {
    enrolledCourseIds.push(courseId)
    safeLocalStorage.setItem("enrolledCourseIds", JSON.stringify(enrolledCourseIds))
  }
}

// Check if we're in the process of logging out
export function isLoggingOut(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("logging_out") === "true"
}

// Clear the logging out flag (call this on initial page load)
export function clearLoggingOutFlag(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem("logging_out")
}

