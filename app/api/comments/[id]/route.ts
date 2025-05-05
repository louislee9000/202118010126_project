import { type NextRequest, NextResponse } from "next/server"
import { getCommentById, updateComment, deleteComment } from "@/lib/server/comment-data"

// GET a specific comment
export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Fetching comment with ID: ${id}`)
    
    const comment = await getCommentById(id)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error(`Error in GET /api/comments/${id}:`, error)
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 })
  }
}

// PUT (update) a specific comment
export async function PUT(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Updating comment with ID: ${id}`)
    
    const commentData = await request.json()
    const updatedComment = await updateComment(id, commentData)

    if (!updatedComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Comment updated successfully", 
      comment: updatedComment 
    })
  } catch (error) {
    console.error(`Error in PUT /api/comments/${id}:`, error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE a specific comment
export async function DELETE(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Deleting comment with ID: ${id}`)
    
    const success = await deleteComment(id)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error(`Error in DELETE /api/comments/${id}:`, error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
