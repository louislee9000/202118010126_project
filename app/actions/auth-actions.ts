"use server"

import { getUsersData, createUser } from "@/lib/server/data"
import { encryptPassword } from "@/lib/password-utils"

type RegisterFormData = {
  name: string
  email: string
  password: string
}

export async function registerUser(formData: RegisterFormData) {
  try {
    // Get existing users
    const users = await getUsersData()

    // Check if email already exists with proper null checking
    const emailExists = users.some((user: any) => user?.email?.toLowerCase() === formData.email?.toLowerCase())

    if (emailExists) {
      return { success: false, error: "Email already in use" }
    }

    // Encrypt the password
    const encryptedPassword = encryptPassword(formData.password)

    // Create new user with encrypted password
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: encryptedPassword, // Store encrypted password
      role: "user" as const,
      enrolled_courses: 0,
      join_date: new Date().toISOString().split("T")[0],
      bio: "",
      last_login_at: new Date().toISOString(),
    }

    // Add user to database
    const createdUser = await createUser(newUser)

    if (!createdUser) {
      return { success: false, error: "Failed to create user" }
    }

    return { success: true, userId: createdUser.id }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

