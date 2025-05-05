import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_enrolled_courses WHERE course_id = ?',
      [params.id]
    )
    
    const result = rows as { count: number }[]
    return NextResponse.json({ count: result[0].count })
  } catch (error) {
    console.error('Error fetching enrolled count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
} 