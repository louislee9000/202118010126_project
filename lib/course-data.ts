// This file now contains only the types and client-side functions

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  category: string
  enrolledStudents: number
  createdAt: string
}

// Client-side function to fetch courses via API
export async function fetchCourses(): Promise<Course[]> {
  // Get the base URL from the environment or use a default for local development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/courses`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  return response.json();
}

// Get a single course by ID (client-side)
export async function fetchCourseById(id: string): Promise<Course | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/courses/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch course");
  }
  return response.json();
}

// Get courses by category (client-side)
export async function fetchCoursesByCategory(category: string): Promise<Course[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/courses?category=${category}`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses by category");
  }
  return response.json();
}

// Get course statistics (client-side)
export async function fetchCourseStatistics() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/courses/statistics`);
  if (!response.ok) {
    throw new Error("Failed to fetch course statistics");
  }
  return response.json();
}

export function getCoursesData(): Course[] {
  return []
}

export function getCourseById(id: string): Course | undefined {
  const courses = getCoursesData()
  return courses.find(course => course.id === id)
}
