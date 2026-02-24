import { NextResponse } from "next/server"
import { isDemoRequest } from "@/lib/env"

export async function POST(request: Request) {
  if (!isDemoRequest(request)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const valid = (email === "demo" && password === "demo") || (email === "admin" && password === "admin")
    if (!valid) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 })
    }

    const user = {
      id: email === "admin" ? "demo-admin" : "demo-user",
      name: email === "admin" ? "Admin user" : "Demo user",
      email,
      createdAt: new Date().toISOString(),
    }

    const payload = { user }
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64")

    // Only set Secure if request is HTTPS
    const origin = new URL(request.url).origin
    const isSecure = origin.startsWith("https:")

    const cookie = `demo_session=${encodeURIComponent(encoded)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; ${isSecure ? "Secure; " : ""}SameSite=Lax`

    const res = NextResponse.json({ ok: true })
    res.headers.append("Set-Cookie", cookie)
    // Also set a non-HttpOnly flag so the client can detect demo login immediately
    const publicCookie = `demo_public=1; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${isSecure ? "Secure; " : ""}SameSite=Lax`
    res.headers.append("Set-Cookie", publicCookie)
    return res
  } catch (e) {
    console.error("[demo-login]", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
