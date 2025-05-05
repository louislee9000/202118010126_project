import pool from '@/lib/db';
import crypto from 'crypto';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  enrolled_courses: number;
  join_date: string | null;
  bio: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Get all users
export async function getUsersData(): Promise<User[]> {
  const [rows] = await pool.execute('SELECT * FROM users');
  return rows as User[];
}

// Get a single user by ID
export async function getUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  const users = rows as User[];
  return users[0] || null;
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  const users = rows as User[];
  return users[0] || null;
}

// Create a new user
export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: number }): Promise<User> {
  try {
    const now = new Date();
    // 生成数字 ID 或使用提供的 ID
    const id = user.id || Math.floor(Math.random() * 1000000);
    
    // 格式化日期为 MySQL 可接受的格式
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]; // 只保留 YYYY-MM-DD 部分
    };
    
    const formatDateTime = (date: Date) => {
      return date.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS 格式
    };
    
    // 确保所有字段都有值，避免 undefined
    const userData = {
      id,
      name: user.name || '',
      email: user.email || '',
      password: user.password || '',
      role: user.role || 'user',
      enrolled_courses: user.enrolled_courses || 0,
      join_date: user.join_date ? formatDate(new Date(user.join_date)) : formatDate(now),
      bio: user.bio || null,
      last_login_at: user.last_login_at ? formatDateTime(new Date(user.last_login_at)) : null,
      created_at: formatDateTime(now),
      updated_at: formatDateTime(now)
    };
    
    console.log('Creating user with data:', userData);
    
    const [result] = await pool.execute(
      'INSERT INTO users (id, name, email, password, role, enrolled_courses, join_date, bio, last_login_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.id,
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.enrolled_courses,
        userData.join_date,
        userData.bio,
        userData.last_login_at,
        userData.created_at,
        userData.updated_at
      ]
    );
    
    console.log('User created with result:', result);
    
    // 直接返回创建的用户数据，而不是再次查询
    return userData as User;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

// Update an existing user
export async function updateUser(id: string, user: Partial<User>): Promise<User | null> {
  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  const formattedUser = { ...user };
  if (formattedUser.last_login_at) {
    formattedUser.last_login_at = formatDateTime(formattedUser.last_login_at);
  }

  const fields = Object.keys(formattedUser).map(key => `${key} = ?`).join(', ');
  const values = Object.values(formattedUser);
  values.push(id);
  
  await pool.execute(
    `UPDATE users SET ${fields} WHERE id = ?`,
    values
  );
  
  return getUserById(id);
}

// Delete a user
export async function deleteUser(id: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}

// Update user's last login time
export async function updateLastLogin(id: string): Promise<void> {
  const now = new Date().toISOString();
  await pool.execute('UPDATE users SET last_login_at = ? WHERE id = ?', [now, id]);
}
