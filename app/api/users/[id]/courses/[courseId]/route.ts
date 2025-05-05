import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/server/user-data"

// DELETE to unenroll from a course
export async function DELETE(request: NextRequest, context: { params: { id: string, courseId: string } }) {
  try {
    // Extract ids from context params
    const params = await Promise.resolve(context.params)
    const userId = String(params.id)
    const courseIdStr = String(params.courseId)

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Initialize enrolledCourseIds array if it doesn't exist
    if (!user.enrolledCourseIds) {
      user.enrolledCourseIds = []
    }

    // Check if user is already unenrolled from this course
    if (!user.enrolledCourseIds.includes(courseIdStr)) {
      return NextResponse.json({ message: "User not enrolled in this course" })
    }

    // Remove the course ID from the user's enrolled courses
    const updatedUser = {
      ...user,
      enrolledCourseIds: user.enrolledCourseIds.filter(id => id !== courseIdStr),
      enrolledCourses: (user.enrolledCourses || 1) - 1
    }

    // Update the user in the database
    const result = await updateUser(userId, updatedUser)

    return NextResponse.json({ 
      message: "User unenrolled from course successfully", 
      user: result 
    })
  } catch (error) {
    console.error(`Error in DELETE /api/users/${id}/courses/${courseId}:`, error)
    return NextResponse.json({ error: "Failed to unenroll user from course" }, { status: 500 })
  }
}
