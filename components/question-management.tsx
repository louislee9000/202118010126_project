"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus, Search, X, Filter, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionForm from "./question-form"
import QuestionView from "./question-view"

interface Question {
  id: string
  title: string
  description: string
  courseId: string
  difficulty: "easy" | "medium" | "hard"
  createdAt: string
}

interface Course {
  id: string
  title: string
}

export default function QuestionManagement({ initialQuestions = [], initialCourses = [] }: { initialQuestions?: Question[], initialCourses?: Course[] }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || [])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions || [])
  const [courses, setCourses] = useState<Course[]>(initialCourses || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch questions and courses
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Fetch questions
      const questionsResponse = await fetch(`${baseUrl}/api/questions?t=${Date.now()}`)
      if (!questionsResponse.ok) {
        throw new Error(`Failed to fetch questions: ${questionsResponse.statusText}`)
      }
      const questions = await questionsResponse.json()
      console.log('Questions API response:', questions)
      
      // Ensure we have an array
      const questionList = Array.isArray(questions) ? questions : []
      console.log('Processed questions:', questionList)
      
      setQuestions(questionList)
      setFilteredQuestions(questionList)

      // Fetch courses
      const coursesResponse = await fetch(`${baseUrl}/api/courses?t=${Date.now()}`)
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.statusText}`)
      }
      const coursesData = await coursesResponse.json()
      console.log('Courses API response:', coursesData)
      
      // Ensure we have an array
      const courseList = Array.isArray(coursesData.courses) ? coursesData.courses : []
      console.log('Processed courses:', courseList)
      
      setCourses(courseList)

      // Apply filters with the new data
      applyFilters(questionList, searchTerm, courseFilter, difficultyFilter)
    } catch (error) {
      console.error("Error fetching data:", error)
      setQuestions([])
      setFilteredQuestions([])
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and pagination
  const applyFilters = (questionList: Question[], search: string, course: string, difficulty: string) => {
    console.log('Applying filters with:', { questionList, search, course, difficulty })
    let filtered = Array.isArray(questionList) ? [...questionList] : []
    console.log('Initial filtered array:', filtered)

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(search.toLowerCase()) ||
          question.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply course filter
    if (course !== "all") {
      filtered = filtered.filter((question) => question.courseId === course)
    }

    // Apply difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter((question) => question.difficulty === difficulty)
    }

    console.log('Final filtered array:', filtered)
    setFilteredQuestions(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Initial data fetch
  useEffect(() => {
    console.log('Initial effect running with:', { initialQuestions, initialCourses })
    if (initialQuestions.length === 0 || initialCourses.length === 0) {
      console.log('Fetching data from API')
      fetchData()
    } else {
      console.log('Using initial data')
      setQuestions(initialQuestions)
      setFilteredQuestions(initialQuestions)
      setCourses(initialCourses)
    }
  }, [initialQuestions, initialCourses])

  // Apply filters when search or filters change
  useEffect(() => {
    console.log('Filter effect running with:', { questions, searchTerm, courseFilter, difficultyFilter })
    applyFilters(questions, searchTerm, courseFilter, difficultyFilter)
  }, [searchTerm, courseFilter, difficultyFilter, questions])

  // Handle view question
  const handleView = (question: Question) => {
    setCurrentQuestion(question)
    setIsViewOpen(true)
  }

  // Handle edit question
  const handleEdit = (question: Question) => {
    setCurrentQuestion(question)
    setIsFormOpen(true)
  }

  // Handle delete question
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/questions/${id}`, {
          method: "DELETE",
        })
        // Force refresh with a small delay
        setTimeout(() => {
          fetchData()
        }, 500)
      } catch (error) {
        console.error("Error deleting question:", error)
      }
    }
  }

  // Handle add new question
  const handleAddNew = () => {
    setCurrentQuestion(null)
    setIsFormOpen(true)
  }

  // Handle form close
  const handleFormClose = (shouldRefresh = false) => {
    setIsFormOpen(false)
    setCurrentQuestion(null)
    if (shouldRefresh) {
      // Force refresh with a small delay
      setTimeout(() => {
        fetchData()
      }, 500)
    }
  }

  // Handle view close
  const handleViewClose = () => {
    setIsViewOpen(false)
    setCurrentQuestion(null)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find((course) => course.id === courseId)
    return course ? course.title : "Unknown Course"
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  // Render empty state
  if (!Array.isArray(filteredQuestions) || filteredQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Filter className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No questions found</p>
        {(searchTerm || courseFilter !== "all" || difficultyFilter !== "all") && (
          <Button
            variant="link"
            onClick={() => {
              setSearchTerm("")
              setCourseFilter("all")
              setDifficultyFilter("all")
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search Questions</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
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

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Course</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter by Difficulty</label>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddNew} className="h-10 md:ml-auto">
            <Plus className="mr-2 h-4 w-4" /> Add New Question
          </Button>
        </div>
      </Card>

      {isFormOpen && <QuestionForm question={currentQuestion} onClose={handleFormClose} courses={courses} />}

      {isViewOpen && (
        <QuestionView
          question={currentQuestion}
          onClose={handleViewClose}
          courseName={getCourseName(currentQuestion?.courseId)}
        />
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">{question.title}</TableCell>
                <TableCell>{getCourseName(question.courseId)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </span>
                </TableCell>
                <TableCell>{formatDate(question.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleView(question)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(question)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
