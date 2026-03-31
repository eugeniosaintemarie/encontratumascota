"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseImageUploadReturn {
    uploadImage: (file: File | Blob, userId?: string) => Promise<string>
    isUploading: boolean
    error: string | null
    abort: () => void
}

export function useImageUpload(): UseImageUploadReturn {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)
    const isMountedRef = useRef(true)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false
            abortControllerRef.current?.abort()
        }
    }, [])

    const abort = useCallback(() => {
        abortControllerRef.current?.abort()
    }, [])

    const uploadImage = useCallback(async (file: File | Blob, userId?: string): Promise<string> => {
        // Abort any previous upload
        abortControllerRef.current?.abort()
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        if (isMountedRef.current) {
            setIsUploading(true)
            setError(null)
        }

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
                signal: abortController.signal,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Error al subir la imagen")
            }

            const { url } = await response.json()
            return url
        } catch (err) {
            if ((err as Error).name === "AbortError") {
                throw new Error("Upload cancelled", { cause: err })
            }
            const errorMessage = err instanceof Error ? err.message : "Error desconocido al subir imagen"
            if (isMountedRef.current) {
                setError(errorMessage)
            }
            throw err
        } finally {
            if (isMountedRef.current) {
                setIsUploading(false)
            }
        }
    }, [])

    return { uploadImage, isUploading, error, abort }
}
