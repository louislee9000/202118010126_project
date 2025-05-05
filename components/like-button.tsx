"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { likePost, unlikePost } from "@/app/actions/post-actions"
import { likeComment, unlikeComment } from "@/app/actions/comment-actions"
import { useRouter } from "next/navigation"
import { checkClientSession } from "@/lib/client-auth"

interface LikeButtonProps {
  type: "post" | "comment"
  id: string
  initialLikes: number
  className?: string
  size?: "default" | "sm"
}

export default function LikeButton({ 
  type, 
  id, 
  initialLikes = 0, 
  className = "",
  size = "default"
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const router = useRouter()

  async function handleToggleLike() {
    if (isProcessing) return
    
    // Check if user is logged in
    const session = await checkClientSession()
    if (!session) {
      router.push('/login')
      return
    }
    
    setIsProcessing(true)
    
    try {
      let response;
      
      if (hasLiked) {
        // If already liked, unlike it
        response = type === "post" 
          ? await unlikePost(id) 
          : await unlikeComment(id)
          
        if (response.success) {
          setLikes(prev => Math.max(0, prev - 1))
          setHasLiked(false)
        }
      } else {
        // If not liked, like it
        response = type === "post" 
          ? await likePost(id) 
          : await likeComment(id)
          
        if (response.success) {
          setLikes(prev => prev + 1)
          setHasLiked(true)
        }
      }
      
      if (response && !response.success) {
        console.error("Error toggling like:", response.error)
      }
      
      router.refresh()
    } catch (error) {
      console.error(`Error toggling like for ${type}:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={`gap-1 ${hasLiked ? 'text-primary' : ''} ${className}`}
      onClick={handleToggleLike}
      disabled={isProcessing}
    >
      <ThumbsUp className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} ${hasLiked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </Button>
  )
} 