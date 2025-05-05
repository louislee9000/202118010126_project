const fs = require("fs")
const path = require("path")
const crypto = require('crypto');

// Use PBKDF2 for password encryption (same as in password-utils.ts)
function encryptPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    iterations,
    64,
    'sha512'
  ).toString('hex');

  return `${salt}:${iterations}:${hash}`;
}

// Path to the users.json file
const dataFilePath = path.join(process.cwd(), "data", "users.json")

// Read the file
try {
  const fileData = fs.readFileSync(dataFilePath, "utf8")
  const users = JSON.parse(fileData)

  // Update passwords for all users except john@example.com
  users.forEach((user) => {
    if (user.email && user.email !== "john@example.com") {
      // Set new encrypted password
      user.password = encryptPassword("password123")
    }
  })

  // Write the updated data back to the file
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), "utf8")
  console.log("Passwords have been updated for all users except john@example.com!")
} catch (error) {
  console.error("Error updating passwords:", error)
}