import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/lib/server/user-data"

// GET a specific user
export async function GET(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Fetching user with ID: ${id}`)
    
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error(`Error in GET /api/users/${id}:`, error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT (update) a specific user
export async function PUT(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Updating user with ID: ${id}`)
    
    const userData = await request.json()
    const updatedUser = await updateUser(id, userData)

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json({
      message: "User updated successfully",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error(`Error in PUT /api/users/${id}:`, error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE a specific user
export async function DELETE(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  const { id } = context.params
  try {
    console.log(`Deleting user with ID: ${id}`)
    
    const success = await deleteUser(id)

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(`Error in DELETE /api/users/${id}:`, error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
