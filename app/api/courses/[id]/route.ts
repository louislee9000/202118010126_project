import { type NextRequest, NextResponse } from "next/server"
import { getCourseById, updateCourse, deleteCourse } from "@/lib/server/course-data"

// GET a specific course
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params and ensure it's resolved
    const params = await Promise.resolve(context.params)
    const id = String(params.id)
    console.log(`Fetching course with ID: ${id}`)
    
    const course = await getCourseById(id)

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error(`Error in GET /api/courses/${context.params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

// PUT (update) a specific course
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  let id = '';
  try {
    // Extract id from context params and ensure it's resolved
    const params = await Promise.resolve(context.params)
    id = String(params.id)
    console.log(`Updating course with ID: ${id}`)
    
    const courseData = await request.json()
    const updatedCourse = await updateCourse(id, courseData)

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course updated successfully", course: updatedCourse })
  } catch (error) {
    console.error(`Error in PUT /api/courses/${id}:`, error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

// DELETE a specific course
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const id = String(context.params.id)
    console.log(`Deleting course with ID: ${id}`)
    
    const deletedCourse = await deleteCourse(id)

    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course deleted successfully", course: deletedCourse })
  } catch (error) {
    console.error(`Error in DELETE /api/courses/${context.params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
