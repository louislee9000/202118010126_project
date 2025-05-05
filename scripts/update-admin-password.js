const fs = require("fs")
const path = require("path")
const crypto = require('crypto');

// 使用PBKDF2加密密码
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

// Path to users.json file
const dataFilePath = path.join(process.cwd(), "data", "users.json")

// Read file
try {
  const fileData = fs.readFileSync(dataFilePath, "utf8")
  const users = JSON.parse(fileData)

  // Find admin@example.com user
  const adminIndex = users.findIndex((user) => user.email === "admin@example.com")

  if (adminIndex !== -1) {
    // Set new password
    users[adminIndex].password = encryptPassword("admin")

    // Write updated data back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), "utf8")
    console.log("Admin password has been updated to 'admin'!")
  } else {
    console.log("Admin user not found!")
  }
} catch (error) {
  console.error("Error updating password:", error)
}