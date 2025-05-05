import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface User extends RowDataPacket {
  id: string
  email: string
  name: string
  password: string
  role: 'admin' | 'user'
  enrolled_courses: number
  join_date: string
  bio: string
  last_login_at: string
  created_at: string
  updated_at: string
}

export async function getUsersData(): Promise<User[]> {
  try {
    const [rows] = await pool.query<User[]>('SELECT * FROM users ORDER BY created_at DESC')
    return rows
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [id])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user by id:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE email = ?', [email])
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, name, password, role, enrolled_courses, join_date, bio, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userData.email,
        userData.name,
        userData.password,
        userData.role,
        userData.enrolled_courses || 0,
        userData.join_date || new Date().toISOString().split('T')[0],
        userData.bio || '',
        userData.last_login_at || new Date().toISOString()
      ]
    )
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [result.insertId])
    return rows[0]
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
  try {
    const fields = Object.keys(userData).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
    if (fields.length === 0) return null

    const values = fields.map(field => userData[field as keyof typeof userData])
    const setClause = fields.map(field => `${field} = ?`).join(', ')
    
    await pool.query<ResultSetHeader>(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    )

    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [id])
    return rows[0] || null
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function updateLastLogin(id: string): Promise<void> {
  try {
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id])
  } catch (error) {
    console.error('Error updating last login:', error)
    throw error
  }
}