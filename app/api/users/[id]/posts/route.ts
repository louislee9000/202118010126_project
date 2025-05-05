import { type NextRequest, NextResponse } from "next/server"
import { getPostsByUserId } from "@/lib/server/post-data"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const id = String(context.params.id)
    console.log(`Fetching posts for user with ID: ${id}`)
    
    const posts = await getPostsByUserId(id)
    return NextResponse.json({ posts, count: posts.length })
  } catch (error) {
    console.error(`Error in GET /api/users/${context.params.id}/posts:`, error)
    return NextResponse.json({ error: "Failed to fetch user posts" }, { status: 500 })
  }
}
