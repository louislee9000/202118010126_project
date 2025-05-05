import pool from '@/lib/db';
import { getUserById } from "./data"
import { getPostById } from "./post-data"
import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

// Helper function to read comments data
export async function getCommentsData(): Promise<Comment[]> {
  const [rows] = await pool.execute('SELECT * FROM comments');
  return rows as Comment[];
}

// Helper function to write comments data
export async function writeCommentsData(data: any) {
  try {
    await pool.execute('INSERT INTO comments (post_id, user_id, content, likes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content), likes = VALUES(likes), updated_at = VALUES(updated_at)', [
      data.post_id,
      data.user_id,
      data.content,
      data.likes,
      data.created_at,
      data.updated_at
    ]);
    return true;
  } catch (error) {
    console.error("Error writing comments data:", error);
    return false;
  }
}

// Get a single comment by ID
export async function getCommentById(id: string): Promise<Comment | null> {
  const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [id]);
  const comments = rows as Comment[];
  return comments[0] || null;
}

// Get comments by post ID
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const [rows] = await pool.execute('SELECT * FROM comments WHERE post_id = ?', [postId]);
  return rows as Comment[];
}

// Get comments by user ID
export async function getCommentsByUserId(userId: string): Promise<Comment[]> {
  const [rows] = await pool.execute('SELECT * FROM comments WHERE user_id = ?', [userId]);
  return rows as Comment[];
}

// Create a new comment
export async function createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>): Promise<Comment> {
  const now = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  // Get the next available ID
  const [rows] = await pool.execute('SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM comments');
  const maxId = (rows as any[])[0].maxId || 0;
  const commentId = String(maxId + 1);
  
  const [result] = await pool.execute(
    'INSERT INTO comments (id, post_id, user_id, content, likes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [commentId, comment.post_id, comment.user_id, comment.content, comment.likes || 0, now, now]
  );

  const [newRows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
  const createdComment = (newRows as Comment[])[0];
  return createdComment;
}

// Update an existing comment
export async function updateComment(id: string, comment: Partial<Comment>): Promise<Comment | null> {
  const fields = Object.keys(comment).map(key => `${key} = ?`).join(', ');
  const values = Object.values(comment);
  values.push(id);
  
  await pool.execute(
    `UPDATE comments SET ${fields} WHERE id = ?`,
    values
  );
  
  return getCommentById(id);
}

// Delete a comment
export async function deleteComment(id: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

// Get comment statistics
export async function getCommentStatistics(): Promise<{
  totalComments: number;
  totalLikes: number;
  averageLikes: number;
}> {
  const [rows] = await pool.execute(`
    SELECT 
      COUNT(*) as totalComments,
      SUM(likes) as totalLikes,
      AVG(likes) as averageLikes
    FROM comments
  `);
  
  const stats = (rows as any)[0];
  return {
    totalComments: Number(stats.totalComments),
    totalLikes: Number(stats.totalLikes),
    averageLikes: Number(stats.averageLikes)
  };
}

// Get comments with user and post information
export async function getCommentsWithInfo() {
  const [rows] = await pool.execute(`
    SELECT 
      c.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      p.id as post_id,
      p.title as post_title
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN posts p ON c.post_id = p.id
  `);

  return (rows as any[]).map(row => ({
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    content: row.content,
    likes: row.likes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: row.user_id ? {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    } : null,
    post: row.post_id ? {
      id: row.post_id,
      title: row.post_title,
    } : null
  }));
}
