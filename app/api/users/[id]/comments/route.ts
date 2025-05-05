import { type NextRequest, NextResponse } from "next/server"
import { getCommentsByUserId } from "@/lib/server/comment-data"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const id = String(context.params.id)
    console.log(`Fetching comments for user with ID: ${id}`)
    
    const comments = await getCommentsByUserId(id)
    return NextResponse.json({ comments, count: comments.length })
  } catch (error) {
    console.error(`Error in GET /api/users/${context.params.id}/comments:`, error)
    return NextResponse.json({ error: "Failed to fetch user comments" }, { status: 500 })
  }
}
