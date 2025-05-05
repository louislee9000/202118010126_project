import { type NextRequest, NextResponse } from "next/server"
import { getQuestionsData, createQuestion, getQuestionsByCourseId, getQuestionsByDifficulty } from "@/lib/server/question-data"

// GET all questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const difficulty = searchParams.get("difficulty")

    let questions;

    // Filter by courseId if provided
    if (courseId) {
      questions = await getQuestionsByCourseId(courseId);
    } 
    // Filter by difficulty if provided
    else if (difficulty) {
      questions = await getQuestionsByDifficulty(difficulty);
    }
    // Get all questions if no filters
    else {
      questions = await getQuestionsData();
    }

    // Return the questions array directly
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error in GET /api/questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

// POST new question
export async function POST(request: NextRequest) {
  try {
    const questionData = await request.json()
    const newQuestion = createQuestion(questionData)

    return NextResponse.json({ message: "Question created successfully", question: newQuestion })
  } catch (error) {
    console.error("Error in POST /api/questions:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
