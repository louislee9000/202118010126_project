import { getQuestionsData } from "@/lib/server/question-data";
import { getCoursesData } from "@/lib/server/course-data";
import PracticeList from "@/components/practice-list";

export default async function PracticePage() {
  const [questions, courses] = await Promise.all([
    getQuestionsData(),
    getCoursesData()
  ]);

  return <PracticeList initialQuestions={questions} initialCourses={courses} />;
}

