// This file now contains only the types and client-side functions

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  likes: number
  createdAt: string
  updatedAt: string
}

// Client-side function to fetch comments via API
export async function fetchComments(params?: { postId?: string; userId?: string; withInfo?: boolean }): Promise<
  Comment[]
> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let url = `${baseUrl}/api/comments`

  if (params) {
    const queryParams = new URLSearchParams()
    if (params.postId) queryParams.append("postId", params.postId)
    if (params.userId) queryParams.append("userId", params.userId)
    if (params.withInfo) queryParams.append("withInfo", "true")

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch comments")
  }
  const data = await response.json()
  return data.comments
}

// Get a single comment by ID (client-side)
export async function fetchCommentById(id: string): Promise<Comment | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/comments/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch comment")
  }
  return response.json()
}

// Create a new comment (client-side)
export async function createCommentClient(commentData: Partial<Comment>): Promise<Comment> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })

  if (!response.ok) {
    throw new Error("Failed to create comment")
  }

  const data = await response.json()
  return data.comment
}

// Update an existing comment (client-side)
export async function updateCommentClient(id: string, commentData: Partial<Comment>): Promise<Comment> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/comments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })

  if (!response.ok) {
    throw new Error("Failed to update comment")
  }

  const data = await response.json()
  return data.comment
}

// Delete a comment (client-side)
export async function deleteCommentClient(id: string): Promise<Comment> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/comments/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete comment")
  }

  const data = await response.json()
  return data.comment
}

// Get comments by post ID (client-side)
export async function fetchCommentsByPostId(postId: string): Promise<Comment[]> {
  return fetchComments({ postId })
}

// Get comments by user ID (client-side)
export async function fetchCommentsByUserId(userId: string): Promise<Comment[]> {
  return fetchComments({ userId })
}

// Get comments with user and post information (client-side)
export async function fetchCommentsWithInfo(): Promise<Comment[]> {
  return fetchComments({ withInfo: true })
}

// For backwards compatibility - these shouldn't be used in client components
export {
  createCommentClient as createComment,
  updateCommentClient as updateComment,
  deleteCommentClient as deleteComment,
  fetchCommentById as getCommentById,
  fetchComments as getCommentsData,
  fetchCommentsByPostId as getCommentsByPostId,
  fetchCommentsByUserId as getCommentsByUserId,
  fetchCommentsWithInfo as getCommentsWithInfo
}
