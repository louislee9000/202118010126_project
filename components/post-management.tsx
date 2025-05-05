"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search, X, Filter, Eye, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Post } from "@/lib/server/post-data"

interface Comment {
  id: string;
  user?: {
    name: string;
  };
  content: string;
  created_at: string;
}

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<Post | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc") // "asc" or "desc"
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})

  // Fetch posts and users
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Fetch posts with user info and comment counts
      const postsResponse = await fetch(`${baseUrl}/api/posts?withUserInfo=true`)
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts')
      }
      const { posts: postsData } = await postsResponse.json()
      setPosts(postsData || [])
      applyFilters(postsData || [], searchTerm, userFilter)

      // Fetch users
      const usersResponse = await fetch(`${baseUrl}/api/users`)
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users')
      }
      const { users: usersData } = await usersResponse.json()
      setUsers(usersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load posts. Please try again.")
      setPosts([])
      setFilteredPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (postList: Post[], search: string, user: string) => {
    if (!Array.isArray(postList)) {
      console.error('postList is not an array:', postList)
      return
    }

    let filtered = [...postList]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.content.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply user search filter
    if (user && user !== "all") {
      filtered = filtered.filter(
        (post) => post.user && post.user.name && post.user.name.toLowerCase().includes(user.toLowerCase()),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB

      // Get values based on sort field
      if (sortField === "created_at") {
        valueA = new Date(a.created_at).getTime()
        valueB = new Date(b.created_at).getTime()
      } else if (sortField === "views") {
        valueA = a.views || 0
        valueB = b.views || 0
      } else if (sortField === "comments") {
        valueA = commentCounts[a.id] || 0
        valueB = commentCounts[b.id] || 0
      } else {
        return 0
      }

      // Return comparison result based on sort direction
      if (sortDirection === "asc") {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })

    setFilteredPosts(filtered)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters(posts, searchTerm, userFilter)
  }, [searchTerm, userFilter, posts, sortField, sortDirection])

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/comments?postId=${postId}&withInfo=true`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const { comments: commentsData } = await response.json()
      setComments(commentsData)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  // Handle view post
  const handleView = (post: Post) => {
    setCurrentPost(post)
    setIsViewOpen(true)
    fetchComments(post.id)
  }

  // Handle delete post
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/posts/${id}`, {
          method: "DELETE",
        })
        fetchData()
      } catch (error) {
        console.error("Error deleting post:", error)
        setError("Failed to delete post. Please try again.")
      }
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/comments/${id}`, {
          method: "DELETE",
        })
        // Refresh comments
        if (currentPost) {
          fetchComments(currentPost.id)
        }
      } catch (error) {
        console.error("Error deleting comment:", error)
      }
    }
  }

  // Handle view close
  const handleViewClose = () => {
    setIsViewOpen(false)
    setCurrentPost(null)
    setComments([])
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setUserFilter("all")
  }

  // Format date
  const formatDate = (dateString: string) => {
    const options = { year: "numeric" as const, month: "short" as const, day: "numeric" as const }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Handle sorting
  const handleSort = (field: string) => {
    // If clicking the current sort field, toggle sort direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Otherwise, change sort field and set default sort direction
      setSortField(field)
      // Date defaults to newest first, others default to highest first
      setSortDirection(field === "created_at" ? "desc" : "desc")
    }
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (field !== sortField) return null

    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block ml-1 h-4 w-4"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block ml-1 h-4 w-4"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Posts</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Search by User</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="pl-8"
              />
              {userFilter && userFilter !== "all" && (
                <button
                  onClick={() => setUserFilter("all")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isViewOpen && currentPost && (
        <Dialog open={true} onOpenChange={handleViewClose}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{currentPost.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">By {currentPost.user ? currentPost.user.name : "Unknown User"}</Badge>
                <Badge variant="secondary">{formatDate(currentPost.created_at)}</Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Content</h3>
                  <div className="p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">{currentPost.content}</div>
                </div>

                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentPost.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> {comments.length} comments
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-4">Comments</h3>

                  {isLoadingComments ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No comments on this post</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                {comment.user ? comment.user.name : "Unknown User"}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDelete(currentPost.id)}>
                Delete Post
              </Button>
              <Button onClick={handleViewClose}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort("created_at")}
              >
                Date {getSortIcon("created_at")}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort("views")}
              >
                Views {getSortIcon("views")}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No posts found</p>
                    {(searchTerm || userFilter !== "all") && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm("")
                          setUserFilter("all")
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.user?.name || 'Unknown'}</TableCell>
                  <TableCell>{formatDate(post.created_at)}</TableCell>
                  <TableCell>{post.views || 0}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(post)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
