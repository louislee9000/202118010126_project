import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as total FROM user_enrolled_courses"
    )
    
    return NextResponse.json({ total: (rows as any[])[0].total })
  } catch (error) {
    console.error("Error fetching enrolled students count:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrolled students count" },
      { status: 500 }
    )
  }
} 