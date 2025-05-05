import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { migratePasswords } from "./lib/migrate-passwords"

// Flag to track if password migration has been executed
let hasMigratedPasswords = false

export async function middleware(request: NextRequest) {
  // Only execute password migration on first request after application startup
  if (!hasMigratedPasswords) {
    try {
      await migratePasswords()
      hasMigratedPasswords = true
    } catch (error) {
      console.error("Failed to migrate passwords in middleware:", error)
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should execute on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files (like images, js, css)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

