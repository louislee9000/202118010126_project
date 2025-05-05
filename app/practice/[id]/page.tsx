import { fetchQuestionById } from "@/lib/question-data"
import { notFound } from "next/navigation"
import PracticeQuestion from "@/components/practice-question"
import AuthCheck from "@/components/auth-check"

export default async function QuestionPage({ params }: { params: { id: string } }) {
  // Ensure params is properly resolved before accessing
  const resolvedParams = await Promise.resolve(params)
  const id = String(resolvedParams.id)
  console.log(`Fetching practice question with ID: ${id}`)
  
  const question = await fetchQuestionById(id)

  if (!question) {
    notFound()
  }

  return (
    <AuthCheck>
      <PracticeQuestion question={question} />
    </AuthCheck>
  )
}
