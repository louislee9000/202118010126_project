"use client"

import { useState, useEffect } from "react"
import { isUserLoggedIn } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, Users, MessageSquare, Code } from "lucide-react"
import Link from "next/link"
import { fetchCourses } from "@/lib/course-data"

interface Stats {
  users: number;
  courses: number;
  questions: number;
}

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  enrolledStudents: number;
}

export default function HomePage() {
  // Client-side state
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({ users: 0, courses: 0, questions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isUserLoggedIn());

    // Get course and stats data
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesData = await fetchCourses();
        setCourses(coursesData);

        // Get featured courses (top 3 by enrolled students)
        const featured = [...coursesData].sort((a, b) => b.enrolledStudents - a.enrolledStudents).slice(0, 3);
        setFeaturedCourses(featured);

        // Fetch stats from API
        const response = await fetch('/api/stats');
        const statsData = await response.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state before client-side rendering
  if (!mounted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Master Programming Skills Online</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-[800px]">
          Learn from expert instructors, practice with real-world coding challenges, and join a community of developers.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/courses">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Explore Courses
            </Button>
          </Link>
          <Link href="/community">
            <Button size="lg" variant="outline" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Join Community
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.users}</div>
            <p className="text-xs text-muted-foreground">Active on our platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.courses}</div>
            <p className="text-xs text-muted-foreground">Across multiple technologies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice Questions</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.questions}</div>
            <p className="text-xs text-muted-foreground">Hands-on coding challenges</p>
          </CardContent>
        </Card>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Courses</h2>
          <Link href="/courses">
            <Button variant="ghost" className="gap-2">
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{course.title}</CardTitle>
                  <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Instructor:</span>
                    <span className="text-sm font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Level:</span>
                    <span className="text-sm font-medium capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Students:</span>
                    <span className="text-sm font-medium">{course.enrolledStudents}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full">View Course</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-primary/5 rounded-lg my-12">
        <div className="text-center max-w-[800px] mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students already learning on our platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!isLoggedIn ? (
              <>
                <Link href="/register">
                  <Button size="lg">Sign Up</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    User Login
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper function to get category badge color
function getCategoryColor(category: string) {
  switch (category) {
    case "frontend":
      return "bg-blue-100 text-blue-800"
    case "backend":
      return "bg-green-100 text-green-800"
    case "database":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

