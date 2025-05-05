import { type NextRequest, NextResponse } from "next/server"
import { getUsersData, createUser } from "@/lib/server/user-data"
import { encryptPassword } from "@/lib/password-utils"

// GET all users
export async function GET() {
  try {
    const users = await getUsersData()
    console.log("Users data loaded:", users.length)
    return NextResponse.json({ users, count: users.length })
  } catch (error) {
    console.error("Error in GET /api/users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Encrypt password if provided
    if (userData.password) {
      userData.password = encryptPassword(userData.password)
    }
    
    const newUser = await createUser(userData)
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Error in POST /api/users:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
