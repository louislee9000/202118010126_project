import pool from '@/lib/db';

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  enrolled_students: number;
  created_at: string;
  updated_at: string;
}

// Get all courses
export async function getCoursesData(): Promise<Course[]> {
  const [rows] = await pool.execute('SELECT * FROM courses');
  return rows as Course[];
}

// Get a single course by ID
export async function getCourseById(id: string): Promise<Course | null> {
  const [rows] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);
  const courses = rows as Course[];
  return courses[0] || null;
}

// Create a new course
export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
  const now = new Date().toISOString();
  const [result] = await pool.execute(
    'INSERT INTO courses (title, category, description, instructor, duration, level, price, enrolled_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [course.title, course.category, course.description, course.instructor, course.duration, course.level, course.price, course.enrolled_students, now]
  );
  const insertId = (result as any).insertId;
  return getCourseById(insertId) as Promise<Course>;
}

// Update an existing course
export async function updateCourse(id: string, course: Partial<Course>): Promise<Course | null> {
  // 创建字段映射，将前端字段名映射到数据库字段名
  const fieldMapping: Record<string, string> = {
    enrolledStudents: 'enrolled_students',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  
  // 转换字段名
  const dbFields: Record<string, any> = {};
  Object.entries(course).forEach(([key, value]) => {
    const dbField = fieldMapping[key] || key;
    dbFields[dbField] = value;
  });
  
  const fields = Object.keys(dbFields).map(key => `${key} = ?`).join(', ');
  const values = Object.values(dbFields);
  values.push(id);
  
  await pool.execute(
    `UPDATE courses SET ${fields} WHERE id = ?`,
    values
  );
  
  return getCourseById(id);
}

// Delete a course
export async function deleteCourse(id: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

// Get enrolled students count for a course
export async function getEnrolledStudents(courseId: string): Promise<number> {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM user_enrolled_courses WHERE course_id = ?', [courseId]);
  return (rows as any)[0].count;
}

// Get courses by category
export async function getCoursesByCategory(category: string): Promise<Course[]> {
  const [rows] = await pool.execute('SELECT * FROM courses WHERE category = ?', [category]);
  return rows as Course[];
}

// Get courses by IDs
export async function getCoursesByIds(ids: string[]): Promise<Course[]> {
  const [rows] = await pool.execute('SELECT * FROM courses WHERE id IN (?)', [ids]);
  return rows as Course[];
}

// Get course statistics
export async function getCourseStatistics(): Promise<{
  totalCourses: number;
  totalStudents: number;
  categoryCounts: {
    frontend: number;
    backend: number;
    database: number;
  };
  levelCounts: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}> {
  const [rows] = await pool.execute(`
    SELECT 
      COUNT(*) as totalCourses,
      SUM(enrolled_students) as totalStudents,
      SUM(CASE WHEN category = 'frontend' THEN 1 ELSE 0 END) as frontendCount,
      SUM(CASE WHEN category = 'backend' THEN 1 ELSE 0 END) as backendCount,
      SUM(CASE WHEN category = 'database' THEN 1 ELSE 0 END) as databaseCount,
      SUM(CASE WHEN level = 'beginner' THEN 1 ELSE 0 END) as beginnerCount,
      SUM(CASE WHEN level = 'intermediate' THEN 1 ELSE 0 END) as intermediateCount,
      SUM(CASE WHEN level = 'advanced' THEN 1 ELSE 0 END) as advancedCount
    FROM courses
  `);
  
  const stats = (rows as any)[0];
  return {
    totalCourses: Number(stats.totalCourses),
    totalStudents: Number(stats.totalStudents),
    categoryCounts: {
      frontend: Number(stats.frontendCount),
      backend: Number(stats.backendCount),
      database: Number(stats.databaseCount)
    },
    levelCounts: {
      beginner: Number(stats.beginnerCount),
      intermediate: Number(stats.intermediateCount),
      advanced: Number(stats.advancedCount)
    }
  };
}
