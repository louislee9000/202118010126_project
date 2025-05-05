import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, updateLastLogin } from "@/lib/server/user-data"
import { verifyPassword } from "@/lib/password-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for email:", email)

    // Get user from database
    const user = await getUserByEmail(email)
    console.log("User found:", user ? "Yes" : "No")

    // Check if user exists
    if (!user) {
      console.log("User not found with email:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isPasswordValid = verifyPassword(password, user.password)
    console.log("Password verification result:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("Invalid password for user:", user.email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login time
    await updateLastLogin(user.id)
    console.log("User login successful:", user.email)

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      user: {
        ...userWithoutPassword,
        enrolledCourseIds: [], // This will be populated from user_enrolled_courses table if needed
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
