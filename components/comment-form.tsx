"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createCommentClient } from "@/lib/comment-data"
import { checkClientSession } from "@/lib/client-auth"
import { useRouter } from "next/navigation"

interface CommentFormProps {
  postId: string
  onCommentAdded?: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!content.trim()) {
      setError("Comment content cannot be empty")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if user is logged in
      const session = await checkClientSession()
      
      if (!session?.user) {
        console.log("Comment submission: No user found, redirecting to login")
        router.push(`/login?callbackUrl=/community/${postId}`)
        return
      }

      // Submit comment
      await createCommentClient({
        postId,
        userId: session.user.id,
        content: content.trim()
      })

      console.log("Comment submitted successfully")
      
      // Clear form and refresh data
      setContent("")
      
      // Refresh page to show new comment
      router.refresh()
      
      // Call optional callback
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      setError(error instanceof Error ? error.message : "Failed to submit comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Add a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea 
            placeholder="Share your thoughts..." 
            className="min-h-[100px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 