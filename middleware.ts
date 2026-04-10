import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { isDemoRequest } from "@/lib/env";

export default async function middleware(request: NextRequest) {
  if (isDemoRequest(request)) {
    return NextResponse.next();
  }

  const hasVerifier = request.nextUrl.searchParams.has(
    "neon_auth_session_verifier",
  );
  if (!hasVerifier) {
    return NextResponse.next();
  }

  const neonMiddleware = getAuth().middleware();
  return neonMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js).*)"],
};
