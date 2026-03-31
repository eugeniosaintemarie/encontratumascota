"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"

function VerificarContent() {
  const router = useRouter()
  const [status, setStatus] = useState<"verificando" | "exito" | "error" | "esperando">("verificando")
  const [mensaje, setMensaje] = useState("")
  const [codigo, setCodigo] = useState("")
  const [email, setEmail] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const { data } = await authClient.getSession()
      if (data?.session?.user) {
        if (data.session.user.emailVerified) {
          setStatus("exito")
          setMensaje("¡Tu correo ya está verificado!")
          setTimeout(() => router.push("/"), 2500)
        } else {
          setEmail(data.session.user.email)
          setStatus("esperando")
          setMensaje("Tu correo aún no está verificado. Ingresá el código que te enviamos.")
        }
      } else {
        setStatus("error")
        setMensaje("No hay sesión activa. Iniciá sesión para verificar tu email.")
      }
    } catch {
      setStatus("error")
      setMensaje("Error al verificar la sesión")
    }
  }

  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: codigo,
      })

      if (error) {
        setMensaje(error.message || "Código inválido")
        setEnviando(false)
        return
      }

      if (data?.session) {
        setStatus("exito")
        setMensaje("¡Correo verificado exitosamente!")
        setTimeout(() => router.push("/"), 2500)
      } else {
        setStatus("exito")
        setMensaje("¡Correo verificado! Ya podés iniciar sesión.")
        setTimeout(() => router.push("/?login=verificado"), 2500)
      }
    } catch {
      setMensaje("Error al verificar. Intentá de nuevo.")
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviar() {
    setEnviando(true)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin,
      })

      if (error) {
        setMensaje(error.message || "Error al reenviar")
      } else {
        setMensaje("¡Código reenviado! Revisa tu correo.")
      }
    } catch {
      setMensaje("Error al reenviar el código")
    } finally {
      setEnviando(false)
    }
  }

  if (status === "verificando") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (status === "exito") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="rounded-full bg-green-100 p-4 mx-auto w-fit">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-600">{mensaje}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verifica tu correo</h1>
          <p className="text-muted-foreground mt-2">{mensaje}</p>
        </div>

        {status === "esperando" && (
          <form onSubmit={handleVerificar} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Código de verificación</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Ingresá el código de 6 dígitos"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={enviando || codigo.length !== 6}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {enviando ? "Verificando..." : "Verificar"}
            </button>
            <button
              type="button"
              onClick={handleReenviar}
              disabled={enviando}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              ¿No recibiste el código? Reenviar
            </button>
          </form>
        )}

        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 border rounded-md"
          >
            Volver al inicio
          </button>
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