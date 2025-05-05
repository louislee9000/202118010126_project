import { type NextRequest, NextResponse } from "next/server"
import { getCommentsData, getCommentById, createComment, updateComment, deleteComment, getCommentsByPostId, getCommentsWithInfo } from "@/lib/server/comment-data"
import { getUserById } from "@/lib/server/user-data"
import { getPostById } from "@/lib/server/post-data"

// GET all comments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const userId = searchParams.get("userId")
    const withInfo = searchParams.get("withInfo") === "true"

    if (withInfo) {
      const comments = await getCommentsWithInfo()
      console.log("Comments with info loaded:", comments.length)

      // Apply filters
      let filteredComments = comments

      if (postId) {
        filteredComments = filteredComments.filter((comment: any) => comment.post_id === postId)
      }

      if (userId) {
        filteredComments = filteredComments.filter((comment: any) => comment.user_id === userId)
      }

      return NextResponse.json({ comments: filteredComments, count: filteredComments.length })
    } else {
      let comments = await getCommentsData()
      console.log("Comments data loaded:", comments.length)

      // Apply filters
      if (postId) {
        comments = await getCommentsByPostId(postId)
      }

      if (userId) {
        comments = comments.filter((comment: any) => comment.user_id === userId)
      }

      return NextResponse.json({ comments, count: comments.length })
    }
  } catch (error) {
    console.error("Error in GET /api/comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST new comment
export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json()
    const timestamp = new Date().toISOString()

    const newComment = await createComment({
      ...commentData,
      user_id: commentData.userId,
      post_id: commentData.postId,
      likes: 0,
      created_at: timestamp,
      updated_at: timestamp
    })

    return NextResponse.json({ message: "Comment created successfully", comment: newComment })
  } catch (error) {
    console.error("Error in POST /api/comments:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
