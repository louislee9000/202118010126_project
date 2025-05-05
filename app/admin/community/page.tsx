import { fetchPosts, Post } from "@/lib/post-data"
import { fetchComments, Comment } from "@/lib/comment-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostManagement from "@/components/post-management"
import CommentManagement from "@/components/comment-management"

export default async function CommunityPage() {
  let posts: Post[] = []
  let comments: Comment[] = []
  let error: string | null = null

  try {
    // Fetch posts and comments data
    posts = await fetchPosts({ withUserInfo: true })
    comments = await fetchComments({ withInfo: true })
  } catch (err) {
    console.error('Error in CommunityPage:', err)
    error = err instanceof Error ? err.message : 'Failed to load data'
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <PostManagement posts={posts} />
        </TabsContent>

        <TabsContent value="comments">
          <CommentManagement comments={comments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

