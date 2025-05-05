'use client'

import { formatDistanceToNow } from "date-fns"
import { fetchPosts, type Post } from "@/lib/post-data"
import { fetchComments } from "@/lib/comment-data"
import { ClientPostCard } from "@/components/client-post-card"
import NewDiscussionButton from "@/components/new-discussion-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'

interface TagCount {
  tag: string
  count: number
}

// Helper function to get popular tags from posts
function getPopularTags(posts: Post[]): TagCount[] {
  const tagCounts: Record<string, number> = {}

  posts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  // Return both tags and their counts
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))
}

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [popularTags, setPopularTags] = useState<TagCount[]>([])

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    // If search term is empty, show all posts
    if (!term.trim()) {
      setFilteredPosts(allPosts)
      return
    }

    // Filter posts by title and tags
    const filtered = allPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(term)
      const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(term))
      return titleMatch || tagMatch
    })

    setFilteredPosts(filtered)
  }

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Fetch posts with user info
        const posts = await fetchPosts({ withUserInfo: true })
        
        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        // Get comment counts for each post
        const counts: Record<string, number> = {}
        for (const post of sortedPosts) {
          const comments = await fetchComments({ postId: post.id })
          counts[post.id] = comments.length
        }

        // Get popular tags
        const tags = getPopularTags(sortedPosts)

        setAllPosts(sortedPosts)
        setFilteredPosts(sortedPosts)
        setCommentCounts(counts)
        setPopularTags(tags)
      } catch (error) {
        console.error('Failed to initialize page:', error)
      }
    }

    initializePage()
  }, []) // Empty dependency array means this effect runs once on mount

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Discussions</h2>
            <NewDiscussionButton />
          </div>

          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No discussions found. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <ClientPostCard key={post.id} post={post} comments={commentCounts[post.id] || 0} />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title or tag"
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <span className="text-xs text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• Be respectful and constructive</p>
                <p className="text-sm">• Stay on topic and relevant</p>
                <p className="text-sm">• No spam or self-promotion</p>
                <p className="text-sm">• Share code with proper formatting</p>
                <p className="text-sm">• Help others when you can</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

