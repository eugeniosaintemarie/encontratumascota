"use client"

import { useState } from "react"

interface UseImageUploadReturn {
    uploadImage: (file: File | Blob, userId?: string) => Promise<string>
    isUploading: boolean
    error: string | null
}

export function useImageUpload(): UseImageUploadReturn {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const uploadImage = async (file: File | Blob, userId?: string): Promise<string> => {
        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()

            // Determine filename and extension
            const timestamp = Date.now()
            const extension = file.type === "image/png" ? "png" : "jpg"
            const filename = `upload-${timestamp}.${extension}`

            formData.append("file", file, filename)
            if (userId) {
                formData.append("usuarioId", userId)
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Error al subir la imagen")
            }

            const { url } = await response.json()
            return url
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al subir imagen"
            setError(errorMessage)
            throw err
        } finally {
            setIsUploading(false)
        }
    }

    return { uploadImage, isUploading, error }
}
