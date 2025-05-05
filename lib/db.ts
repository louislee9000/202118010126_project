import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '0419',
  database: process.env.DB_NAME || 'codelearn_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

export default pool;

export interface User extends RowDataPacket {
  // Add any necessary properties for the User type
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, name, role, last_login) VALUES (?, ?, ?, ?)',
      [userData.email, userData.name, userData.role, userData.last_login]
    );
    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
  try {
    const fields = Object.keys(userData).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    if (fields.length === 0) return null;

    const values = fields.map(field => userData[field as keyof typeof userData]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await pool.query<ResultSetHeader>(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    const [rows] = await pool.query<User[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function updateLastLogin(id: number): Promise<void> {
  try {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
} 