"use server"

export async function createPost(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const tagsInput = formData.get("tags") as string
    const userId = formData.get("userId") as string

    // Parse tags from comma-separated string
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Validate inputs
    if (!title || !content || !userId) {
      return { success: false, error: "Please fill in all required fields" }
    }

    // Create post object
    const newPost = {
      title,
      content,
      tags,
      user_id: userId,
      likes: 0,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Send request to API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "Failed to create post" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Server action to handle post likes
export async function likePost(postId: string) {
  try {
    // Use a full URL path with origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts/${postId}/like`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to like post")
    }

    return { success: true }
  } catch (error) {
    console.error("Error liking post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to like post" }
  }
}

// Server action to handle post unlikes
export async function unlikePost(postId: string) {
  try {
    // Use a full URL path with origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts/${postId}/unlike`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to unlike post")
    }

    return { success: true }
  } catch (error) {
    console.error("Error unliking post:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unlike post" }
  }
}
