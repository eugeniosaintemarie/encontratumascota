import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"
import { isDemoRequest } from "@/lib/env"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(request)
    if (!session || !session.user) return NextResponse.json({ user: null })

    if (isDemoRequest(request)) {
      return NextResponse.json({ user: session.user })
    }

    const sessionUser = session.user as any
    const authUserId = sessionUser?.id ? String(sessionUser.id) : ""
    if (!authUserId) {
      return NextResponse.json({ user: session.user })
    }

    const { getRefugioProfileByAuthUserId } = await import("@/lib/actions/refugios")
    const profile = await getRefugioProfileByAuthUserId(authUserId)

    return NextResponse.json({
      user: {
        ...session.user,
        esRefugio: profile?.esRefugio ?? false,
        nombreRefugio: profile?.nombreRefugio ?? null,
      },
    })
  } catch (e) {
    console.error("/api/auth/me error", e)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
