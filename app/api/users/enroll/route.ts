import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/server/data"
import { getCourseById, updateCourse } from "@/lib/server/course-data"

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    // Validate user and course exist
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const course = getCourseById(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if user already has enrolled courses data
    if (!user.enrolledCourseIds) {
      user.enrolledCourseIds = []
    }

    // Check if user is already enrolled in this course
    if (user.enrolledCourseIds.includes(courseId)) {
      return NextResponse.json(
        {
          error: "Already enrolled in this course",
          enrolledCourseIds: user.enrolledCourseIds,
        },
        { status: 400 },
      )
    }

    // Add course to user's enrolled courses
    const updatedUser = {
      ...user,
      enrolledCourses: (user.enrolledCourses || 0) + 1,
      enrolledCourseIds: [...(user.enrolledCourseIds || []), courseId],
    }

    // Update user in database
    const result = updateUser(userId, updatedUser)

    if (!result) {
      return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
    }

    // Increment course's enrolled students count
    const updatedCourse = {
      ...course,
      enrolledStudents: (course.enrolledStudents || 0) + 1,
    }

    // Update course in database
    updateCourse(courseId, updatedCourse)

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
      enrolledCourseIds: updatedUser.enrolledCourseIds,
    })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
  }
}

