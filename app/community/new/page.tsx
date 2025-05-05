import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default async function NewDiscussionPage() {
  // Check if user is authenticated
  const session = await getSession()
  if (!session?.user) {
    redirect("/login?callbackUrl=/community/new")
  }

  async function handleCreatePost(formData: FormData) {
    "use server"
    
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const tags = formData.get("tags") as string
    
    if (!title || !content) {
      throw new Error("Title and content are required")
    }

    // Get session again to ensure we have it
    const currentSession = await getSession()
    if (!currentSession?.user) {
      redirect("/login?callbackUrl=/community/new")
    }

    // Convert tags string to array and trim whitespace
    const tagArray = tags
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : []

    // Use fetch API to create the post
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        tags: tagArray,
        user_id: currentSession.user.id,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create post")
    }

    const data = await response.json()
    redirect(`/community/${data.post.id}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Start New Discussion</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Input
                id="tags"
                name="tags"
                placeholder="Add tags separated by commas (e.g. javascript, react, help)"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Discussion
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}