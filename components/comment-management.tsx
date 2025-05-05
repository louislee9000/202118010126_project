"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search, X, Filter, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function CommentManagement() {
  const [comments, setComments] = useState([])
  const [filteredComments, setFilteredComments] = useState([])
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [currentComment, setCurrentComment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [postFilter, setPostFilter] = useState("all")
  const [error, setError] = useState(null)

  // Fetch comments, users, and posts
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch comments with user and post info
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const commentsResponse = await fetch(`${baseUrl}/api/comments?withInfo=true`)
      const commentsData = await commentsResponse.json()

      // Fetch users
      const usersResponse = await fetch(`${baseUrl}/api/users`)
      const usersData = await usersResponse.json()

      // Fetch posts
      const postsResponse = await fetch(`${baseUrl}/api/posts`)
      const postsData = await postsResponse.json()

      setComments(commentsData.comments)
      setUsers(usersData.users)
      setPosts(postsData.posts)
      applyFilters(commentsData.comments, searchTerm, userFilter, postFilter)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load comments. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (commentList, search, user, post) => {
    let filtered = [...commentList]

    // Apply search filter
    if (search) {
      filtered = filtered.filter((comment) => comment.content.toLowerCase().includes(search.toLowerCase()))
    }

    // Apply user search filter
    if (user && user !== "all") {
      filtered = filtered.filter(
        (comment) => comment.user && comment.user.name && comment.user.name.toLowerCase().includes(user.toLowerCase()),
      )
    }

    // Apply post filter
    if (post !== "all") {
      filtered = filtered.filter((comment) => comment.postId === post)
    }

    setFilteredComments(filtered)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters(comments, searchTerm, userFilter, postFilter)
  }, [searchTerm, userFilter, postFilter, comments])

  // Handle view comment
  const handleView = (comment) => {
    setCurrentComment(comment)
    setIsViewOpen(true)
  }

  // Handle delete comment
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/comments/${id}`, {
          method: "DELETE",
        })
        fetchData()
      } catch (error) {
        console.error("Error deleting comment:", error)
        setError("Failed to delete comment. Please try again.")
      }
    }
  }

  // Handle view close
  const handleViewClose = () => {
    setIsViewOpen(false)
    setCurrentComment(null)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setUserFilter("all")
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Comments</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by content..." value={searchTerm} onChange={handleSearch} className="pl-8" />
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

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Post</label>
            <Select value={postFilter} onValueChange={setPostFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                {posts.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isViewOpen && currentComment && (
        <Dialog open={true} onOpenChange={handleViewClose}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-lg">Comment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Author</h3>
                <div className="p-2 bg-gray-50 rounded-md text-sm">
                  {currentComment.user ? currentComment.user.name : "Unknown User"}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Post</h3>
                <div className="p-2 bg-gray-50 rounded-md text-sm">
                  {currentComment.post ? currentComment.post.title : "Unknown Post"}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Content</h3>
                <div className="p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">{currentComment.content}</div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Posted on: {formatDate(currentComment.createdAt)}</span>
                <span>Likes: {currentComment.likes || 0}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="destructive" onClick={() => handleDelete(currentComment.id)}>
                Delete Comment
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
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No comments found</p>
                    {(searchTerm || userFilter !== "all" || postFilter !== "all") && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm("")
                          setUserFilter("all")
                          setPostFilter("all")
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
              filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-xs truncate">
                    {comment.content.length > 50 ? comment.content.substring(0, 50) + "..." : comment.content}
                  </TableCell>
                  <TableCell>{comment.user ? comment.user.name : "Unknown User"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {comment.post
                      ? comment.post.title.length > 30
                        ? comment.post.title.substring(0, 30) + "..."
                        : comment.post.title
                      : "Unknown Post"}
                  </TableCell>
                  <TableCell>{formatDate(comment.createdAt)}</TableCell>
                  <TableCell>{comment.likes || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleView(comment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(comment.id)}>
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
