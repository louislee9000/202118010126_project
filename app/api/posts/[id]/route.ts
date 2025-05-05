import { type NextRequest, NextResponse } from "next/server"
import { getPostById, updatePost, deletePost } from "@/lib/server/post-data"

// GET a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await getPostById(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error("Error in GET /api/posts/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

// PUT update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postData = await request.json()
    const updatedPost = await updatePost(params.id, postData)
    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error in PUT /api/posts/[id]:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

// DELETE a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deletePost(params.id)
    if (!success) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
