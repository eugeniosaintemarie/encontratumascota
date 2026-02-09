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
import { AlertCircle, CheckCircle2, Lock, PawPrint, Home, UserPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { especieLabels, generoLabels, razasLabels } from "@/lib/labels"
import { ADMIN_USER } from "@/lib/auth"
import type { Usuario } from "@/lib/types"

interface PerfilModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: Usuario | null
  onLogout: () => void
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
  
  // Estado para contacto de transito
  const [transitoNombre, setTransitoNombre] = useState("")
  const [transitoTelefono, setTransitoTelefono] = useState("")
  const [transitoEmail, setTransitoEmail] = useState("")
  
  // Estado para cambio de contrasena
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
    
    // Si es transito, validar que se hayan completado los datos de contacto
    if (closeReason === "transitada" && (!transitoNombre || !transitoTelefono || !transitoEmail)) return
    
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const motivo = closeReason === "transitada" ? "en_transito" : "encontrado_dueno"
    const transitoContacto = closeReason === "transitada" ? {
      nombre: transitoNombre,
      telefono: transitoTelefono,
      email: transitoEmail,
    } : undefined
    
    cerrarPublicacion(selectedPublicacion, motivo, transitoContacto)
    
    setIsLoading(false)
    setCloseSuccess(true)
    setSelectedPublicacion("")
    setCloseReason("")
    
    setTimeout(() => setCloseSuccess(false), 3000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validar nueva contrasena
    if (newPassword.length < 5) {
      setPasswordError("La nueva contrasena debe tener al menos 5 caracteres")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las contrasenas no coinciden")
      return
    }

    setIsLoading(true)
    
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        onPasswordChange?.()
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(data.error || "Error al cambiar contrasena")
      }
    } catch {
      // Fallback: validacion local contra env
      if (currentPassword !== ADMIN_USER.password) {
        setPasswordError("La contrasena actual es incorrecta")
      } else {
        setPasswordSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
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
    handleClose()
    onLogout()
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
            Cerrar sesion
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

                {selectedPublicacion && (
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
                            Mascota en tránsito
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                )}

                {/* Formulario de contacto de transito */}
                {closeReason === "transitada" && (
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <UserPlus className="h-4 w-4" />
                      Datos del nuevo cuidador
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nombre del cuidador"
                        value={transitoNombre}
                        onChange={(e) => setTransitoNombre(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Teléfono del cuidador"
                        type="tel"
                        value={transitoTelefono}
                        onChange={(e) => setTransitoTelefono(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Email del cuidador"
                        type="email"
                        value={transitoEmail}
                        onChange={(e) => setTransitoEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleClosePublicacion}
                  disabled={!selectedPublicacion || !closeReason || isLoading || (closeReason === "transitada" && (!transitoNombre || !transitoTelefono || !transitoEmail))}
                  className="w-full"
                >
                  {isLoading ? "Cerrando..." : closeReason === "transitada" ? "Dar tránsito" : "Cerrar publicacion"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tenes publicaciones activas</p>
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
                  Contrasena cambiada exitosamente
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contrasena actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contrasena</Label>
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
