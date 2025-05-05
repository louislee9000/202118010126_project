"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  BookOpen,
  Award,
  UserPlus,
  Database,
  Code,
  Layout,
  FileQuestion,
  MessageSquare,
  ThumbsUp,
  Eye,
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

interface Course {
  id: string
  title: string
  category: 'frontend' | 'backend' | 'database'
}

interface Post {
  id: string
  views: number
  likes: number
}

interface QuestionStats {
  totalQuestions: number
  difficultyCount: {
    easy: number
    medium: number
    hard: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    users: {
      count: 0,
      adminCount: 0,
      userCount: 0,
      recentUsers: [],
    },
    courses: {
      count: 0,
      frontendCount: 0,
      backendCount: 0,
      databaseCount: 0,
      totalStudents: 0,
    },
    questions: {
      count: 0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
    },
    community: {
      postCount: 0,
      commentCount: 0,
      totalViews: 0,
      totalLikes: 0,
    },
  })

  // Format date function
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-"

    try {
      // 直接返回日期部分，不包含时间
      return dateString.split('T')[0] || dateString
    } catch (error) {
      console.error("Error formatting date:", error)
      return "-"
    }
  }

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    // Fetch data
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

      // Fetch user data
      const userResponse = await fetch(`${baseUrl}/api/users`)
      const userData = await userResponse.json()
      console.log("User API Response:", userData)
      const users: User[] = userData.users || []
      console.log("Processed Users:", users)
      const userCount = users.length
      const adminCount = users.filter((user: User) => user.role === "admin").length
      const userCountFiltered = users.filter((user: User) => user.role === "user").length

      // Get recent users (last 5)
      const recentUsers = [...users]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      console.log("Recent Users:", recentUsers)

      // Fetch course data
      const courseResponse = await fetch(`${baseUrl}/api/courses`)
      const courses: Course[] = await courseResponse.json()
      console.log("Course API Response:", courses)
      const courseCount = courses.length
      const frontendCount = courses.filter((course: Course) => course.category === "frontend").length
      const backendCount = courses.filter((course: Course) => course.category === "backend").length
      const databaseCount = courses.filter((course: Course) => course.category === "database").length

      // Fetch enrolled students count
      const enrolledResponse = await fetch(`${baseUrl}/api/courses/enrolled-count`)
      const enrolledData = await enrolledResponse.json()
      console.log("Enrolled Students Count:", enrolledData)

      // Fetch question data
      const questionResponse = await fetch(`${baseUrl}/api/questions/statistics`)
      const questionData: QuestionStats = await questionResponse.json()
      console.log("Question Statistics API Response:", questionData)
      
      if ('error' in questionData) {
        console.error('Error from question statistics API:', questionData.error)
        throw new Error(questionData.error)
      }

      const questionCount = questionData.totalQuestions
      const easyCount = questionData.difficultyCount.easy
      const mediumCount = questionData.difficultyCount.medium
      const hardCount = questionData.difficultyCount.hard

      console.log('Processed question statistics:', {
        questionCount,
        easyCount,
        mediumCount,
        hardCount
      })

      // Fetch community data
      const postsResponse = await fetch(`${baseUrl}/api/posts`)
      const postsData = await postsResponse.json()
      console.log("Posts API Response:", postsData)
      const posts: Post[] = postsData.posts || []
      console.log("Processed Posts:", posts)
      const postCount = posts.length
      const totalViews = posts.reduce((acc: number, post: Post) => acc + (post.views || 0), 0)
      const totalLikes = posts.reduce((acc: number, post: Post) => acc + (post.likes || 0), 0)

      const commentsResponse = await fetch(`${baseUrl}/api/comments`)
      const commentsData = await commentsResponse.json()
      console.log("Comments API Response:", commentsData)
      const comments = commentsData.comments || []
      console.log("Processed Comments:", comments)
      const commentCount = comments.length

      setStats({
        users: {
          count: userCount,
          adminCount,
          userCount: userCountFiltered,
          recentUsers,
        },
        courses: {
          count: courseCount,
          frontendCount,
          backendCount,
          databaseCount,
          totalStudents: enrolledData.total || 0,
        },
        questions: {
          count: questionCount,
          easyCount,
          mediumCount,
          hardCount,
        },
        community: {
          postCount,
          commentCount,
          totalViews,
          totalLikes,
        },
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
          </Link>
          <Link href="/admin/questions">
            <Button variant="outline">
              <FileQuestion className="mr-2 h-4 w-4" />
              Manage Questions
            </Button>
          </Link>
          <Link href="/admin/community">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Manage Community
            </Button>
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.count}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.count - stats.users.adminCount} users, {stats.users.adminCount} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Ratio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.users.count > 0 ? Math.round((stats.users.adminCount / stats.users.count) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">of users are admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.recentUsers.length}</div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses.count}</div>
            <p className="text-xs text-muted-foreground">across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Course Categories</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.courses.frontendCount}</div>
                <p className="text-xs text-muted-foreground">Frontend</p>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.courses.backendCount}</div>
                <p className="text-xs text-muted-foreground">Backend</p>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{stats.courses.databaseCount}</div>
                <p className="text-xs text-muted-foreground">Database</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Course Subscriptions</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Total Course Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Question Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.questions.count}</div>
            <p className="text-xs text-muted-foreground">in the question bank</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Levels</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{stats.questions.easyCount}</div>
                <p className="text-xs text-muted-foreground">Easy</p>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{stats.questions.mediumCount}</div>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.questions.hardCount}</div>
                <p className="text-xs text-muted-foreground">Hard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions per Course</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.courses.count > 0 ? Math.round(stats.questions.count / stats.courses.count) : 0}
            </div>
            <p className="text-xs text-muted-foreground">average questions per course</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Community Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.community.postCount}</div>
            <p className="text-xs text-muted-foreground">user discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.community.commentCount}</div>
            <p className="text-xs text-muted-foreground">across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.community.totalLikes}</div>
            <p className="text-xs text-muted-foreground">community engagement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Join Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4 capitalize">{user.role}</td>
                      <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
