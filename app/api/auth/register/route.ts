import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/server/user-data"
import { encryptPassword } from "@/lib/password-utils"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    console.log("Registration attempt for email:", userData.email)

    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      console.log("User already exists with email:", userData.email)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(userData.password)

    // Create new user
    const newUser = await createUser({
      ...userData,
      password: encryptedPassword,
      role: "user" as const,
      enrolled_courses: 0,
      join_date: new Date().toISOString().split("T")[0],
      bio: userData.bio || "",
      last_login_at: new Date().toISOString()
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    console.log("User registered successfully:", userData.email)
    return NextResponse.json({
      message: "Registration successful",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
} 