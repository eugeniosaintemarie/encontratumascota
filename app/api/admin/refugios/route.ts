import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";
import { isDemoRequest } from "@/lib/env";

function isAuthorizedAdmin(request: Request, email?: string | null) {
  const adminApiKey = process.env.ADMIN_API_KEY;
  const headerApiKey = request.headers.get("x-admin-key");
  if (adminApiKey && headerApiKey && headerApiKey === adminApiKey) return true;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (!email) return false;
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(email.toLowerCase());
}

// PATCH /api/admin/refugios
// Body: { authUserId: string, esRefugio: boolean, nombreRefugio?: string }
export async function PATCH(request: Request) {
  try {
    if (isDemoRequest(request)) {
      return NextResponse.json(
        { error: "No disponible en demo" },
        { status: 403 },
      );
    }

    const session = await getServerSession(request);
    const sessionUser = session?.user as any;
    const email = sessionUser?.email as string | undefined;

    if (!isAuthorizedAdmin(request, email)) {
      return NextResponse.json(
        { error: "No autorizado. Configura ADMIN_EMAILS o usa x-admin-key" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const authUserId = String(body?.authUserId || "").trim();
    const esRefugio = Boolean(body?.esRefugio);
    const nombreRefugio = body?.nombreRefugio
      ? String(body.nombreRefugio).trim()
      : null;

    if (!authUserId) {
      return NextResponse.json(
        { error: "authUserId es obligatorio" },
        { status: 400 },
      );
    }

    const { setRefugioProfile } = await import("@/lib/actions/refugios");
    const profile = await setRefugioProfile({
      authUserId,
      esRefugio,
      nombreRefugio,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[API /admin/refugios PATCH] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
