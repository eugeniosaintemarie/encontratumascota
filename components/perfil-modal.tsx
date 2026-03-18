"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, AlertTriangle, CheckCircle2, Lock, PawPrint, Home, UserPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { especieLabels, generoLabels, razasLabels } from "@/lib/labels"
import { authClient, logout } from "@/lib/auth/client"
import type { Usuario } from "@/lib/types"
import { sanitizeText, sanitizePhone, sanitizeEmail } from "@/lib/sanitize"

interface PerfilModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: Usuario | null
  onLogout: () => void | Promise<void>
  onPasswordChange?: () => void
}

export function PerfilModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onPasswordChange,
}: PerfilModalProps) {
  const [activeTab, setActiveTab] = useState("publicaciones")
  
  // Estado para cerrar publicacion
  const [selectedPublicacion, setSelectedPublicacion] = useState<string>("")
  const [closeReason, setCloseReason] = useState<"ubicada" | "transitada" | "">("")
  const [closeSuccess, setCloseSuccess] = useState(false)
  
  // Estado para datos de contacto de transito (nuevo cuidador)
  const [transitoNombre, setTransitoNombre] = useState("")
  const [transitoTelefono, setTransitoTelefono] = useState("")
  const [transitoEmail, setTransitoEmail] = useState("")
  
  // Estado para advertencia de transferencia múltiple
  const [advertenciaTransferenciaMultiple, setAdvertenciaTransferenciaMultiple] = useState(false)
  const [contactoAnterior, setContactoAnterior] = useState<{ nombre: string; telefono: string; email: string } | null>(null)
  const [confirmarTransferenciaMultiple, setConfirmarTransferenciaMultiple] = useState(false)
  
  // Estado para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { publicaciones, cerrarPublicacion } = usePublicaciones()

  // Obtener publicaciones del usuario actual
  const userPublicaciones = publicaciones.filter(
    (pub) => pub.usuarioId === currentUser?.id && pub.activa
  )

  const handleClosePublicacion = async () => {
    if (!selectedPublicacion || !closeReason) return
    
    // Si es transito, validar datos del nuevo cuidador
    if (closeReason === "transitada") {
      if (!transitoNombre.trim() || !transitoTelefono.trim() || !transitoEmail.trim()) return
    }
    
    // Si ya mostró advertencia y el usuario no confirmó, no avanzar
    if (advertenciaTransferenciaMultiple && !confirmarTransferenciaMultiple) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Mapear motivo al formato del context
      const motivo = closeReason === "transitada" ? "en_transito" : "encontrado_dueno"
      const transitoContacto = closeReason === "transitada"
        ? { 
            nombre: sanitizeText(transitoNombre), 
            telefono: sanitizePhone(transitoTelefono), 
            email: sanitizeEmail(transitoEmail) 
          }
        : undefined

      // Si es tránsito y no mostramos advertencia aún, hacer primera llamada para validar
      if (motivo === "en_transito" && transitoContacto && !advertenciaTransferenciaMultiple) {
        const res = await fetch(`/api/publicaciones/${selectedPublicacion}/cerrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motivo, transitoContacto }),
        })
        
        const data = await res.json()
        
        // Si hay advertencia de transferencia múltiple, mostrarla
        if (!res.ok && data.advertenciaTransferenciaMultiple) {
          setAdvertenciaTransferenciaMultiple(true)
          setContactoAnterior(data.contactoAnterior || null)
          setIsLoading(false)
          return
        }
        
        // Si hay otro error, mostrar toast y salir
        if (!res.ok) {
          const message = data.error || "Error al cerrar la publicación"
          console.error("Error cerrando publicacion:", message)
          setIsLoading(false)
          return
        }
      }

      // Si llegamos aquí, proceder con el cierre (o es segunda transferencia confirmada)
      await cerrarPublicacion(selectedPublicacion, motivo, transitoContacto, confirmarTransferenciaMultiple)
      
      setIsLoading(false)
      setCloseSuccess(true)
      setSelectedPublicacion("")
      setCloseReason("")
      setTransitoNombre("")
      setTransitoTelefono("")
      setTransitoEmail("")
      setAdvertenciaTransferenciaMultiple(false)
      setContactoAnterior(null)
      setConfirmarTransferenciaMultiple(false)
      
      setTimeout(() => setCloseSuccess(false), 3000)
    } catch (error) {
      console.error("Error en handleClosePublicacion:", error)
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos una mayúscula")
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("La contraseña debe incluir al menos un número")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      
      if (result.error) {
        setPasswordError(result.error.message || "Error al cambiar contraseña")
      } else {
        setPasswordSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        onPasswordChange?.()
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch {
      setPasswordError("Error de conexión. Intentá de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedPublicacion("")
    setCloseReason("")
    setCloseSuccess(false)
    setTransitoNombre("")
    setTransitoTelefono("")
    setTransitoEmail("")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    setPasswordError(null)
    setPasswordSuccess(false)
    onClose()
  }

  const handleLogout = () => {
    logout()
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            Mi perfil
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{currentUser.nombreUsuario}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="publicaciones">Mis publicaciones</TabsTrigger>
            <TabsTrigger value="cuenta">Mi cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="publicaciones" className="space-y-4 mt-4">
            {closeSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Publicacion cerrada exitosamente
                </AlertDescription>
              </Alert>
            )}

            {userPublicaciones.length > 0 ? (
              <div className="space-y-4">
                {/* Modo solo lectura: mostrar lista sin opción de cerrar */}
                {currentUser?.isReadOnly ? (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Modo demo - Solo visualización
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estás viendo {userPublicaciones.length} publicación{userPublicaciones.length !== 1 ? 'es' : ''} de ejemplo.
                      En el modo demo no podés cerrar publicaciones.
                    </p>
                  </div>
                ) : (
                  <Select value={selectedPublicacion} onValueChange={setSelectedPublicacion}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegir publicacion..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userPublicaciones.map((pub) => (
                        <SelectItem key={pub.id} value={pub.id}>
                          {especieLabels[pub.mascota.especie]} - {generoLabels[pub.mascota.sexo]} - {razasLabels[pub.mascota.raza]} / {pub.ubicacion} ({pub.fechaEncuentro.toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {!currentUser?.isReadOnly && selectedPublicacion && (
                  <Select value={closeReason} onValueChange={(v) => setCloseReason(v as "ubicada" | "transitada")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar motivo de cierre..." />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ubicada">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Mascota ubicada con su familia
                          </div>
                        </SelectItem>
                        <SelectItem value="transitada">
                          <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4" />
                            Mascota transitada a nuevo cuidador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                )}

                {/* Formulario de contacto del nuevo cuidador (solo para tránsito) */}
                {closeReason === "transitada" && (
                  <>
                    {/* Advertencia de transferencia múltiple */}
                    {advertenciaTransferenciaMultiple && contactoAnterior && (
                      <div className="space-y-3 rounded-lg border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-100">
                          <AlertTriangle className="h-4 w-4" />
                          Transferencia múltiple detectada
                        </div>
                        <p className="text-xs text-orange-800 dark:text-orange-200">
                          Esta mascota ya fue transitada anteriormente a:
                        </p>
                        <div className="rounded-lg bg-white dark:bg-black/30 p-2 space-y-1 text-xs">
                          <p className="font-medium text-foreground">{contactoAnterior.nombre}</p>
                          <p className="text-muted-foreground">{contactoAnterior.telefono}</p>
                          <p className="text-muted-foreground truncate" title={contactoAnterior.email}>{contactoAnterior.email}</p>
                        </div>
                        <p className="text-xs text-orange-800 dark:text-orange-200">
                          Transferencias múltiples pueden complicar el seguimiento. ¿Estás seguro de que querés transferirla nuevamente?
                        </p>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="confirm-transfer"
                            checked={confirmarTransferenciaMultiple}
                            onCheckedChange={(checked) => setConfirmarTransferenciaMultiple(!!checked)}
                          />
                          <label htmlFor="confirm-transfer" className="text-xs text-orange-800 dark:text-orange-200 cursor-pointer">
                            Confirmo que deseo transferir esta mascota nuevamente
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Datos del nuevo cuidador (mostrar siempre en transitada, o después de confirmar si hay advertencia) */}
                    {!advertenciaTransferenciaMultiple || confirmarTransferenciaMultiple ? (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <UserPlus className="h-4 w-4 text-primary" />
                          Datos de contacto del nuevo cuidador
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tus datos originales se mantienen como respaldo
                        </p>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            value={transitoNombre}
                            onChange={(e) => setTransitoNombre(e.target.value)}
                            placeholder="Nombre del nuevo cuidador"
                            required
                          />
                          <Input
                            type="tel"
                            value={transitoTelefono}
                            onChange={(e) => setTransitoTelefono(e.target.value)}
                            placeholder="Teléfono"
                            required
                          />
                          <Input
                            type="email"
                            value={transitoEmail}
                            onChange={(e) => setTransitoEmail(e.target.value)}
                            placeholder="Email"
                            required
                          />
                        </div>
                      </div>
                    ) : null}
                  </>
                )}

                {!currentUser?.isReadOnly && (
                  <Button
                    onClick={handleClosePublicacion}
                    disabled={
                      !selectedPublicacion || 
                      !closeReason || 
                      isLoading || 
                      (closeReason === "transitada" && !confirmarTransferenciaMultiple && advertenciaTransferenciaMultiple) ||
                      (closeReason === "transitada" && (!transitoNombre.trim() || !transitoTelefono.trim() || !transitoEmail.trim()))
                    }
                    className="w-full"
                  >
                    {isLoading ? "Cerrando..." : advertenciaTransferenciaMultiple ? "Confirmar transferencia" : closeReason === "transitada" ? "Dar tránsito" : "Cerrar publicación"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tenés publicaciones activas</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cuenta" className="space-y-4 mt-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Contraseña cambiada exitosamente
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres, incluyendo una mayúscula y un número
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
