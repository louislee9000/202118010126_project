import { NextResponse } from 'next/server';
import { getUsersData } from '@/lib/server/user-data';
import { getCoursesData } from '@/lib/server/course-data';
import { getQuestionsData } from '@/lib/server/question-data';

export async function GET() {
  try {
    const [users, courses, questions] = await Promise.all([
      getUsersData(),
      getCoursesData(),
      getQuestionsData()
    ]);

    return NextResponse.json({
      users: users.length,
      courses: courses.length,
      questions: questions.length
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 