"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { isUserLoggedIn, getCurrentUser, isLoggingOut } from "@/lib/auth-utils"
import UserPosts from "@/components/user-posts"

// Define course type
interface Course {
  id: string
  title: string
  instructor: string
  level: string
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [incompleteQuestions, setIncompleteQuestions] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const authChecked = useRef(false)

  // First, check authentication before any data fetching
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    // If we're in the process of logging out, don't do anything
    if (isLoggingOut()) return

    setIsMounted(true)

    // Only check auth once to prevent multiple redirects
    if (authChecked.current) return

    const checkAuth = () => {
      try {
        const isLoggedIn = isUserLoggedIn()
        setIsAuthenticated(isLoggedIn)

        if (!isLoggedIn) {
          // Use window.location for a hard navigation
          window.location.href = "/login"
          return false
        }
        
        // Store the current user
        const user = getCurrentUser()
        setCurrentUser(user)
        
        return true
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
        window.location.href = "/login"
        return false
      } finally {
        authChecked.current = true
      }
    }

    checkAuth()
  }, [])

  // Only fetch data if authenticated and component is mounted
  useEffect(() => {
    if (!isAuthenticated || !isMounted) return

    // If we're in the process of logging out, don't fetch data
    if (isLoggingOut()) return

    let isCancelled = false

    const fetchDashboardData = async () => {
      try {
        // Get enrolled course IDs from localStorage
        const user = getCurrentUser()
        if (!user) {
          if (!isCancelled) {
            setIsAuthenticated(false)
            window.location.href = "/login"
          }
          return
        }

        const enrolledCourseIds = user?.enrolledCourseIds || []

        // Fetch courses
        const coursesResponse = await fetch("/api/courses")
        const allCourses = await coursesResponse.json()

        // Filter to only include enrolled courses
        const userEnrolledCourses = allCourses.filter((course) => enrolledCourseIds.includes(course.id))

        if (!isCancelled) {
          setEnrolledCourses(userEnrolledCourses)
        }

        // Fetch questions data
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const questionsResponse = await fetch(`${baseUrl}/api/questions`)
        const questions = await questionsResponse.json()

        // Calculate incomplete questions
        if (!isCancelled) {
          setIncompleteQuestions(questions.length)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, isMounted])

  // Show loading state while checking auth and fetching data
  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses you're enrolled in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice Questions</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incompleteQuestions}</div>
            <p className="text-xs text-muted-foreground">Practice questions waiting to be solved</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/community">
              <Button variant="outline" className="w-full">
                Join Discussions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {enrolledCourses.length === 0 ? (
          <Card className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Enrolled Courses</h3>
            <p className="text-muted-foreground mb-4">
              You haven't enrolled in any courses yet. Browse our course catalog to find courses that interest you.
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <>
            {enrolledCourses.map((course: Course) => (
              <Card key={course.id} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Instructor:</span>
                      <span className="text-sm">{course.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Level:</span>
                      <span className="text-sm capitalize">{course.level}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">Continue Learning</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* User Posts Section */}
      <div className="mb-8">
        {currentUser && <UserPosts userId={currentUser.id} />}
      </div>
    </div>
  )
}
