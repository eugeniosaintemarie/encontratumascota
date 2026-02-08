"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { useRecaptcha } from "@/hooks/use-recaptcha"


type AuthView = "login" | "register"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: AuthView
  onAuthSuccess?: () => void
}

export function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [registerNombre, setRegisterNombre] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")

  const { execute: executeRecaptcha } = useRecaptcha()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await authClient.signIn.email({
        email: loginEmail,
        password: loginPassword,
      })

      if (result.error) {
        setError(result.error.message || "Email o contrasena incorrectos")
      } else {
        onAuthSuccess?.()
        onClose()
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (registerPassword !== registerConfirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    if (registerPassword.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      // Obtener token reCAPTCHA
      const recaptchaToken = await executeRecaptcha("register")

      // Verificar CAPTCHA en el servidor
      const captchaRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken }),
      })

      if (!captchaRes.ok) {
        const captchaData = await captchaRes.json()
        setError(captchaData.error || "Verificacion de seguridad fallida")
        setIsLoading(false)
        return
      }

      // Registrar via Neon Auth (pasa por el catch-all handler)
      const result = await authClient.signUp.email({
        email: registerEmail,
        name: registerNombre,
        password: registerPassword,
      })

      if (result.error) {
        setError(result.error.message || "Error al registrarse")
      } else {
        onAuthSuccess?.()
        onClose()
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForms = () => {
    setLoginEmail("")
    setLoginPassword("")
    setRegisterNombre("")
    setRegisterEmail("")
    setRegisterPassword("")
    setRegisterConfirmPassword("")
    setError(null)
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === "login" ? "Iniciar sesion" : "Registrarse"}
          </DialogTitle>
        </DialogHeader>

        {view === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No tenes cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="text-primary underline-offset-4 hover:underline"
              >
                Registrate
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              id="register-nombre"
              type="text"
              value={registerNombre}
              onChange={(e) => setRegisterNombre(e.target.value)}
              placeholder="Nombre completo"
              required
            />
            <Input
              id="register-email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <div className="space-y-1">
              <Input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres, incluyendo una mayúscula y un número
              </p>
            </div>
            <Input
              id="register-confirm"
              type="password"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Ya tenes cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-primary underline-offset-4 hover:underline"
              >
                Inicia sesion
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

