import { getAuth } from "@/lib/auth/server"

const middleware = getAuth().middleware()

export default middleware

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js).*)",
  ],
}