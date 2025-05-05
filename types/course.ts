export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  enrolledStudents: number;
  createdAt: string;
  updatedAt: string;
} 