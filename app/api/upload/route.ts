import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

// Usuarios restringidos que no pueden subir archivos
const RESTRICTED_USERS = new Set(["demo", "admin"])

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const usuarioId = formData.get("usuarioId") as string | null

        // Blindaje: bloquear uploads de usuarios demo/admin
        if (usuarioId && RESTRICTED_USERS.has(usuarioId)) {
            return NextResponse.json(
                { error: "Acción no permitida para este usuario" },
                { status: 403 }
            )
        }

        if (!file) {
            return NextResponse.json(
                { error: "No se recibió ningún archivo" },
                { status: 400 }
            )
        }

        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "El archivo debe ser una imagen" },
                { status: 400 }
            )
        }

        // Validar tamaño (max 4.5 MB para Vercel serverless)
        if (file.size > 4.5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "La imagen no puede superar 4.5 MB" },
                { status: 400 }
            )
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const extension = file.type === "image/png" ? "png" : "jpg"
        const filename = `mascotas/${timestamp}.${extension}`

        const blob = await put(filename, file, {
            access: "public",
            contentType: file.type,
        })

        return NextResponse.json({ url: blob.url })
    } catch (error) {
        console.error("Error subiendo imagen:", error)
        return NextResponse.json(
            { error: "Error al subir la imagen" },
            { status: 500 }
        )
    }
}
