// This file now contains only the types and client-side functions
import { Question } from '@/types/question';

// Client-side function to fetch questions via API
export async function fetchQuestions(params?: { courseId?: string; difficulty?: string; questionType?: string }): Promise<Question[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let url = `${baseUrl}/api/questions`

  if (params) {
    const queryParams = new URLSearchParams()
    if (params.courseId) queryParams.append("courseId", params.courseId)
    if (params.difficulty) queryParams.append("difficulty", params.difficulty)
    if (params.questionType) queryParams.append("questionType", params.questionType)

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch questions")
  }
  return response.json()
}

// Get a single question by ID (client-side)
export async function fetchQuestionById(id: string): Promise<Question | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/questions/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error("Failed to fetch question")
  }
  return response.json()
}

// Create a new question (client-side)
export async function createQuestionClient(questionData: Partial<Question>): Promise<Question> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(questionData),
  })

  if (!response.ok) {
    throw new Error("Failed to create question")
  }

  const data = await response.json()
  return data.question
}

// Update an existing question (client-side)
export async function updateQuestionClient(id: string, questionData: Partial<Question>): Promise<Question> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/questions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(questionData),
  })

  if (!response.ok) {
    throw new Error("Failed to update question")
  }

  const data = await response.json()
  return data.question
}

// Delete a question (client-side)
export async function deleteQuestionClient(id: string): Promise<Question> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/questions/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete question")
  }

  const data = await response.json()
  return data.question
}

// Get questions by course ID (client-side)
export async function fetchQuestionsByCourseId(courseId: string): Promise<Question[]> {
  return fetchQuestions({ courseId })
}

// Get questions by difficulty (client-side)
export async function fetchQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
  return fetchQuestions({ difficulty })
}

// Get question statistics (client-side)
export async function fetchQuestionStatistics() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/questions/statistics`)
  if (!response.ok) {
    throw new Error("Failed to fetch question statistics")
  }
  return response.json()
}

// Placeholder for server-side functions that will be called from API routes
export function getQuestionsData(): Question[] {
  return []
}

export function getQuestionById(id: string): Question | undefined {
  return undefined
}

export function createQuestion(questionData: any): Question {
  return {} as Question
}

export function updateQuestion(id: string, questionData: any): Question | null {
  return null
}

export function deleteQuestion(id: string): Question | null {
  return null
}

export function getQuestionsByCourseId(courseId: string): Question[] {
  return []
}

export function getQuestionsByDifficulty(difficulty: string): Question[] {
  return []
}

export function getQuestionStatistics() {
  return {}
}
