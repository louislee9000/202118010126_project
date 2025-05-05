import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/server/user-data"
import { getCoursesByIds } from "@/lib/server/course-data"

// GET enrolled courses for a user
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const { id } = await Promise.resolve(context.params)
    console.log(`Fetching enrolled courses for user with ID: ${id}`)
    
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user has no enrolled courses, return empty array
    if (!user.enrolledCourseIds || user.enrolledCourseIds.length === 0) {
      return NextResponse.json({ courses: [], count: 0 })
    }

    // Fetch all enrolled courses
    const courses = await getCoursesByIds(user.enrolledCourseIds)
    
    return NextResponse.json({ 
      courses, 
      count: courses.length 
    })
  } catch (error) {
    console.error(`Error in GET /api/users/${context.params.id}/courses:`, error)
    return NextResponse.json({ error: "Failed to fetch enrolled courses" }, { status: 500 })
  }
}

// POST to enroll in a course
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const { id } = await Promise.resolve(context.params)
    
    // Get the course ID from the request body
    const { courseId } = await request.json()
    
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }
    
    console.log(`Enrolling user ${id} in course ${courseId}`)
    
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Initialize enrolledCourseIds array if it doesn't exist
    if (!user.enrolledCourseIds) {
      user.enrolledCourseIds = []
    }

    // Check if user is already enrolled in this course
    if (user.enrolledCourseIds.includes(courseId)) {
      return NextResponse.json({ message: "User already enrolled in this course" })
    }

    // Add the course ID to the user's enrolled courses
    const updatedUser = {
      ...user,
      enrolledCourseIds: [...user.enrolledCourseIds, courseId]
    }

    // Update the user in the database
    const result = await updateUser(id, updatedUser)

    return NextResponse.json({ 
      message: "User enrolled in course successfully", 
      user: result 
    })
  } catch (error) {
    console.error(`Error in POST /api/users/${context.params.id}/courses:`, error)
    return NextResponse.json({ error: "Failed to enroll user in course" }, { status: 500 })
  }
}
