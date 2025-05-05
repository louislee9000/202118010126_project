"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MultiSelect } from "@/components/ui/multi-select"
import { createPostClient } from "@/lib/post-data"
import { checkClientSession } from "@/lib/client-auth"

export default function NewDiscussionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // One-time verification when dialog opens
  useEffect(() => {
    if (open && !isAuthenticated && !isVerifying) {
      const verifySession = async () => {
        setIsVerifying(true)
        try {
          console.log("Dialog opened, verifying session")
          const session = await checkClientSession()
          console.log("Dialog session verification result:", session)
          
          if (!session?.user) {
            console.log("Dialog: No user found, closing and redirecting")
            onOpenChange(false)
            router.push("/login?callbackUrl=/community")
            return
          }
          
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Dialog session verification failed:", error)
          onOpenChange(false)
        } finally {
          setIsVerifying(false)
        }
      }
      
      verifySession()
    }
    
    // Reset state when dialog closes
    if (!open) {
      setIsAuthenticated(false)
    }
  }, [open, router, onOpenChange, isAuthenticated, isVerifying])

  // 表单提交处理
  async function handleCreatePost(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      // 再次验证会话
      const session = await checkClientSession()
      
      if (!session?.user) {
        console.log("Form submission: No user found, redirecting")
        onOpenChange(false)
        router.push("/login?callbackUrl=/community")
        return
      }

      const title = formData.get("title") as string
      const content = formData.get("content") as string
      
      if (!title || !content) {
        throw new Error("Title and content are required")
      }

      console.log("Creating post with:", { title, content, tags: selectedTags })
      
      const post = await createPostClient({
        title,
        content,
        tags: selectedTags,
        user_id: session.user.id,
      })

      console.log("Post created successfully:", post.id)
      router.push(`/community/${post.id}`)
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating post:", error)
      setError(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 验证中显示加载状态
  if (open && isVerifying) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Start New Discussion</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <p>Verifying your account...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // 主对话框内容
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Start New Discussion</DialogTitle>
        </DialogHeader>
        <form action={handleCreatePost} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="What's your discussion about?"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share your thoughts..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <MultiSelect
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Search or create tags..."
              createTag={true}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Discussion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}