import { fetchCourses } from "@/lib/course-data"
import CourseManagement from "@/components/course-management"

export default async function CoursesPage() {
  // Fetch courses data
  const courses = await fetchCourses()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Management</h1>
      </div>

      <CourseManagement initialCourses={courses} />
    </div>
  )
}

