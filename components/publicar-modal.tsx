"use client"

import React from "react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { Especie, Sexo, Raza } from "@/lib/types"

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
  
  // Form state
  const [especie, setEspecie] = useState<Especie | "">("")
  const [raza, setRaza] = useState<Raza | "">("")
  const [sexo, setSexo] = useState<Sexo | "">("")
  const [color, setColor] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [fechaEncuentro, setFechaEncuentro] = useState("")
  const [contactoNombre, setContactoNombre] = useState("")
  const [contactoTelefono, setContactoTelefono] = useState("")
  const [contactoEmail, setContactoEmail] = useState("")
  const [imagenUrl, setImagenUrl] = useState("")

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
    setIsLoading(true)
    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    resetForm()
    onClose()
    alert("Publicacion creada exitosamente!")
  }

  const resetForm = () => {
    setEspecie("")
    setRaza("")
    setSexo("")
    setColor("")
    setDescripcion("")
    setUbicacion("")
    setFechaEncuentro("")
    setContactoNombre("")
    setContactoTelefono("")
    setContactoEmail("")
    setImagenUrl("")
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
              Autenticacion requerida
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Inicia sesion para cargar una mascota encontrada
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  handleClose()
                  onRequireAuth()
                }}
              >
                Iniciar Sesion
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Publicar mascota encontrada
          </DialogTitle>
        </DialogHeader>

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
              <Label htmlFor="ubicacion">Ubicacion donde fue encontrada</Label>
              <Input
                id="ubicacion"
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Palermo, CABA"
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagen">URL de la imagen (opcional)</Label>
            <Input
              id="imagen"
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Publicando..." : "Publicar"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
