import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request)
    if (!session || !session.user) return NextResponse.json({ user: null })
    return NextResponse.json({ user: session.user })
  } catch (e) {
    console.error("/api/auth/me error", e)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
