import { getAuth } from "@/lib/auth/server"

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const auth = getAuth()
  return auth.handler().GET(request, context)
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const auth = getAuth()
  return auth.handler().POST(request, context)
}
