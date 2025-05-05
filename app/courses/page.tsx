import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCourses } from "@/lib/course-data"

// Make this a Server Component that can use async/await
export default async function CoursesPage() {
  // Fetch courses using the new async function
  const courses = await fetchCourses()

  // Group courses by category
  const frontendCourses = courses.filter((course) => course.category === "frontend")
  const backendCourses = courses.filter((course) => course.category === "backend")
  const databaseCourses = courses.filter((course) => course.category === "database")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          Explore our comprehensive collection of programming courses designed to help you master new skills.
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="frontend" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frontendCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backend" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backendCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databaseCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <Card className="flex flex-col h-full">
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
            <span className="text-sm text-muted-foreground">Level:</span>
            <Badge variant="outline" className="capitalize">{course.level}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Duration:</span>
            <span className="text-sm font-medium">{course.duration}</span>
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full">View Course</Button>
        </Link>
      </div>
    </Card>
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

