import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/resend";

export async function POST() {
  const result = await sendTestEmail("eugenio.saintemarie@protonmail.com");

  if (result.success) {
    return NextResponse.json({ success: true, id: result.id });
  }

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 500 },
  );
}
