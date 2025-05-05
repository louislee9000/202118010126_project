import { getPostById } from "@/lib/server/post-data"
import { getCommentsByPostId } from "@/lib/server/comment-data"
import { getUserById } from "@/lib/server/data"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Calendar } from "lucide-react"
import CommentForm from "@/components/comment-form"
import LikeButton from "@/components/like-button"

// Helper function to format date
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export default async function PostPage({ params }: { params: { id: string } }) {
  // Extract and validate id parameter
  const { id } = await Promise.resolve(params)
  console.log(`Fetching community post with ID: ${id}`)
  
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  const comments = await getCommentsByPostId(post.id)
  const author = await getUserById(post.user_id)
  const formattedDate = formatDate(post.created_at)

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/community">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-sm font-bold text-primary">
                    {author?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{author?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{post.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} comments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

        <CommentForm postId={post.id} />

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(async (comment) => {
              const commentAuthor = await getUserById(comment.user_id)
              const commentDate = formatDate(comment.created_at)

              return (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <span className="text-sm font-bold text-primary">
                          {commentAuthor?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{commentAuthor?.name || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{commentDate}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{comment.content}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <LikeButton 
                        type="comment" 
                        id={comment.id} 
                        initialLikes={comment.likes || 0} 
                        size="sm" 
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
