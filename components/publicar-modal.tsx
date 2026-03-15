"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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
import LocationAutocomplete from "@/components/location-autocomplete"
import { Upload, X, Search, MapPin, Heart } from "lucide-react"

import type { Especie, Sexo, Raza, TipoPublicacion } from "@/lib/types"
import { razasPorEspecie } from "@/lib/labels"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { authClient, fetchServerSession } from "@/lib/auth/client"
import { useImageUpload } from "@/hooks/use-image-upload"
import { toast } from "sonner"
import { sanitizeText, sanitizeRichText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize"
import { parsePhoneNumberFromString } from "libphonenumber-js"

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
  const [demoUser, setDemoUser] = useState<any | null>(null)

  // If neon session is missing but demo_public cookie exists, fetch server session
  useEffect(() => {
    if (!session?.user) {
      const cookies = typeof document !== 'undefined' ? document.cookie : ''
      if (cookies.includes('demo_public=1')) {
        void (async () => {
          try {
            const user = await fetchServerSession()
            if (user) setDemoUser(user)
          } catch (e) {
            // ignore
          }
        })()
      }
    }
  }, [session])

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
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const pad = (n: number) => n.toString().padStart(2, "0")
  const formatDateDisplay = (iso?: string) => {
    if (!iso) return ""
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoPublicacion) return

    // Validar campos obligatorios
    if (!especie) {
      toast.error("Por favor, seleccioná el tipo de mascota")
      return
    }

    if (!raza) {
      toast.error("Por favor, seleccioná la raza")
      return
    }

    if (!sexo) {
      toast.error("Por favor, seleccioná el género")
      return
    }

    if (!ubicacion.trim()) {
      toast.error("Por favor, ingresá la ubicación")
      return
    }

    if ((tipoPublicacion === "perdida" || tipoPublicacion === "buscada") && !fechaEncuentro) {
      toast.error("Por favor, seleccioná la fecha.")
      return
    }

    // Validar imagen
    if (!croppedBlob) {
      toast.error("Por favor, subí una foto de la mascota obligatoriamente")
      return
    }

    // Validar email de contacto (si existe)
    const email = contactoEmail?.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      toast.error("El email de contacto no tiene un formato válido")
      return
    }

    // Validar teléfono argentino (si existe)
    const telefono = contactoTelefono?.trim()
    if (telefono) {
      const phoneNumber = parsePhoneNumberFromString(telefono, "AR")
      if (!phoneNumber || !phoneNumber.isValid()) {
        toast.error("El teléfono no parece ser un número argentino válido")
        return
      }
    }

    // Validar fecha de encuentro/perdida para publicaciones "perdida" y "buscada"
    if ((tipoPublicacion === "perdida" || tipoPublicacion === "buscada") && fechaEncuentro) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const fecha = new Date(fechaEncuentro)
      fecha.setHours(0, 0, 0, 0)

      if (fecha > today) {
        toast.error("La fecha no puede ser posterior a hoy.")
        return
      }

      if (fecha < sevenDaysAgo) {
        toast.error("La fecha no puede ser anterior a hace 7 días.")
        return
      }
    }

    setIsLoading(true)

    try {
      let finalImagenUrl = ""

      // Subir imagen a Vercel Blob
      try {
        const url = await uploadImage(croppedBlob, session?.user?.id || demoUser?.id || undefined)
        finalImagenUrl = url
      } catch (error) {
        console.error("Error subiendo imagen:", error)
        throw new Error("Error al subir la imagen. Intenta nuevamente.")
      }

      // Sanitizar todos los inputs de texto antes de enviar
      await agregarPublicacion({
        tipoPublicacion,
        mascota: {
          id: "",
          especie: especie as Especie,
          raza: raza as Raza,
          sexo: sexo as Sexo,
          color: sanitizeText(color),
          descripcion: sanitizeRichText(descripcion),
          edad: tipoPublicacion === "adopcion" ? sanitizeText(edad) : undefined,
          imagenUrl: finalImagenUrl,
        },
        ubicacion: sanitizeText(ubicacion),
        fechaEncuentro: tipoPublicacion === "perdida" || tipoPublicacion === "buscada" ? new Date(fechaEncuentro) : undefined,
        contactoNombre: sanitizeText(contactoNombre),
        contactoTelefono: sanitizePhone(contactoTelefono),
        contactoEmail: sanitizeEmail(contactoEmail),
        mostrarContactoPublico,
        usuarioId: session?.user?.id || demoUser?.id || "",
        activa: true,
        transitoUrgente: tipoPublicacion === "perdida" ? transitoUrgente : false,
      })

      resetForm()
      onClose()
      toast.success("¡Publicación creada exitosamente!")
    } catch (error) {
      console.error("Error creando publicacion:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la publicación")
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
            Iniciar sesión
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
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">

              <button
                type="button"
                onClick={() => {
                  setTipoPublicacion("buscada")
                  setPaso(2)
                }}
                className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transform-gpu transition-transform duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none"
                aria-pressed={tipoPublicacion === "buscada"}
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">perdida</h4>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoPublicacion("perdida")
                  setPaso(2)
                }}
                className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transform-gpu transition-transform duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none"
                aria-pressed={tipoPublicacion === "perdida"}
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">encontrada</h4>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoPublicacion("adopcion")
                  setPaso(2)
                }}
                className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transform-gpu transition-transform duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none"
                aria-pressed={tipoPublicacion === "adopcion"}
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Heart className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">en adopción</h4>
                </div>
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="h-3" />
            <div className="grid gap-2 sm:grid-cols-2 mt-0">
              <div className="space-y-2 sm:col-span-1">
                <Select
                  value={especie}
                  onValueChange={(v) => {
                    setEspecie(v as Especie)
                    setRaza("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perro">Perro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Select
                  value={raza}
                  onValueChange={(v) => setRaza(v as Raza)}
                  disabled={!especie}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Raza" />
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
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                    <SelectItem value="desconocido">Desconocido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Ej: Marrón con manchas blancas"
                  required
                  aria-required="true"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción lo más detallada posible"
                rows={3}
                required
                aria-required="true"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 mt-[25px] mb-2">
                <div className="space-y-2">
                <Label htmlFor="ubicacion">
                  {tipoPublicacion === "perdida" 
                    ? "Ubicación donde fue encontrada" 
                    : tipoPublicacion === "buscada"
                    ? "Última ubicación donde se la vio"
                    : "Ubicación donde está alojada"}
                </Label>
                {/* Location autocomplete */}
                <LocationAutocomplete
                  value={ubicacion}
                  onChange={(v) => setUbicacion(v)}
                  onSelect={(place) => setUbicacion(place.address)}
                  placeholder="Ejemplo: Almagro, CABA"
                  className="!bg-transparent dark:!bg-transparent placeholder:text-muted-foreground text-foreground"
                />
              </div>

              {tipoPublicacion === "perdida" || tipoPublicacion === "buscada" ? (
                <div className="space-y-2">
                  <Label htmlFor="fecha">
                    {tipoPublicacion === "perdida" ? "Fecha de cuando fue encontrada" : "Fecha de cuando se perdió"}
                  </Label>
                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      id="fecha-hidden"
                      type="date"
                      value={fechaEncuentro}
                      onChange={(e) => setFechaEncuentro(e.target.value)}
                      className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
                      aria-hidden
                    />

                    <div>
                      <input
                        ref={dateInputRef}
                        id="fecha-hidden"
                        type="date"
                        value={fechaEncuentro}
                        onChange={(e) => setFechaEncuentro(e.target.value)}
                        className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
                        aria-hidden
                      />
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 h-9 text-base"
                        onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                      >
                        <span className={fechaEncuentro ? 'text-foreground text-base' : 'text-muted-foreground text-base'}>
                          {fechaEncuentro ? formatDateDisplay(fechaEncuentro) : 'dd/mm/aaaa'}
                        </span>
                        {/* calendar icon removed to match compact header styling */}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edad">Posible edad</Label>
                  <Input
                    id="edad"
                    type="text"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ejemplo: cachorrito"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mt-[25px]">

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
                <div className="flex flex-col gap-2 my-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-required="true"
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
                    Subir foto
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3 my-2">
              {tipoPublicacion === "perdida" && (
                <div className="flex items-start space-x-2 mt-[25px]">
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
            </div>

            <div className="mt-6 border-t border-primary pb-6">
              <div className="mt-[25px] grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contacto-nombre">Nombre de contacto</Label>
                  <Input
                    id="contacto-nombre"
                    type="text"
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contacto-telefono">Teléfono</Label>
                  <Input
                    id="contacto-telefono"
                    type="tel"
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    placeholder="+54 9 11 ..."
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2 sm:col-span-3 mt-[8px]">
                  <Label htmlFor="contacto-email">Correo electrónico</Label>
                  <Input
                    id="contacto-email"
                    type="email"
                    value={contactoEmail}
                    onChange={(e) => setContactoEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-start space-x-2 mt-[25px]">
                <Checkbox
                  id="mostrar-contacto"
                  checked={mostrarContactoPublico}
                  onCheckedChange={(checked) => setMostrarContactoPublico(checked === true)}
                />
                <Label htmlFor="mostrar-contacto" className="text-sm font-medium leading-none cursor-pointer">
                  Datos públicos
                  <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                    Cualquier persona sin cuenta podrá ver tu número y email
                  </span>
                </Label>
              </div>
            </div>

            <div className="flex gap-3 py-2">
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
