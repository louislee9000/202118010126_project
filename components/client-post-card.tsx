"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import { type Post } from "@/lib/post-data"

// Helper function to format date
const formatDate = (date: string) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface PostCardProps {
  post: Post
  comments?: number
}

export function ClientPostCard({ post, comments = 0 }: PostCardProps) {
  const formattedDate = formatDate(post.created_at)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">
            <Link href={`/community/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </CardTitle>
        </div>
        <CardDescription>
          Posted by {post.user?.name || "Unknown User"} • {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{post.content}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> {comments} comments
          </span>
        </div>
        <Link href={`/community/${post.id}`}>
          <Button variant="ghost" size="sm">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}