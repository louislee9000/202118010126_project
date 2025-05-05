import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const dataFilePath = path.join(process.cwd(), "data", "posts.json")

// Helper function to read posts data
async function getPostsData() {
  try {
    const fileData = await fs.readFile(dataFilePath, "utf8")
    return JSON.parse(fileData)
  } catch (error) {
    console.error("Error reading posts data:", error)
    return []
  }
}

// Helper function to write posts data
async function writePostsData(data: any) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error writing posts data:", error)
    return false
  }
}

// Get a single post by ID
async function getPostById(id: string) {
  const posts = await getPostsData()
  return posts.find((post: any) => String(post.id) === String(id))
}

// Update an existing post
async function updatePost(id: string, postData: any) {
  const posts = await getPostsData()
  const index = posts.findIndex((post: any) => String(post.id) === String(id))

  if (index === -1) {
    return null
  }

  const now = new Date().toISOString().split("T")[0]
  const updatedPost = {
    ...posts[index],
    ...postData,
    id,
    updatedAt: now,
  }

  posts[index] = updatedPost
  await writePostsData(posts)

  return updatedPost
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Extract id from context params
    const id = String(context.params.id)
    console.log(`Liking post with ID: ${id}`)
    
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Increment likes
    const updatedPost = await updatePost(id, {
      ...post,
      likes: (post.likes || 0) + 1,
    })

    return NextResponse.json({ message: "Post liked successfully", post: updatedPost })
  } catch (error) {
    console.error(`Error in POST /api/posts/${context.params.id}/like:`, error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}