"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
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
import { Upload, X, Search, MapPin, Heart } from "lucide-react"

import type { Especie, Sexo, Raza, TipoPublicacion, Publicacion, TipoMascota } from "@/lib/types"
import { tipoMascotaToEspecie, tipoMascotaToSexo, especieSexoToTipo } from "@/lib/types"
import { razasPorEspecie, getRazasPorTipoMascota, tipoMascotaLabels } from "@/lib/labels"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { fetchServerSession } from "@/lib/auth/client"
import { useImageUpload } from "@/hooks/use-image-upload"
import { toast } from "sonner"
import { sanitizeText, sanitizeRichText } from "@/lib/sanitize"
import { isMestizoRaza, MESTIZO_RAZAS } from "@/lib/utils"

const DESCRIPCION_MAX_LENGTH = 100

interface PublicarModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  onRequireAuth: () => void
  publicacionToEdit?: Publicacion | null
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
        className="relative z-10 bg-background rounded-lg border shadow-lg w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto"
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

export function PublicarModal({
  isOpen,
  onClose,
  isAuthenticated,
  onRequireAuth,
  publicacionToEdit,
}: PublicarModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { agregarPublicacion, actualizarPublicacion } = usePublicaciones()
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload()
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const user = await fetchServerSession()
        setCurrentUser(user)
      } catch {
        setCurrentUser(null)
      }
    })()
  }, [])

  const [paso, setPaso] = useState<1 | 2>(1)
  const [tipoPublicacion, setTipoPublicacion] = useState<TipoPublicacion | null>(null)
  const [tipoMascota, setTipoMascota] = useState<TipoMascota | "">("")
  const [raza, setRaza] = useState<Raza | "">("")
  const [padreRaza, setPadreRaza] = useState<Raza | "">("")
  const [madreRaza, setMadreRaza] = useState<Raza | "">("")
  const [color, setColor] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [edadValor, setEdadValor] = useState("")
  const [edadUnidad, setEdadUnidad] = useState<"años" | "días">("años")
  const [fechaEncuentro, setFechaEncuentro] = useState("")
  const [transitoUrgente, setTransitoUrgente] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  // Precargar datos cuando se está editando
  useEffect(() => {
    if (publicacionToEdit && isOpen) {
      setEditingId(publicacionToEdit.id)
      setTipoPublicacion(publicacionToEdit.tipoPublicacion)
      setTipoMascota(especieSexoToTipo(publicacionToEdit.mascota.especie, publicacionToEdit.mascota.sexo))
      setRaza(publicacionToEdit.mascota.raza)
      setPadreRaza(publicacionToEdit.mascota.padreRaza ?? "")
      setMadreRaza(publicacionToEdit.mascota.madreRaza ?? "")
      setColor(publicacionToEdit.mascota.color)
      setDescripcion(publicacionToEdit.mascota.descripcion)
      if (publicacionToEdit.mascota.edad) {
        const parts = publicacionToEdit.mascota.edad.split(" ")
        if (parts.length >= 2) {
          setEdadValor(parts[0])
          setEdadUnidad(parts[1] === "años" ? "años" : "días")
        }
      }
      if (publicacionToEdit.fechaEncuentro) {
        const d = new Date(publicacionToEdit.fechaEncuentro)
        setFechaEncuentro(d.toISOString().split("T")[0])
      }
      setTransitoUrgente(publicacionToEdit.transitoUrgente ?? false)
      setPaso(2)
      if (publicacionToEdit.mascota.imagenUrl) {
        setCroppedPreview(publicacionToEdit.mascota.imagenUrl)
      }
    }
  }, [publicacionToEdit, isOpen])

  const pad = (n: number) => n.toString().padStart(2, "0")
  const formatDateDisplay = (iso?: string) => {
    if (!iso) return ""
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  const parentRazas = tipoMascota
    ? getRazasPorTipoMascota(tipoMascota).filter((option) => !MESTIZO_RAZAS.has(option.value))
    : []

  const clampEdadDigits = (unit: "años" | "días") => (unit === "años" ? 2 : 3)
  const sanitizeEdadValor = (value: string, unit: "años" | "días") =>
    value.replace(/\D/g, "").slice(0, clampEdadDigits(unit))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoPublicacion) return

    if (!tipoMascota) {
      toast.error("Por favor, seleccioná el tipo de mascota")
      return
    }

    if (!raza) {
      toast.error("Por favor, seleccioná la raza")
      return
    }

    if (isMestizoRaza(raza) && (!padreRaza || !madreRaza)) {
      toast.error("Completá la raza de madre y padre para mestizos")
      return
    }

    if (!currentUser?.ubicacion?.trim()) {
      toast.error("Configurá tu ubicación en tu perfil antes de publicar")
      return
    }

    if ((tipoPublicacion === "perdida" || tipoPublicacion === "buscada") && !fechaEncuentro) {
      toast.error("Por favor, seleccioná la fecha.")
      return
    }

    if (!croppedBlob && !(editingId && croppedPreview)) {
      toast.error("Por favor, subí una foto de la mascota obligatoriamente")
      return
    }

    if (tipoPublicacion === "adopcion" && !edadValor.trim()) {
      toast.error("Por favor, ingresá una edad aproximada")
      return
    }

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

    const contactoNombre = currentUser?.contactoNombre ?? currentUser?.nombreUsuario ?? ""
    const contactoTelefono = currentUser?.contactoTelefono ?? ""
    const contactoEmail = currentUser?.contactoEmail ?? currentUser?.email ?? ""
    const mostrarContactoPublicoFlag = currentUser?.mostrarContactoPublico ?? false

    setIsLoading(true)

    try {
      let finalImagenUrl = ""

      try {
        // Solo subir imagen si es una nueva imagen (blob diferente)
        if (croppedBlob) {
          const url = await uploadImage(croppedBlob, currentUser?.id || undefined)
          finalImagenUrl = url
        } else if (editingId && croppedPreview) {
          // Si estamos editando y no hay nueva imagen, usar la existente
          finalImagenUrl = croppedPreview
        }
      } catch (error) {
        console.error("Error subiendo imagen:", error)
        throw new Error("Error al subir la imagen. Intenta nuevamente.")
      }

      if (editingId) {
        // Actualizar publicación existente
        await actualizarPublicacion(editingId, {
          tipoPublicacion,
          especie: tipoMascotaToEspecie(tipoMascota as TipoMascota),
          raza: raza as Raza,
          padreRaza: padreRaza ? (padreRaza as Raza) : undefined,
          madreRaza: madreRaza ? (madreRaza as Raza) : undefined,
          sexo: tipoMascotaToSexo(tipoMascota as TipoMascota),
          color: sanitizeText(color),
          descripcion: sanitizeRichText(descripcion),
          edad: tipoPublicacion === "adopcion" ? sanitizeText(`${edadValor.trim()} ${edadUnidad}`) : undefined,
          imagenUrl: finalImagenUrl,
          fechaEncuentro: tipoPublicacion === "perdida" || tipoPublicacion === "buscada" ? new Date(fechaEncuentro) : undefined,
          transitoUrgente: tipoPublicacion === "perdida" ? transitoUrgente : false,
        })
        toast.success("¡Publicación actualizada exitosamente!")
      } else {
        // Crear nueva publicación
        await agregarPublicacion({
          tipoPublicacion,
          mascota: {
            id: "",
            especie: tipoMascotaToEspecie(tipoMascota as TipoMascota),
            raza: raza as Raza,
            padreRaza: padreRaza ? (padreRaza as Raza) : undefined,
            madreRaza: madreRaza ? (madreRaza as Raza) : undefined,
            sexo: tipoMascotaToSexo(tipoMascota as TipoMascota),
            color: sanitizeText(color),
            descripcion: sanitizeRichText(descripcion),
            edad: tipoPublicacion === "adopcion" ? sanitizeText(`${edadValor.trim()} ${edadUnidad}`) : undefined,
            imagenUrl: finalImagenUrl,
          },
          ubicacion: sanitizeText(currentUser?.ubicacion ?? ""),
          fechaEncuentro: tipoPublicacion === "perdida" || tipoPublicacion === "buscada" ? new Date(fechaEncuentro) : undefined,
          contactoNombre: sanitizeText(contactoNombre),
          contactoTelefono: contactoTelefono,
          contactoEmail: contactoEmail,
          mostrarContactoPublico: mostrarContactoPublicoFlag,
          usuarioId: currentUser?.id || "",
          activa: true,
          transitoUrgente: tipoPublicacion === "perdida" ? transitoUrgente : false,
        })
        toast.success("¡Publicación creada exitosamente!")
      }

      resetForm()
      onClose()
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
    setTipoMascota("")
    setRaza("")
    setPadreRaza("")
    setMadreRaza("")
    setColor("")
    setDescripcion("")
    setEdadValor("")
    setEdadUnidad("años")
    setFechaEncuentro("")
    setTransitoUrgente(false)
    setImageFile(null)
    setShowCropEditor(false)
    if (croppedPreview) URL.revokeObjectURL(croppedPreview)
    setCroppedBlob(null)
    setCroppedPreview(null)
    setEditingId(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isAuthenticated) {
    return (
      <SimpleModal isOpen={isOpen} onClose={handleClose}>
        <h2 className="text-lg font-semibold mb-2">Inicia sesión para publicar</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Debés iniciar sesión para poder publicar una mascota perdida, encontrada o en adopción.
        </p>
        <Button className="w-full" onClick={() => { handleClose(); onRequireAuth(); }}>
          Iniciar sesión
        </Button>
      </SimpleModal>
    )
  }

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

      <h2 className="text-lg font-semibold -mt-1">Publicar mascota</h2>

      {paso === 1 && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setTipoPublicacion("buscada")
                setPaso(2)
              }}
              className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
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
              className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
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
              className="flex flex-col items-center justify-center p-6 gap-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
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
                value={tipoMascota}
                onValueChange={(v) => {
                  setTipoMascota(v as TipoMascota)
                  setRaza("")
                  setPadreRaza("")
                  setMadreRaza("")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="perra">Perra</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="gata">Gata</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Select
                value={raza}
                onValueChange={(v) => {
                  setRaza(v as Raza)
                  if (!isMestizoRaza(v)) {
                    setPadreRaza("")
                    setMadreRaza("")
                  }
                }}
                disabled={!tipoMascota}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Raza" />
                </SelectTrigger>
                <SelectContent>
                  {tipoMascota &&
                    getRazasPorTipoMascota(tipoMascota).map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMestizoRaza(raza) && (
            <div className="grid gap-2 sm:grid-cols-2 -mt-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="madre-raza" className="whitespace-nowrap">
                  Madre
                </Label>
                <div className="flex-1">
                  <Select
                    value={madreRaza}
                    onValueChange={(v) => setMadreRaza(v as Raza)}
                    disabled={!parentRazas.length}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Raza" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentRazas.map((option) => (
                        <SelectItem key={`madre-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="padre-raza" className="whitespace-nowrap">
                  Padre
                </Label>
                <div className="flex-1">
                  <Select
                    value={padreRaza}
                    onValueChange={(v) => setPadreRaza(v as Raza)}
                    disabled={!parentRazas.length}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Raza" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentRazas.map((option) => (
                        <SelectItem key={`padre-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="color" className="font-semibold">
                Color
              </Label>
              <Input
                id="color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ejemplo: Marrón con manchas blancas"
                required
                aria-required="true"
                className="w-full"
                maxLength={75}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Label htmlFor="descripcion" className="font-semibold">
                Descripción
              </Label>
              <span id="descripcion-counter">
                {Math.max(DESCRIPCION_MAX_LENGTH - descripcion.length, 0)} caracteres restantes
              </span>
            </div>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="No obligatoria, pero entre más detalles brindes, más chances hay de encontrar a la mascota o conseguirle un hogar"
              rows={4}
              maxLength={DESCRIPCION_MAX_LENGTH}
              aria-describedby="descripcion-counter"
              className="min-h-[80px] placeholder:text-xs"
            />
          </div>

          <div className="space-y-2 mt-[20px] mb-2">
            {tipoPublicacion === "perdida" || tipoPublicacion === "buscada" ? (
              <div className="space-y-2">
                <Label htmlFor="fecha">
                  {tipoPublicacion === "perdida" ? "Fecha de cuando fue encontrada" : "Fecha de cuando se perdió"}
                </Label>
                <div className="relative">
                  <input
                    ref={dateInputRef}
                    id="fecha"
                    type="date"
                    value={fechaEncuentro}
                    onChange={(e) => setFechaEncuentro(e.target.value)}
                    className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 h-9 text-base"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edad-valor">Edad (puede ser aproximada)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="edad-valor"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={edadValor}
                    onChange={(e) => setEdadValor(sanitizeEdadValor(e.target.value, edadUnidad))}
                    placeholder="Número"
                    required
                    className="w-full"
                  />
                  <Select
                    value={edadUnidad}
                    onValueChange={(v) => {
                      const nextUnit = v as "años" | "días"
                      setEdadUnidad(nextUnit)
                      setEdadValor((current) => sanitizeEdadValor(current, nextUnit))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="días">días</SelectItem>
                      <SelectItem value="años">años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

          <div className="flex gap-3 py-2">
            <Button type="submit" className="flex-1" disabled={isLoading || isUploadingImage}>
              {isLoading || isUploadingImage ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      )}
    </SimpleModal>
  )
}
