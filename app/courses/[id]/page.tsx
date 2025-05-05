"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchCourseById } from "@/lib/course-data"
import { fetchQuestionsByCourseId } from "@/lib/question-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, addEnrolledCourse, getEnrolledCourseIds } from "@/lib/auth-utils"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { use } from "react"

export default function CoursePage({ params }: { params: { id: string } }) {
  const id = String(use(params).id)
  console.log(`Loading course with ID: ${id}`)

  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isUnenrolling, setIsUnenrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [enrolledCount, setEnrolledCount] = useState(0)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch course data
        const courseData = await fetchCourseById(id)
        setCourse(courseData)
        
        // Fetch questions for this course
        const questionsData = await fetchQuestionsByCourseId(id)
        setQuestions(questionsData)
        
        // Get current user
        const currentUser = getCurrentUser()
        setUser(currentUser)

        // Check if user is enrolled in this course
        const enrolledCourseIds = getEnrolledCourseIds()
        setIsEnrolled(enrolledCourseIds.includes(id))

        // Fetch enrolled students count
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/courses/${id}/enrolled-count`)
        const data = await response.json()
        setEnrolledCount(data.count || 0)
      } catch (error) {
        console.error("Error fetching course data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, isMounted])

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login if not logged in
      router.push("/login")
      return
    }

    setIsEnrolling(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/users/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local storage
        addEnrolledCourse(course.id)
        setIsEnrolled(true)
        toast({
          title: "Enrollment Successful",
          description: `You have successfully enrolled in ${course.title}`,
        })
      } else {
        if (data.error === "Already enrolled in this course") {
          setIsEnrolled(true)
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this course",
          })
        } else {
          throw new Error(data.error || "Failed to enroll in course")
        }
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in this course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  // Show loading state before client-side rendering
  if (!isMounted) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/courses">
            <Button>Browse All Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleUnenroll = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsUnenrolling(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/users/${user.id}/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Remove course from local storage
        const enrolledCourseIds = getEnrolledCourseIds()
        const updatedCourseIds = enrolledCourseIds.filter(id => id !== course.id)
        localStorage.setItem('enrolledCourseIds', JSON.stringify(updatedCourseIds))
        
        setIsEnrolled(false)
        toast({
          title: "Unenrollment Successful",
          description: `You have successfully unenrolled from ${course.title}`,
        })
      } else {
        throw new Error(data.error || "Failed to unenroll from course")
      }
    } catch (error) {
      console.error("Error unenrolling from course:", error)
      toast({
        title: "Unenrollment Failed",
        description: "There was an error unenrolling from this course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUnenrolling(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/courses">
          <Button variant="outline" size="sm">
            ← Back to Courses
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <CardTitle className="text-3xl">{course.title}</CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
                <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="prose max-w-none">
                    <p>
                      This comprehensive course will take you through all the essential concepts and practical
                      applications of {course.title}. Whether you're a beginner or looking to enhance your skills, this
                      course provides a structured learning path.
                    </p>
                    <h3>What You'll Learn</h3>
                    <ul>
                      <li>Fundamental concepts and principles</li>
                      <li>Practical implementation techniques</li>
                      <li>Best practices and design patterns</li>
                      <li>Real-world project development</li>
                    </ul>
                    <h3>Requirements</h3>
                    <ul>
                      <li>Basic programming knowledge</li>
                      <li>A computer with internet access</li>
                      <li>Dedication and willingness to practice</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Module 1: Introduction</h3>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Course Overview and Setup
                        </li>
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Core Concepts and Fundamentals
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Module 2: Core Principles</h3>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Key Components and Architecture
                        </li>
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Building Your First Project
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Module 3: Advanced Topics</h3>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Performance Optimization
                        </li>
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Security Best Practices
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Module 4: Final Project</h3>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Project Planning and Setup
                        </li>
                        <li className="flex items-center">
                          <span className="w-4 h-4 mr-2 rounded-full bg-primary/20"></span>
                          Implementation and Deployment
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Practice Questions */}
          {questions.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>Test your knowledge with these practice questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{question.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <Badge variant="outline">{question.difficulty}</Badge>
                        <Link href={`/practice/${question.id}`}>
                          <Button size="sm">Solve Challenge</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Course Details Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Instructor</h3>
                  <p>{course.instructor}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Level:</span>
                  <span className="text-sm font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="text-sm font-medium">${course.price}</span>
                </div>
                <div className="pt-4">
                  {isEnrolled ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="destructive" 
                        onClick={handleUnenroll} 
                        disabled={isUnenrolling}
                      >
                        {isUnenrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          "Cancel Enrollment"
                        )}
                      </Button>
                      <Link href="/dashboard">
                        <Button className="w-full">Go to Dashboard</Button>
                      </Link>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
                      {isEnrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to get category badge color
function getCategoryColor(category: string) {
  switch (category) {
    case "frontend":
      return "bg-blue-100 text-blue-800"
    case "backend":
      return "bg-green-100 text-green-800"
    case "database":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
