import { type NextRequest, NextResponse } from "next/server"
import { migratePasswords } from "@/lib/migrate-passwords"

export async function POST(request: NextRequest) {
  try {
    // 在实际应用中，这里应该有管理员身份验证
    const result = await migratePasswords()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Password migration completed. Migrated ${result.migratedCount} passwords.`,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Password migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during password migration.",
      },
      { status: 500 },
    )
  }
}

