"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
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
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PawPrint,
  Home,
  UserPlus,
  Save,
  X,
  Pencil,
  Trash2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LocationAutocomplete from "@/components/location-autocomplete"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { useAuth } from "@/lib/auth-context"
import { tipoMascotaLabels, razasLabels } from "@/lib/labels"
import { especieSexoToTipo } from "@/lib/types"
import { isMestizoRaza } from "@/lib/utils"
import { authClient, logout } from "@/lib/auth/client"
import type { Usuario } from "@/lib/types"
import { sanitizeText, sanitizePhone, sanitizeEmail } from "@/lib/sanitize"
import { toast } from "sonner"

interface PerfilModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: Usuario | null
  onLogout: () => void | Promise<void>
  onPasswordChange?: () => void
}

function SimpleModal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])
  
  if (!mounted || !isOpen) return null
  
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div 
        className="relative z-10 bg-background rounded-lg border shadow-lg w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function PerfilModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onPasswordChange,
}: PerfilModalProps) {
  const [activeTab, setActiveTab] = useState("publicaciones")
  const [ubicacionPerfil, setUbicacionPerfil] = useState("")
  const [contactoTelefonoPerfil, setContactoTelefonoPerfil] = useState("")
  const [mostrarContactoPerfil, setMostrarContactoPerfil] = useState(false)
  const [perfilSaving, setPerfilSaving] = useState(false)
  const [perfilSuccess, setPerfilSuccess] = useState(false)
  const [perfilError, setPerfilError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setUbicacionPerfil(currentUser.ubicacion ?? "")
    setContactoTelefonoPerfil(currentUser.contactoTelefono ?? "")
    setMostrarContactoPerfil(currentUser.mostrarContactoPublico ?? false)
  }, [currentUser])

  const handleSaveContacto = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) {
      setPerfilError("No se pudo cargar el usuario autenticado")
      return
    }

    setPerfilError(null)
    setPerfilSuccess(false)
    setPerfilSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ubicacion: sanitizeText(ubicacionPerfil),
          contactoTelefono: sanitizePhone(contactoTelefonoPerfil),
          mostrarContactoPublico: mostrarContactoPerfil,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el perfil")
      }

      setPerfilSuccess(true)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("demo-session-updated"))
      }
      setTimeout(() => setPerfilSuccess(false), 3000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar los datos"
      setPerfilError(message)
    } finally {
      setPerfilSaving(false)
    }
  }

  const [selectedPublicacion, setSelectedPublicacion] = useState<string>("")
  const [closeReason, setCloseReason] = useState<"ubicada" | "transitada" | "">("")
  const [closeSuccess, setCloseSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [transitoNombre, setTransitoNombre] = useState("")
  const [transitoTelefono, setTransitoTelefono] = useState("")
  const [transitoEmail, setTransitoEmail] = useState("")

  const [advertenciaTransferenciaMultiple, setAdvertenciaTransferenciaMultiple] = useState(false)
  const [contactoAnterior, setContactoAnterior] = useState<{ nombre: string; telefono: string; email: string } | null>(null)
  const [confirmarTransferenciaMultiple, setConfirmarTransferenciaMultiple] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { publicaciones, cerrarPublicacion, eliminarPublicacion } = usePublicaciones()
  const { openPublicarModalForEdit, closePerfilModal } = useAuth()

  const userPublicaciones = publicaciones.filter(
    (pub) => pub.usuarioId === currentUser?.id && pub.activa
  )

  const handleEditPublicacion = () => {
    const pub = publicaciones.find((p) => p.id === selectedPublicacion)
    if (!pub) return
    closePerfilModal()
    openPublicarModalForEdit(pub)
  }

  const handleDeletePublicacion = async () => {
    if (!selectedPublicacion) return
    setIsDeleting(true)
    try {
      await eliminarPublicacion(selectedPublicacion)
      setSelectedPublicacion("")
      setShowDeleteConfirm(false)
      toast.success("Publicación eliminada exitosamente")
    } catch (error) {
      console.error("Error eliminando publicación:", error)
      toast.error("Error al eliminar la publicación")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClosePublicacion = async () => {
    if (!selectedPublicacion || !closeReason) return

    if (closeReason === "transitada") {
      if (!transitoNombre.trim() || !transitoTelefono.trim() || !transitoEmail.trim()) return
    }

    if (advertenciaTransferenciaMultiple && !confirmarTransferenciaMultiple) {
      return
    }

    setIsLoading(true)

    try {
      const motivo = closeReason === "transitada" ? "en_transito" : "encontrado_dueno"
      const transitoContacto = closeReason === "transitada"
        ? {
          nombre: sanitizeText(transitoNombre),
          telefono: sanitizePhone(transitoTelefono),
          email: sanitizeEmail(transitoEmail)
        }
        : undefined

      if (motivo === "en_transito" && transitoContacto && !advertenciaTransferenciaMultiple) {
        const res = await fetch(`/api/publicaciones/${selectedPublicacion}/cerrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motivo, transitoContacto }),
        })

        const data = await res.json()

        if (!res.ok && data.advertenciaTransferenciaMultiple) {
          setAdvertenciaTransferenciaMultiple(true)
          setContactoAnterior(data.contactoAnterior || null)
          setIsLoading(false)
          return
        }

        if (!res.ok) {
          const message = data.error || "Error al cerrar la publicación"
          console.error("Error cerrando publicacion:", message)
          setIsLoading(false)
          return
        }
      }

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
    setPerfilError(null)
    setPerfilSuccess(false)
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleLogout = () => {
    logout()
  }

  if (!currentUser) return null

  return (
    <SimpleModal isOpen={isOpen} onClose={handleClose}>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>

      <h2 className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <PawPrint className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-semibold">Mi perfil</span>
      </h2>

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
                    {userPublicaciones.map((pub) => {
                      const tipo = tipoMascotaLabels[especieSexoToTipo(pub.mascota.especie, pub.mascota.sexo)]
                      const esHembraMascota = pub.mascota.sexo === "hembra"
                      const raza = isMestizoRaza(pub.mascota.raza)
                        ? `${esHembraMascota ? "Mestiza" : "Mestizo"} (♀ ${pub.mascota.madreRaza ? razasLabels[pub.mascota.madreRaza] : "?"} + ♂ ${pub.mascota.padreRaza ?razasLabels[pub.mascota.padreRaza] : "?"})`
                        : razasLabels[pub.mascota.raza]
                      const color = pub.mascota.color ? ` ${pub.mascota.color}` : ""
                      return (
                        <SelectItem key={pub.id} value={pub.id}>
                          {tipo} {raza}{color}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}

              {!currentUser?.isReadOnly && selectedPublicacion && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleEditPublicacion}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Borrar
                  </Button>
                </div>
              )}

              {showDeleteConfirm && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    CONFIRMACIÓN
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Esta acción no se puede deshacer
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={handleDeletePublicacion}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Eliminando..." : "Confirmar"}
                    </Button>
                  </div>
                </div>
              )}

              {!currentUser?.isReadOnly && selectedPublicacion && !showDeleteConfirm && (
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

              {closeReason === "transitada" && (
                <>
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
                      <div className="flex items-start space-x-2">
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

        <TabsContent value="cuenta" className="space-y-4 -mt-1">
          <div className="space-y-3 p-4">
            {perfilError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{perfilError}</AlertDescription>
              </Alert>
            )}
            {perfilSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">Datos actualizados</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveContacto} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="perfil-ubicacion">Ubicación</Label>
                <LocationAutocomplete
                  value={ubicacionPerfil}
                  onChange={(v) => setUbicacionPerfil(v)}
                  onSelect={(place) => setUbicacionPerfil(place.address)}
                  placeholder="Ejemplo: Almagro"
                  className="!bg-transparent dark:!bg-transparent placeholder:text-muted-foreground text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perfil-contacto-telefono">Teléfono</Label>
                <Input
                  id="perfil-contacto-telefono"
                  type="tel"
                  value={contactoTelefonoPerfil}
                  onChange={(event) => setContactoTelefonoPerfil(event.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  required
                />
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="perfil-datos-publicos"
                  checked={mostrarContactoPerfil}
                  onCheckedChange={(checked) => setMostrarContactoPerfil(checked === true)}
                />
                <div className="space-y-0.5 leading-none">
                  <label 
                    htmlFor="perfil-datos-publicos" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Datos públicos
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar tu teléfono y email a usuarios no registrados
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={perfilSaving}>
                <Save className="mr-2 h-4 w-4" />
                {perfilSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </div>

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
                Mínimo 6 caracteres, más una mayúscula y un número
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
    </SimpleModal>
  )
}
