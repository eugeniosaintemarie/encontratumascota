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
import { Label } from "@/components/ui/label"
import { validateCredentials, setCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


type AuthView = "login" | "register"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: AuthView
  onAuthSuccess?: () => void
}

// Funcion para autogenerar nombre de usuario a partir del email
function generateUsername(email: string): string {
  const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
  const randomSuffix = Math.floor(Math.random() * 1000)
  return `${baseUsername}${randomSuffix}`
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      
      if (res.ok && data.user) {
        setCurrentUser(data.user)
        setIsLoading(false)
        onAuthSuccess?.()
        onClose()
      } else {
        setError(data.error || "Email o contrasena incorrectos")
        setIsLoading(false)
      }
    } catch {
      // Fallback a validacion local
      const user = validateCredentials(loginEmail, loginPassword)
      if (user) {
        setCurrentUser(user)
        setIsLoading(false)
        onAuthSuccess?.()
        onClose()
      } else {
        setError("Email o contrasena incorrectos")
        setIsLoading(false)
      }
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerNombre,
          email: registerEmail,
          password: registerPassword,
        }),
      })
      const data = await res.json()
      
      if (res.ok && data.user) {
        setCurrentUser(data.user)
        setIsLoading(false)
        onAuthSuccess?.()
        onClose()
      } else {
        setError(data.error || "Error al registrarse")
        setIsLoading(false)
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
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
            <div className="relative">
              <Input
                id="login-email"
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="pr-16"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">(demo)</span>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Contraseña"
                className="pr-16"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">(demo)</span>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
