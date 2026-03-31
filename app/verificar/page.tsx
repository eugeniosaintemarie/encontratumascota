"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

function VerificarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"verificando" | "exito" | "error">("verificando")
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMensaje("Token no proporcionado")
      return
    }

    async function verificar() {
      try {
        const res = await fetch("/api/auth/verify/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok || data.error) {
          setStatus("error")
          setMensaje(data.error || "Token inválido o expirado")
          return
        }

        setStatus("exito")
        setMensaje("¡Correo verificado exitosamente!")

        // Guardar email verificado para autofill en login
        if (data.email) {
          localStorage.setItem("emailVerificado", data.email)
        }

        setTimeout(() => {
          router.push("/?login=verificado")
        }, 2500)
      } catch (e) {
        setStatus("error")
        setMensaje("Error al verificar el token")
      }
    }

    verificar()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "verificando" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <h2 className="text-xl font-semibold">Verificando tu correo...</h2>
          </>
        )}

        {status === "exito" && (
          <>
            <div className="rounded-full bg-green-100 p-4 mx-auto w-fit">
              <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600">{mensaje}</h2>
            <p className="text-muted-foreground">Ahora podés iniciar sesión con tu correo y contraseña.</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="rounded-full bg-red-100 p-4 mx-auto w-fit">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Error de verificación</h2>
            <p className="text-muted-foreground">{mensaje}</p>
            <Button onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <VerificarContent />
    </Suspense>
  )
}