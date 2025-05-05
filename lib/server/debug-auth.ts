import fs from "fs"
import path from "path"
import { encryptPassword, verifyPassword } from "../password-utils"

// This is a debug utility to check and fix user passwords
export function debugAuthAndFixPasswords() {
  try {
    const dataFilePath = path.join(process.cwd(), "data", "users.json")
    const fileData = fs.readFileSync(dataFilePath, "utf8")
    const users = JSON.parse(fileData)

    // Check john@example.com's password
    const john = users.find((user) => user.email === "john@example.com")
    if (john) {
      console.log("Found john@example.com user:", john)

      // Check if password is correctly encrypted
      const isPasswordValid = verifyPassword("password", john.password)
      console.log("Password verification result:", isPasswordValid)
      console.log("Current stored password:", john.password)

      // Fix the password if needed
      if (!isPasswordValid) {
        console.log("Fixing password for john@example.com")
        john.password = encryptPassword("password")

        // Save the updated users data
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), "utf8")
        console.log("Password fixed successfully")
      } else {
        console.log("Password is already correct")
      }
    } else {
      console.log("User john@example.com not found")
    }

    return { success: true, message: "Auth debug completed" }
  } catch (error) {
    console.error("Error debugging auth:", error)
    return { success: false, error: error.message }
  }
}

