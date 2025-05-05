import { NextResponse } from "next/server"
import { debugAuthAndFixPasswords } from "@/lib/server/debug-auth"

export async function GET() {
  try {
    const result = await debugAuthAndFixPasswords()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in debug auth API:", error)
    return NextResponse.json({ error: "Debug auth failed" }, { status: 500 })
  }
}

