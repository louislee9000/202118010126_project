import { NextResponse } from "next/server"
import { getQuestionStatistics } from "@/lib/server/question-data"

export async function GET() {
  try {
    console.log('Fetching question statistics in API route...')
    const statistics = await getQuestionStatistics()
    console.log('API route received statistics:', statistics)
    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error in GET /api/questions/statistics:", error)
    return NextResponse.json({ error: "Failed to fetch question statistics" }, { status: 500 })
  }
}

