import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"
import { isDemoRequest } from "@/lib/env"

const isDevelopment = process.env.NODE_ENV !== "production"

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  if (isDevelopment) {
    console.debug("[api/auth/me] incoming cookies", {
      snippet: cookieHeader.slice(0, 120),
      hasSessionToken: cookieHeader.includes("__Secure-neon-auth.session_token"),
      hasDemoSession: cookieHeader.includes("demo_session") || cookieHeader.includes("demo_public"),
      isDemoRequest: isDemoRequest(request),
    })
  }
  try {
    const session = await getServerSession(request)
    if (!session || !session.user) {
      if (isDevelopment) {
        console.debug("[api/auth/me] session missing", { session })
      }
      return NextResponse.json({ user: null })
    }

    if (isDemoRequest(request)) {
      return NextResponse.json({ user: session.user })
    }

    const sessionUser = session.user as any
    const authUserId = sessionUser?.id ? String(sessionUser.id) : ""
    if (!authUserId) {
      return NextResponse.json({ user: session.user })
    }

    let profile = null
    try {
      const { getRefugioProfileByAuthUserId } = await import("@/lib/actions/refugios")
      profile = await getRefugioProfileByAuthUserId(authUserId)
    } catch (error) {
      console.error("[api/auth/me] failed to fetch refugio profile", error)
    }

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
