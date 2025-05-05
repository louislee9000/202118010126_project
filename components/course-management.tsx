"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Plus, Search, X, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import CourseForm from "./course-form"

export default function CourseManagement({ initialCourses = [] }) {
  const [courses, setCourses] = useState(initialCourses || [])
  const [filteredCourses, setFilteredCourses] = useState(initialCourses || [])
  const [isLoading, setIsLoading] = useState(!initialCourses)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch courses
  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/courses?t=${Date.now()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      const data = await response.json()
      setCourses(data)
      applyFilters(data, searchTerm, activeTab)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (courseList, search, category) => {
    let filtered = [...courseList]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase()) ||
          course.instructor.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter((course) => course.category === category)
    }

    setFilteredCourses(filtered)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    applyFilters(courses, searchTerm, activeTab)
  }, [searchTerm, activeTab])

  // Handle edit course
  const handleEdit = (course) => {
    setCurrentCourse(course)
    setIsFormOpen(true)
  }

  // Handle delete course
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/courses/${id}`, {
          method: "DELETE",
        })
        // Force refresh with a small delay
        setTimeout(() => {
          fetchCourses()
        }, 500)
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  // Handle add new course
  const handleAddNew = () => {
    setCurrentCourse(null)
    setIsFormOpen(true)
  }

  // Handle form close
  const handleFormClose = (shouldRefresh = false) => {
    setIsFormOpen(false)
    setCurrentCourse(null)
    if (shouldRefresh) {
      // Force refresh with a small delay
      setTimeout(() => {
        fetchCourses()
      }, 500)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case "frontend":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "backend":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "database":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Get level badge color
  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800"
      case "intermediate":
        return "bg-amber-100 text-amber-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Courses</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, or instructor..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <Button onClick={handleAddNew} className="h-10 md:ml-auto">
            <Plus className="mr-2 h-4 w-4" /> Add New Course
          </Button>
        </div>
      </Card>

      {isFormOpen && <CourseForm course={currentCourse} onClose={handleFormClose} />}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No courses found</p>
                    {searchTerm && (
                      <Button variant="link" onClick={clearSearch} className="mt-2">
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                  </TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(course)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

