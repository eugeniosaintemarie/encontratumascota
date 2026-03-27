import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@/lib/auth/server"

const neonMiddleware = getAuth().middleware()

export default async function middleware(request: NextRequest) {
  const hasVerifier = request.nextUrl.searchParams.has("neon_auth_session_verifier")
  if (!hasVerifier) {
    return NextResponse.next()
  }

  return neonMiddleware(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js).*)",
  ],
}