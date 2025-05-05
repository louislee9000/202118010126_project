import pool from '@/lib/db';
import { getUserById } from "./data"
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, FieldPacket } from 'mysql2';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PostTag {
  post_id: string;
  tag: string;
}

// Helper function to read posts data
export async function getPostsData(
  userId?: string,
  withUserInfo: boolean = false,
  withCommentCount: boolean = false
): Promise<Post[]> {
  const connection = await pool.getConnection()
  try {
    let query = `
      SELECT 
        p.*,
        ${withUserInfo ? 'u.name, u.email,' : ''}
        GROUP_CONCAT(pt.tag) as tags
      FROM posts p
      ${withUserInfo ? 'LEFT JOIN users u ON p.user_id = u.id' : ''}
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      ${userId ? 'WHERE p.user_id = ?' : ''}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const [rows] = await connection.query(query, userId ? [userId] : [])
    return (rows as any[]).map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      user: withUserInfo && row.name ? {
        id: row.user_id,
        name: row.name,
        email: row.email
      } : undefined
    })) as Post[]
  } catch (error) {
    console.error('Error in getPostsData:', error)
    throw error
  } finally {
    connection.release()
  }
}

// Helper function to write posts data
export async function writePostsData(data: any) {
  try {
    await pool.execute('UPDATE posts SET title = ?, content = ?, likes = ?, views = ?, updated_at = ? WHERE id = ?', [data.title, data.content, data.likes, data.views, data.updated_at, data.id]);
    return true;
  } catch (error) {
    console.error("Error writing posts data:", error);
    return false;
  }
}

// Get a single post by ID
export async function getPost(id: string, withUserInfo: boolean = false, withCommentCount: boolean = false): Promise<Post | null> {
  const connection = await pool.getConnection()
  try {
    let query = `
      SELECT p.*
      ${withUserInfo ? ', u.name as user_name, u.email as user_email' : ''}
      ${withCommentCount ? ', (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentCount' : ''}
      FROM posts p
      ${withUserInfo ? 'LEFT JOIN users u ON p.user_id = u.id' : ''}
      WHERE p.id = ?
    `
    
    const [rows] = await connection.query<RowDataPacket[]>(query, [id])
    if (rows.length === 0) {
      return null
    }
    
    const post = rows[0] as Post
    if (withCommentCount) {
      post.commentCount = Number(post.commentCount)
    }
    
    return post
  } finally {
    connection.release()
  }
}

// Export getPost as getPostById for API routes
export const getPostById = getPost;

// Get posts by user ID
export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE user_id = ?', [userId]);
  return rows as Post[];
}

// Create a new post
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  const now = new Date();
  // Format date as YYYY-MM-DD for MySQL DATE type
  const formattedDate = now.toISOString().split('T')[0];
  const postId = uuidv4();
  const connection = await pool.getConnection();

  try {
    console.log('Starting transaction for post creation:', { 
      postId, 
      userId: post.user_id,
      date: formattedDate 
    });
    
    await connection.beginTransaction();

    try {
      // Insert the post with properly formatted dates
      const [insertResult] = await connection.execute(
        'INSERT INTO posts (id, user_id, title, content, likes, views, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [postId, post.user_id, post.title, post.content, post.likes || 0, post.views || 0, formattedDate, formattedDate]
      );
      console.log('Post inserted successfully:', insertResult);

      // Add tags if provided
      if (post.tags && post.tags.length > 0) {
        console.log('Adding tags to post:', post.tags);
        for (const tag of post.tags) {
          await connection.execute(
            'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
            [postId, tag]
          );
          console.log('Tag added successfully:', tag);
        }
        console.log('All tags added successfully');
      }

      await connection.commit();
      console.log('Transaction committed successfully');

      // Get the created post with tags
      const [rows] = await connection.execute(`
        SELECT 
          p.*,
          GROUP_CONCAT(pt.tag) as tags
        FROM posts p
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        WHERE p.id = ?
        GROUP BY p.id
      `, [postId]) as [RowDataPacket[], FieldPacket[]];

      const createdPost = rows[0] as Post & { tags: string };
      return {
        ...createdPost,
        tags: createdPost.tags ? createdPost.tags.split(',') : []
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error in transaction, rolling back:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Update an existing post
export async function updatePost(id: string, post: Partial<Post>): Promise<Post | null> {
  const fields = Object.keys(post).map(key => `${key} = ?`).join(', ');
  const values = Object.values(post);
  values.push(id);
  
  await pool.execute(
    `UPDATE posts SET ${fields} WHERE id = ?`,
    values
  );
  
  return getPost(id);
}

// Delete a post
export async function deletePost(id: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

// Get post statistics
export async function getPostStatistics(): Promise<{
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  averageLikes: number;
  averageViews: number;
}> {
  const [rows] = await pool.execute(`
    SELECT 
      COUNT(*) as totalPosts,
      SUM(likes) as totalLikes,
      SUM(views) as totalViews,
      AVG(likes) as averageLikes,
      AVG(views) as averageViews
    FROM posts
  `);
  
  const stats = (rows as any)[0];
  return {
    totalPosts: Number(stats.totalPosts),
    totalLikes: Number(stats.totalLikes),
    totalViews: Number(stats.totalViews),
    averageLikes: Number(stats.averageLikes),
    averageViews: Number(stats.averageViews)
  };
}

// Get posts with user information
export async function getPostsWithUserInfo() {
  // First, get posts with user info
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
  `);

  // Get all post tags in a single query
  const [tagRows] = await pool.execute(`
    SELECT post_id, tag
    FROM post_tags
  `);

  // Create a map of post IDs to their tags
  const postTagsMap = new Map<string, string[]>();
  (tagRows as PostTag[]).forEach(row => {
    if (!postTagsMap.has(row.post_id)) {
      postTagsMap.set(row.post_id, []);
    }
    postTagsMap.get(row.post_id)!.push(row.tag);
  });

  // Combine posts with their tags and user info
  return (rows as any[]).map(row => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    content: row.content,
    likes: row.likes,
    views: row.views,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: postTagsMap.get(row.id) || [],
    user: row.user_name ? {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    } : undefined
  }));
}