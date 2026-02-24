"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageCropEditor } from "@/components/image-crop-editor"
import { Upload, X, Heart, Search } from "lucide-react"

import type { Especie, Sexo, Raza, TipoPublicacion } from "@/lib/types"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { authClient } from "@/lib/auth/client"
import { useImageUpload } from "@/hooks/use-image-upload"
import { toast } from "sonner"

interface PublicarModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  onRequireAuth: () => void
}

export function PublicarModal({
  isOpen,
  onClose,
  isAuthenticated,
  onRequireAuth,
}: PublicarModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { agregarPublicacion } = usePublicaciones()
  const { data: session } = authClient.useSession()
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload()

  // Form state
  const [paso, setPaso] = useState<1 | 2>(1)
  const [tipoPublicacion, setTipoPublicacion] = useState<TipoPublicacion | null>(null)
  const [especie, setEspecie] = useState<Especie | "">("")
  const [raza, setRaza] = useState<Raza | "">("")
  const [sexo, setSexo] = useState<Sexo | "">("")
  const [color, setColor] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [edad, setEdad] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [fechaEncuentro, setFechaEncuentro] = useState("")
  const [contactoNombre, setContactoNombre] = useState("")
  const [contactoTelefono, setContactoTelefono] = useState("")
  const [contactoEmail, setContactoEmail] = useState("")
  const [mostrarContactoPublico, setMostrarContactoPublico] = useState(false)
  const [transitoUrgente, setTransitoUrgente] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const razasPorEspecie: Record<Especie, { value: Raza; label: string }[]> = {
    perro: [
      { value: "labrador", label: "Labrador" },
      { value: "golden", label: "Golden Retriever" },
      { value: "bulldog", label: "Bulldog" },
      { value: "pastor_aleman", label: "Pastor Aleman" },
      { value: "caniche", label: "Caniche" },
      { value: "mestizo_perro", label: "Mestizo" },
      { value: "otro_perro", label: "Otro" },
    ],
    gato: [
      { value: "siames", label: "Siames" },
      { value: "persa", label: "Persa" },
      { value: "maine_coon", label: "Maine Coon" },
      { value: "mestizo_gato", label: "Mestizo" },
      { value: "otro_gato", label: "Otro" },
    ],
    otro: [
      { value: "otro_animal", label: "Otro animal" },
    ],
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoPublicacion) return

    // Validar imagen
    if (!croppedBlob) {
      toast.error("Por favor, subí una foto de la mascota obligatoriamente.")
      return
    }

    setIsLoading(true)

    try {
      let finalImagenUrl = ""

      // Subir imagen a Vercel Blob
      try {
        const url = await uploadImage(croppedBlob, session?.user?.id || undefined)
        finalImagenUrl = url
      } catch (error) {
        console.error("Error subiendo imagen:", error)
        throw new Error("Error al subir la imagen. Intenta nuevamente.")
      }

      await agregarPublicacion({
        tipoPublicacion,
        mascota: {
          id: "",
          especie: especie as Especie,
          raza: raza as Raza,
          sexo: sexo as Sexo,
          color,
          descripcion,
          edad: tipoPublicacion === "adopcion" ? edad : undefined,
          imagenUrl: finalImagenUrl,
        },
        ubicacion,
        fechaEncuentro: tipoPublicacion === "perdida" ? new Date(fechaEncuentro) : undefined,
        contactoNombre,
        contactoTelefono,
        contactoEmail,
        mostrarContactoPublico,
        usuarioId: session?.user?.id || "",
        activa: true,
        transitoUrgente: tipoPublicacion === "perdida" ? transitoUrgente : false,
      })

      resetForm()
      onClose()
      toast.success("Publicacion creada exitosamente!")
    } catch (error) {
      console.error("Error creando publicacion:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la publicacion")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPaso(1)
    setTipoPublicacion(null)
    setEspecie("")
    setRaza("")
    setSexo("")
    setColor("")
    setDescripcion("")
    setEdad("")
    setUbicacion("")
    setFechaEncuentro("")
    setContactoNombre("")
    setContactoTelefono("")
    setContactoEmail("")
    setMostrarContactoPublico(false)
    setTransitoUrgente(false)
    setImageFile(null)
    setShowCropEditor(false)
    if (croppedPreview) URL.revokeObjectURL(croppedPreview)
    setCroppedBlob(null)
    setCroppedPreview(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Si no esta autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Inicia sesión para publicar
            </DialogTitle>
          </DialogHeader>
          <Button
            className="w-full"
            onClick={() => {
              handleClose()
              onRequireAuth()
            }}
          >
            Iniciar sesion
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Publicar mascota
          </DialogTitle>
        </DialogHeader>

        {paso === 1 && (
          <div className="flex flex-col gap-4 py-6">
            <h3 className="text-center text-lg font-medium text-foreground">
              ¿Qué tipo de publicación querés realizar?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setTipoPublicacion("perdida")
                  setPaso(2)
                }}
                className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all outline-none"
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Mascota Perdida</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Encontraste una mascota que creeés que tiene familia y está perdida.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoPublicacion("adopcion")
                  setPaso(2)
                }}
                className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all outline-none"
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Heart className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Mascota en Adopción</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tenés o estás cuidando una mascota y le estás buscando su primer familia.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="especie">Tipo de mascota</Label>
                <Select
                  value={especie}
                  onValueChange={(v) => {
                    setEspecie(v as Especie)
                    setRaza("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perro">Perro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
                <Select
                  value={raza}
                  onValueChange={(v) => setRaza(v as Raza)}
                  disabled={!especie}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar raza" />
                  </SelectTrigger>
                  <SelectContent>
                    {especie &&
                      razasPorEspecie[especie].map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Genero</Label>
                <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar genero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                    <SelectItem value="desconocido">Desconocido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej: Marron con manchas blancas"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripcion detallada de la mascota encontrada..."
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ubicacion">
                  {tipoPublicacion === "perdida" ? "Ubicación donde fue encontrada" : "Ubicación donde está alojada"}
                </Label>
                <Input
                  id="ubicacion"
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Palermo, CABA"
                  required
                />
              </div>

              {tipoPublicacion === "perdida" ? (
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de encuentro</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fechaEncuentro}
                    onChange={(e) => setFechaEncuentro(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edad">Posible edad</Label>
                  <Input
                    id="edad"
                    type="text"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ej: 2 meses, 3 años"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Imagen (opcional)</Label>

              {showCropEditor && imageFile ? (
                <ImageCropEditor
                  imageFile={imageFile}
                  onCropComplete={(blob, previewUrl) => {
                    setCroppedBlob(blob)
                    setCroppedPreview(previewUrl)
                    setShowCropEditor(false)
                  }}
                  onCancel={() => {
                    setShowCropEditor(false)
                    setImageFile(null)
                  }}
                />
              ) : croppedPreview ? (
                <div className="flex items-start gap-3">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={croppedPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm text-muted-foreground">Imagen recortada</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (croppedPreview) URL.revokeObjectURL(croppedPreview)
                        setCroppedPreview(null)
                        setCroppedBlob(null)
                        setImageFile(null)
                      }}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Quitar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        setShowCropEditor(true)
                      }
                      e.target.value = ""
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir imagen
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {tipoPublicacion === "perdida" && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="transito-urgente"
                    checked={transitoUrgente}
                    onCheckedChange={(checked) => setTransitoUrgente(checked === true)}
                  />
                  <Label htmlFor="transito-urgente" className="text-sm font-medium leading-none cursor-pointer">
                    Tránsito urgente
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      Marca esta opción si no podés tener a la mascota por mucho tiempo
                    </span>
                  </Label>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="mostrar-contacto"
                  checked={mostrarContactoPublico}
                  onCheckedChange={(checked) => setMostrarContactoPublico(checked === true)}
                />
                <Label htmlFor="mostrar-contacto" className="text-sm font-medium leading-none cursor-pointer">
                  Mostrar mis datos de contacto al público
                  <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                    Si marcás esta opción, cualquier persona (incluso sin cuenta) podrá ver tu número y email.
                  </span>
                </Label>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="mb-3 font-medium">Datos de contacto</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contacto-nombre">Nombre</Label>
                  <Input
                    id="contacto-nombre"
                    type="text"
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto-telefono">Telefono</Label>
                  <Input
                    id="contacto-telefono"
                    type="tel"
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto-email">Email</Label>
                  <Input
                    id="contacto-email"
                    type="email"
                    value={contactoEmail}
                    onChange={(e) => setContactoEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setPaso(1)}>
                Atrás
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || isUploadingImage}>
                {isLoading || isUploadingImage ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
