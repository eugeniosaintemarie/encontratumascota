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
                { error: "El archivo debe ser una imagen válida (JPG, PNG, WebP, etc)" },
                { status: 400 }
            )
        }

        // Validar tamaño (max 4.5 MB para Vercel serverless)
        const MAX_SIZE_MB = 4.5
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return NextResponse.json(
                { error: `La imagen supera el límite de ${MAX_SIZE_MB}MB` },
                { status: 400 }
            )
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now()
        // Normalizar extensión
        const extension = file.type.split("/")[1] || "jpg"
        const filename = `mascotas/img-${timestamp}.${extension}`

        try {
            const blob = await put(filename, file, {
                access: "public",
                contentType: file.type,
            })

            return NextResponse.json({ url: blob.url })
        } catch (uploadError) {
            console.error("Vercel Blob put error:", uploadError)
            return NextResponse.json(
                { error: "Error interno al guardar la imagen en la nube" },
                { status: 502 }
            )
        }
    } catch (error) {
        console.error("Unexpected error handling upload request:", error)
        return NextResponse.json(
            { error: "Error inesperado al procesar la subida" },
            { status: 500 }
        )
    }
}
