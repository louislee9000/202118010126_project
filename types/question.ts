export interface Question {
  id: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'programming' | 'multiple_choice' | 'true_false';
  code?: string;
  solution?: string;
  options?: {
    options: string[];
    correct_answer: number;
  };
  correctAnswer?: string;
  createdAt: string;
  updatedAt: string;
} 