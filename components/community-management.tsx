// Fetch posts and comments
const fetchData = async () => {
  setIsLoading(true)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Fetch posts
    const postsResponse = await fetch(`${baseUrl}/api/posts?t=${Date.now()}`)
    if (!postsResponse.ok) {
      throw new Error("Failed to fetch posts")
    }
    const postsData = await postsResponse.json()
    setPosts(postsData.posts)

    // Fetch comments
    const commentsResponse = await fetch(`${baseUrl}/api/comments?t=${Date.now()}`)
    if (!commentsResponse.ok) {
      throw new Error("Failed to fetch comments")
    }
    const commentsData = await commentsResponse.json()
    setComments(commentsData.comments)

    applyFilters(postsData.posts, searchTerm, categoryFilter)
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    setIsLoading(false)
  }
}

// Handle delete post
const handleDelete = async (id) => {
  if (confirm("Are you sure you want to delete this post?")) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/posts/${id}`, {
        method: "DELETE",
      })
      // Force refresh with a small delay
      setTimeout(() => {
        fetchData()
      }, 500)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }
}

// Handle form close
const handleFormClose = (shouldRefresh = false) => {
  setIsFormOpen(false)
  setCurrentPost(null)
  if (shouldRefresh) {
    // Force refresh with a small delay
    setTimeout(() => {
      fetchData()
    }, 500)
  }
} 