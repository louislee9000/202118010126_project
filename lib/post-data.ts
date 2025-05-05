// This file now contains only the types and client-side functions

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  likes: number
  views: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    email: string
  }
}

// Client-side function to fetch posts via API
export async function fetchPosts(params?: { userId?: string; withUserInfo?: boolean }): Promise<Post[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let url = `${baseUrl}/api/posts`

  if (params) {
    const queryParams = new URLSearchParams()
    if (params.userId) queryParams.append("userId", params.userId)
    if (params.withUserInfo) queryParams.append("withUserInfo", "true")

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details || errorData.error || "Failed to fetch posts")
    }
    const data = await response.json()
    return data.posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw error
  }
}

// Get a single post by ID (client-side)
export async function fetchPostById(id: string): Promise<Post | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/posts/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch post")
  }
  return response.json()
}

// Create a new post (client-side)
export async function createPostClient(postData: Partial<Post>): Promise<Post> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Ensure we're using the correct field names
  const formattedPostData = {
    title: postData.title,
    content: postData.content,
    user_id: postData.user_id,
    tags: postData.tags || [],
    likes: 0,
    views: 0
  };

  const response = await fetch(`${baseUrl}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formattedPostData),
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create post");
  }

  const data = await response.json()
  return data.post
}

// Update an existing post (client-side)
export async function updatePostClient(id: string, postData: Partial<Post>): Promise<Post> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    throw new Error("Failed to update post")
  }

  const data = await response.json()
  return data.post
}

// Delete a post (client-side)
export async function deletePostClient(id: string): Promise<Post> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/posts/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete post")
  }

  const data = await response.json()
  return data.post
}

// Get posts by user ID (client-side)
export async function fetchPostsByUserId(userId: string): Promise<Post[]> {
  return fetchPosts({ userId })
}

// Get posts with user information (client-side)
export async function fetchPostsWithUserInfo(): Promise<Post[]> {
  return fetchPosts({ withUserInfo: true })
}

// For backwards compatibility - these shouldn't be used in client components
export {
  createPostClient as createPost,
  updatePostClient as updatePost,
  deletePostClient as deletePost,
  fetchPostById as getPostById,
  fetchPosts as getPostsData,
  fetchPostsByUserId as getPostsByUserId,
  fetchPostsWithUserInfo as getPostsWithUserInfo
}

export async function getPostsClient(userId?: string, withUserInfo: boolean = false, withCommentCount: boolean = false): Promise<Post[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const params = new URLSearchParams()
  
  if (userId) {
    params.append('userId', userId)
  }
  if (withUserInfo) {
    params.append('withUserInfo', 'true')
  }
  if (withCommentCount) {
    params.append('withCommentCount', 'true')
  }

  const response = await fetch(`${baseUrl}/api/posts?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }

  const data = await response.json()
  return data
}

export async function getPostClient(id: string, withUserInfo: boolean = false, withCommentCount: boolean = false): Promise<Post> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const params = new URLSearchParams()
  if (withUserInfo) {
    params.append('withUserInfo', 'true')
  }
  if (withCommentCount) {
    params.append('withCommentCount', 'true')
  }
  const queryString = params.toString()
  const url = `${baseUrl}/api/posts/${id}${queryString ? `?${queryString}` : ''}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch post')
  }
  return response.json()
}
