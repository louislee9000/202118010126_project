import fs from "fs"
import path from "path"
import { encryptPassword } from "./password-utils"

/**
 * Migrate old password format to new PBKDF2 format
 * This function can be run at server startup or as a standalone script
 */
export async function migratePasswords() {
  try {
    console.log("Starting password migration...")

    // Read user data file
    const dataFilePath = path.join(process.cwd(), "data", "users.json")
    const fileData = fs.readFileSync(dataFilePath, "utf8")
    const users = JSON.parse(fileData)

    let migrationCount = 0

    // Iterate through all users
    const migratedUsers = users.map((user) => {
      // Check if password is already in new format (contains two colons)
      if (user.password && !user.password.includes(":")) {
        // Old format is base64 encoded reversed string
        try {
          // Decode old password
          const base64Password = user.password
          const reversedPassword = Buffer.from(base64Password, "base64").toString()
          const originalPassword = reversedPassword.split("").reverse().join("")

          // Encrypt using new method
          user.password = encryptPassword(originalPassword)
          migrationCount++

          console.log(`Migrated password for user: ${user.email}`)
        } catch (error) {
          console.error(`Failed to migrate password for user: ${user.email}`, error)
        }
      }
      return user
    })

    // Save updated user data
    if (migrationCount > 0) {
      fs.writeFileSync(dataFilePath, JSON.stringify(migratedUsers, null, 2), "utf8")
      console.log(`Password migration completed. Migrated ${migrationCount} passwords.`)
    } else {
      console.log("No passwords needed migration.")
    }

    return { success: true, migratedCount: migrationCount }
  } catch (error) {
    console.error("Password migration failed:", error)
    return { success: false, error: error.message }
  }
}

