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
import { AlertCircle, ShieldCheck } from "lucide-react"
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

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      })
    } catch {
      setError("Error al iniciar sesion con Google")
      setIsLoading(false)
    }
  }

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

    if (registerPassword.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres")
      return
    }

    if (!/[A-Z]/.test(registerPassword)) {
      setError("La contrasena debe incluir al menos una mayuscula")
      return
    }

    if (!/[0-9]/.test(registerPassword)) {
      setError("La contrasena debe incluir al menos un numero")
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
              type="text"
              inputMode="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Correo electrónico (demo)"
              required
            />
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Contraseña (demo)"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
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
                Mínimo 8 caracteres, incluyendo una mayúscula y un número
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

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Registrarse con Google
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

