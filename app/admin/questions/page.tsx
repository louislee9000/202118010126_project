import { fetchQuestions } from "@/lib/question-data"
import { fetchCourses } from "@/lib/course-data"
import QuestionManagement from "@/components/question-management"

export default async function QuestionsPage() {
  // Fetch questions and courses data
  const questions = await fetchQuestions()
  const courses = await fetchCourses()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Question Bank Management</h1>
      </div>

      <QuestionManagement initialQuestions={questions} initialCourses={courses} />
    </div>
  )
}

