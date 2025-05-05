import { type NextRequest, NextResponse } from "next/server"
import { getQuestionById, updateQuestion, deleteQuestion } from "@/lib/server/question-data"

// GET a specific question
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Ensure params is properly resolved before accessing
    const resolvedParams = await Promise.resolve(context.params)
    const id = String(resolvedParams.id)
    console.log(`Fetching question with ID: ${id}`)
    
    const question = await getQuestionById(id)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error(`Error in GET /api/questions/${context.params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

// PUT (update) a specific question
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Ensure params is properly resolved before accessing
    const resolvedParams = await Promise.resolve(context.params)
    const id = String(resolvedParams.id)
    console.log(`Updating question with ID: ${id}`)
    
    const questionData = await request.json()
    const updatedQuestion = await updateQuestion(id, questionData)

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Question updated successfully", question: updatedQuestion })
  } catch (error) {
    console.error(`Error in PUT /api/questions/${context.params.id}:`, error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE a specific question
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Extract id from context params
    const id = String(context.params.id)
    console.log(`Deleting question with ID: ${id}`)
    
    const deletedQuestion = await deleteQuestion(id)

    if (!deletedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Question deleted successfully", question: deletedQuestion })
  } catch (error) {
    console.error(`Error in DELETE /api/questions/${context.params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
