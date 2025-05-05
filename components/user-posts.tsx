"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { fetchPostsByUserId } from "@/lib/post-data"
import { fetchCommentsByPostId } from "@/lib/comment-data"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface UserPostsProps {
  userId: string
}

export default function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchUserPosts() {
      if (!userId) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch user's posts
        const userPosts = await fetchPostsByUserId(userId)
        setPosts(userPosts)
        
        // Get comment counts for each post
        const counts: Record<string, number> = {}
        
        for (const post of userPosts) {
          try {
            const comments = await fetchCommentsByPostId(post.id)
            counts[post.id] = comments.length
          } catch (err) {
            console.error(`Error fetching comments for post ${post.id}:`, err)
            counts[post.id] = 0
          }
        }
        
        setCommentCounts(counts)
      } catch (err) {
        console.error("Error fetching user posts:", err)
        setError("Failed to load your posts. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserPosts()
  }, [userId])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (err) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Discussions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Discussions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>My Discussions</CardTitle>
        <Link href="/community">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't started any discussions yet.</p>
            <Link href="/community">
              <Button>Start a Discussion</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="border rounded-md p-4 hover:bg-accent transition-colors">
                <Link href={`/community/${post.id}`}>
                  <h3 className="font-medium mb-2 hover:text-primary">{post.title}</h3>
                </Link>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags && post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {post.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {commentCounts[post.id] || 0}
                  </span>
                </div>
              </div>
            ))}
            
            {posts.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/community">
                  <Button variant="outline" size="sm">View More Posts</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 