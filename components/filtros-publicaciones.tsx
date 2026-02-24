"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import LocationAutocomplete from "@/components/location-autocomplete"
import DatePicker from "@/components/ui/date-picker"
import { Search, X } from "lucide-react"
import type { Especie, Sexo, TipoPublicacion, Raza } from "@/lib/types"

const razasPorEspecie: Record<string, { value: string; label: string }[]> = {
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
}

interface FiltrosPublicacionesProps {
  tipoPublicacion: TipoPublicacion | undefined
  especie: Especie | "todos"
  raza: string | "todos"
  sexo: Sexo | "todos"
  ubicacion: string
  fechaDesde?: string
  transitoUrgente: boolean
  onTipoPublicacionChange: (value: TipoPublicacion | undefined) => void
  onEspecieChange: (value: Especie | "todos") => void
  onRazaChange: (value: string | "todos") => void
  onSexoChange: (value: Sexo | "todos") => void
  onUbicacionChange: (value: string) => void
  onFechaDesdeChange?: (value: string) => void
  onTransitoUrgenteChange: (value: boolean) => void
  onClearFilters: () => void
  onSearch: () => void
  hasActiveFilters: boolean
}

export function FiltrosPublicaciones({
  tipoPublicacion,
  especie,
  raza,
  sexo,
  ubicacion,
  fechaDesde,
  transitoUrgente,
  onTipoPublicacionChange,
  onEspecieChange,
  onRazaChange,
  onSexoChange,
  onUbicacionChange,
  onFechaDesdeChange,
  onTransitoUrgenteChange,
  onClearFilters,
  onSearch,
  hasActiveFilters,
}: FiltrosPublicacionesProps) {
  // Hint animation removed: buttons are static now
  const [activeClearField, setActiveClearField] = useState<string | null>(null)

  const clearField = (field: string) => {
    switch (field) {
      case 'especie':
        onEspecieChange('todos')
        break
      case 'raza':
        onRazaChange('todos')
        break
      case 'sexo':
        onSexoChange('todos')
        break
      case 'ubicacion':
        onUbicacionChange('')
        break
      case 'fecha':
        onFechaDesdeChange?.('')
        break
      default:
        break
    }
    setActiveClearField(null)
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Tabs Type Selector */}
      <div className="flex w-full items-center justify-between gap-2 p-1 bg-muted/30 rounded-xl border">
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "perdida"
            ? "!bg-white !text-black shadow-sm"
            : "text-foreground dark:!text-white hover:bg-muted/50"
            }`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "perdida" ? undefined : "perdida")}
          aria-pressed={tipoPublicacion === "perdida"}
        >
          Mascotas perdidas, que esperan ser encontradas por sus dueños
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "adopcion"
            ? "!bg-white !text-black shadow-sm"
            : "text-foreground dark:!text-white hover:bg-muted/50"
            }`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "adopcion" ? undefined : "adopcion")}
          aria-pressed={tipoPublicacion === "adopcion"}
        >
          Mascotas en adopcion, que buscan su primer familia
        </button>
      </div>

      {tipoPublicacion !== undefined ? (
        <div className="rounded-xl border border-primary bg-primary p-4 shadow-sm w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <LocationAutocomplete
                value={ubicacion}
                onChange={(v) => onUbicacionChange(v)}
                onSelect={(place) => onUbicacionChange(place.address)}
                placeholder="Buscar por ubicacion..."
                showDropdown={false}
                className="bg-white/10 border-white/30 placeholder:text-white/70 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={especie}
                onValueChange={(v) => {
                  onEspecieChange(v as Especie | "todos")
                  onRazaChange("todos")
                }}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('especie')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-full sm:w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Tipo</SelectItem>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={raza}
                onValueChange={(v) => onRazaChange(v)}
                disabled={especie === "todos" || especie === "otro"}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('raza')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-full sm:w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Raza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Raza</SelectItem>
                  {especie !== "todos" && especie !== "otro" && razasPorEspecie[especie]?.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sexo}
                onValueChange={(v) => onSexoChange(v as Sexo | "todos")}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('sexo')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Genero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Genero</SelectItem>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                  <SelectItem value="desconocido">Desconocido</SelectItem>
                </SelectContent>
              </Select>

              {tipoPublicacion !== 'adopcion' && (
                <div className="w-full sm:w-[140px]">
                  <DatePicker
                    id="fecha-buscador"
                    value={fechaDesde}
                    onChange={(v) => onFechaDesdeChange?.(v)}
                    onFocus={() => setActiveClearField('fecha')}
                    onBlur={() => setActiveClearField(null)}
                    placeholder="Fecha"
                  />
                </div>
              )}

              {/* Fecha no tiene botón X propio; la X global limpia todos los filtros incluyendo la fecha */}

              {/* Search button removed: results filter as user types */}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearFilters}
                  className="shrink-0 hover:bg-white/20"
                >
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">Limpiar filtros</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#ff8a65] p-6 text-center text-sm text-white">
          Selecciona arriba el tipo de mascota que estas buscando para activar los filtros de busqueda
        </div>
      )}
    </div>
  )
}
