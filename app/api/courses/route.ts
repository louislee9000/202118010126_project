import { type NextRequest, NextResponse } from "next/server"
import { getCoursesData, getCoursesByCategory, createCourse } from "@/lib/server/course-data"

// GET all courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const courses = category ? await getCoursesByCategory(category) : await getCoursesData()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error in GET /api/courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST new course
export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()

    const newCourse = await createCourse(courseData)

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/courses:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
