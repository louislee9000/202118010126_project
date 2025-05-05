import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Question } from '@/types/question';

// Database interface
interface DbQuestion {
  id: string;
  course_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: 'programming' | 'multiple_choice' | 'true_false';
  code?: string;
  solution?: string;
  options?: string; // JSON string
  correct_answer?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database question to frontend question
function transformQuestion(dbQuestion: DbQuestion): Question {
  let options = undefined;
  if (dbQuestion.options) {
    try {
      // Check if options is already an object or a string that needs parsing
      options = typeof dbQuestion.options === 'string' 
        ? JSON.parse(dbQuestion.options)
        : dbQuestion.options;
    } catch (e) {
      console.error('Error parsing options JSON:', e);
      console.error('Options value:', dbQuestion.options);
    }
  }

  return {
    id: dbQuestion.id,
    courseId: dbQuestion.course_id,
    title: dbQuestion.title,
    description: dbQuestion.description,
    difficulty: dbQuestion.difficulty,
    questionType: dbQuestion.question_type || 'programming', // Default to programming for backward compatibility
    code: dbQuestion.code,
    solution: dbQuestion.solution,
    options: options,
    correctAnswer: dbQuestion.correct_answer,
    createdAt: dbQuestion.created_at,
    updatedAt: dbQuestion.updated_at
  };
}

export async function getQuestionsData(): Promise<Question[]> {
  try {
    const [rows] = await pool.query('SELECT * FROM questions');
    return (rows as DbQuestion[]).map(transformQuestion);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE id = ?', [id]);
  const questions = rows as DbQuestion[];
  if (questions.length === 0) return null;
  return transformQuestion(questions[0]);
}

export async function getQuestionsByCourseId(courseId: string): Promise<Question[]> {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE course_id = ?', [courseId]);
  const questions = rows as DbQuestion[];
  return questions.map(transformQuestion);
}

export async function createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
  // Convert options object to JSON string if it exists
  const optionsJson = question.options ? JSON.stringify(question.options) : null;
  
  const [result] = await pool.execute(
    'INSERT INTO questions (id, course_id, title, description, difficulty, question_type, code, solution, options, correct_answer, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [
      question.courseId, 
      question.title, 
      question.description, 
      question.difficulty, 
      question.questionType || 'programming', 
      question.code || null, 
      question.solution || null,
      optionsJson,
      question.correctAnswer || null
    ]
  );
  
  const insertId = (result as any).insertId;
  return getQuestionById(insertId) as Promise<Question>;
}

export async function updateQuestion(id: string, question: Partial<Question>): Promise<Question | null> {
  // Convert options object to JSON string if it exists
  const optionsJson = question.options ? JSON.stringify(question.options) : undefined;
  
  const dbFields = {
    course_id: question.courseId,
    title: question.title,
    description: question.description,
    difficulty: question.difficulty,
    question_type: question.questionType,
    code: question.code,
    solution: question.solution,
    options: optionsJson,
    correct_answer: question.correctAnswer
  };
  
  const fields = Object.keys(dbFields)
    .filter(key => dbFields[key as keyof typeof dbFields] !== undefined)
    .map(key => `${key} = ?`)
    .join(', ');
    
  const values = Object.values(dbFields).filter(value => value !== undefined);
  values.push(id);
  
  await pool.execute(
    `UPDATE questions SET ${fields} WHERE id = ?`,
    values
  );
  
  return getQuestionById(id);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

export async function getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE difficulty = ?', [difficulty]);
  const questions = rows as DbQuestion[];
  return questions.map(transformQuestion);
}

export async function getQuestionsByType(questionType: string): Promise<Question[]> {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE question_type = ?', [questionType]);
  const questions = rows as DbQuestion[];
  return questions.map(transformQuestion);
}

export async function getQuestionStatistics(): Promise<{
  totalQuestions: number
  difficultyCount: {
    easy: number
    medium: number
    hard: number
  }
  typeCount: {
    programming: number
    multiple_choice: number
    true_false: number
  }
}> {
  try {
    console.log('Fetching question statistics...')
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalQuestions,
        SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easyCount,
        SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as mediumCount,
        SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hardCount,
        SUM(CASE WHEN question_type = 'programming' THEN 1 ELSE 0 END) as programmingCount,
        SUM(CASE WHEN question_type = 'multiple_choice' THEN 1 ELSE 0 END) as multipleChoiceCount,
        SUM(CASE WHEN question_type = 'true_false' THEN 1 ELSE 0 END) as trueFalseCount
      FROM questions
    `)
    console.log('Raw statistics result:', rows)

    const result = rows[0]
    console.log('Processed statistics result:', result)

    const stats = {
      totalQuestions: Number(result.totalQuestions) || 0,
      difficultyCount: {
        easy: Number(result.easyCount) || 0,
        medium: Number(result.mediumCount) || 0,
        hard: Number(result.hardCount) || 0
      },
      typeCount: {
        programming: Number(result.programmingCount) || 0,
        multiple_choice: Number(result.multipleChoiceCount) || 0,
        true_false: Number(result.trueFalseCount) || 0
      }
    }
    console.log('Final statistics:', stats)
    return stats
  } catch (error) {
    console.error('Error getting question statistics:', error)
    return {
      totalQuestions: 0,
      difficultyCount: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      typeCount: {
        programming: 0,
        multiple_choice: 0,
        true_false: 0
      }
    }
  }
}
