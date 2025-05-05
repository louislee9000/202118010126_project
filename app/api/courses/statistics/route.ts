import { NextResponse } from "next/server"
import { getCourseStatistics } from "@/lib/server/course-data"

export async function GET() {
  try {
    const statistics = getCourseStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error in GET /api/courses/statistics:", error)
    return NextResponse.json({ error: "Failed to fetch course statistics" }, { status: 500 })
  }
}
