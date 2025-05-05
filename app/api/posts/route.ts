import { type NextRequest, NextResponse } from "next/server"
import { getPostsData, getPostById, createPost, updatePost, deletePost, getPostsWithUserInfo } from "@/lib/server/post-data"
import { getUserById } from "@/lib/server/user-data"

// GET all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const withUserInfo = searchParams.get('withUserInfo') === 'true'
    const withCommentCount = searchParams.get('withCommentCount') === 'true'

    console.log("GET /api/posts - Query params:", { userId, withUserInfo, withCommentCount })

    const posts = await getPostsData(userId || undefined, withUserInfo, withCommentCount)
    console.log("GET /api/posts - Successfully fetched posts:", posts.length)
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error in GET /api/posts:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST new post
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json()
    const timestamp = new Date().toISOString().split('T')[0]

    console.log('Creating post with data:', JSON.stringify(postData, null, 2))

    // Validate required fields
    if (!postData.title || !postData.content || !postData.user_id) {
      console.error('Missing required fields:', { 
        title: !!postData.title, 
        content: !!postData.content, 
        user_id: !!postData.user_id 
      })
      return NextResponse.json({ 
        error: "Missing required fields",
        details: "Title, content, and user_id are required"
      }, { status: 400 })
    }

    const newPost = await createPost({
      ...postData,
      user_id: postData.user_id,
      likes: 0,
      views: 0,
      created_at: timestamp,
      updated_at: timestamp
    })

    console.log('Post created successfully:', JSON.stringify(newPost, null, 2))
    return NextResponse.json({ post: newPost })
  } catch (error) {
    console.error("Error in POST /api/posts:", error)
    if (error instanceof Error) {
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ 
      error: "Failed to create post",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
