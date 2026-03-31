"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { authClient, logout } from "@/lib/auth/client"
import { useRecaptcha } from "@/hooks/use-recaptcha"
import { useAuth } from "@/lib/auth-context"
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize"


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
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const { execute: executeRecaptcha } = useRecaptcha()
  const { refreshSession } = useAuth()

  useEffect(() => {
    if (isOpen) {
      const emailVerificado = localStorage.getItem("emailVerificado")
      if (emailVerificado) {
        setLoginEmail(emailVerificado)
        localStorage.removeItem("emailVerificado")
      }
    }
  }, [isOpen])

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      })
    } catch (error) {
      console.error("Google sign-in failed", error)
      setError(
        error instanceof Error
          ? error.message || "Error al iniciar sesión con Google"
          : "Error al iniciar sesión con Google"
      )
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    setIsLoading(true)

    if (
      (loginEmail === "admin" && loginPassword === "admin") ||
      (loginEmail === "demo" && loginPassword === "demo")
    ) {
        try {
          // Intentar login demo en el servidor para establecer cookie demo_session
          const res = await fetch("/api/auth/demo-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
          })
            if (res.ok) {
            // Demo login succeeded on server; notify components to refresh demo session
            window.dispatchEvent(new CustomEvent("demo-session-updated"))
            onAuthSuccess?.()
            onClose()
            } else {
            setError("Credenciales demo inválidas")
          }
        } catch {
          setError("Error conectando al servidor de demo")
        } finally {
          setIsLoading(false)
        }
        return
    }

    try {
      const result = await authClient.signIn.email({
        email: sanitizeEmail(loginEmail),
        password: loginPassword,
      })

      if (result.error) {
        setError(result.error.message || "Email o contraseña incorrectos")
      } else {
        const { data: sessionData } = await authClient.getSession()
        
        if (sessionData?.session?.user && !sessionData.session.user.emailVerified) {
          logout()
          setError("Tu email aún no está verificado. Revisa tu correo y seguí las instrucciones.")
          return
        }

        const sessionReady = await refreshSession()
        if (!sessionReady) {
          setError("No pudimos confirmar tu sesión. Probá recargar la página y volvé a iniciar sesión.")
          return
        }
        onAuthSuccess?.()
        onClose()
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (registerPassword !== registerConfirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (registerPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (!/[A-Z]/.test(registerPassword)) {
      setError("La contraseña debe incluir al menos una mayúscula")
      return
    }

    if (!/[0-9]/.test(registerPassword)) {
      setError("La contraseña debe incluir al menos un número")
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

      // Registrar via Neon Auth (crea el usuario pero no inicia sesión automáticamente)
      const result = await authClient.signUp.email({
        email: sanitizeEmail(registerEmail),
        name: sanitizeText(registerNombre),
        password: registerPassword,
      })

      if (result.error) {
        const errorCode = result.error.code || ""
        if (errorCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || result.error.message?.includes("already exists")) {
          setError("Ya existe un usuario registrado con ese correo. Intentá con otro o iniciá sesión.")
        } else {
          setError(result.error.message || "Error al registrarse")
        }
      } else {
        const { data } = result
        
        if (data?.user && !data.user.emailVerified) {
          setShowVerificationMessage(true)
          setError(null)
        } else {
          const sessionReady = await refreshSession()
          if (!sessionReady) {
            setError("Error al crear la sesión")
            return
          }
          onAuthSuccess?.()
          onClose()
        }
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
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
    setShowVerificationMessage(false)
    setVerificationCode("")
    setError(null)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email: registerEmail,
        otp: verificationCode,
      })

      if (error) {
        setError(error.message || "Código incorrecto")
        setIsVerifying(false)
        return
      }

      if (data?.session) {
        const sessionReady = await refreshSession()
        if (sessionReady) {
          onAuthSuccess?.()
          onClose()
        }
      } else {
        resetForms()
        setView("login")
        setError("¡Email verificado! Ahora podés iniciar sesión.")
      }
    } catch (err) {
      setError("Error al verificar el código")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: registerEmail,
        callbackURL: window.location.origin,
      })

      if (error) {
        setError(error.message || "Error al reenviar el código")
      } else {
        setError("Código reenviado. Revisa tu correo.")
      }
    } catch (err) {
      setError("Error al reenviar el código")
    }
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
            {view === "login" ? "Iniciar sesión" : "Registrarse"}
          </DialogTitle>
        </DialogHeader>

        {view === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" id="login-error" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email"
                type="text"
                inputMode="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
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
              ¿No tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="text-primary underline-offset-4"
              >
                  Regístrate
              </button>
            </p>
          </form>
        ) : showVerificationMessage ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {error && (
              <Alert variant="destructive" id="verify-error" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="text-center space-y-2 mb-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold">¡Revisa tu correo!</h3>
              <p className="text-sm text-muted-foreground">
                Te enviamos un código de verificación a<br />
                <strong>{registerEmail}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verify-code">Código de verificación</Label>
              <Input
                id="verify-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Ingresá el código de 6 dígitos"
                maxLength={6}
                required
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying || verificationCode.length < 6}>
              {isVerifying ? "Verificando..." : "Verificar"}
            </Button>
            <button
              type="button"
              onClick={handleResendCode}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              ¿No recibiste el código? Reenviar
            </button>
            <button
              type="button"
              onClick={() => {
                resetForms()
                setView("login")
              }}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive" id="register-error" role="alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="register-nombre">Nombre completo</Label>
              <Input
                id="register-nombre"
                type="text"
                value={registerNombre}
                onChange={(e) => setRegisterNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Correo electrónico</Label>
              <Input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Contraseña</Label>
              <Input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, incluyendo una mayúscula y un número
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm">Confirmar contraseña</Label>
              <Input
                id="register-confirm"
                type="password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                aria-invalid={!!error}
                aria-describedby={error ? "register-error" : undefined}
              />
            </div>
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
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-primary underline-offset-4"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

