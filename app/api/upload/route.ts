import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    // Verificar sesión y permisos de escritura
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Bloquear usuarios demo (modo solo lectura)
    if ((session.user as any).isReadOnly) {
      return NextResponse.json(
        { error: "Modo demo solo permite visualización" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 },
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "El archivo debe ser una imagen válida (JPG, PNG, WebP, etc)",
        },
        { status: 400 },
      );
    }

    // Validar tamaño (max 4.5 MB para Vercel serverless)
    const MAX_SIZE_MB = 4.5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `La imagen supera el límite de ${MAX_SIZE_MB}MB` },
        { status: 400 },
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    // Normalizar extensión
    const extension = file.type.split("/")[1] || "jpg";
    const filename = `mascotas/img-${timestamp}.${extension}`;

    try {
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
      });

      return NextResponse.json({ url: blob.url });
    } catch (uploadError) {
      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : String(uploadError);
      console.error("[API /upload] Vercel Blob put error:", {
        message: errorMessage,
        stack: uploadError instanceof Error ? uploadError.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Error interno al guardar la imagen en la nube" },
        { status: 502 },
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API /upload] Unexpected error handling upload request:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Error inesperado al procesar la subida" },
      { status: 500 },
    );
  }
}
