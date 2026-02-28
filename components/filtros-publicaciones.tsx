"use client"

import { useState } from "react"
import Link from "next/link"
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
import { razasPorEspecie } from "@/lib/labels"

interface FiltrosPublicacionesProps {
  tipoPublicacion: TipoPublicacion | undefined
  especie: Especie | "todos"
  raza: string | "todos"
  sexo: Sexo | "todos"
  ubicacion: string
  fechaDesde?: string
  transitoUrgente: boolean
  hideTipoSelector?: boolean
  wideUbicacion?: boolean
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
  hideTipoSelector = false,
  wideUbicacion = false,
}: FiltrosPublicacionesProps) {
  // Hint animation removed: buttons are static now
  const [activeClearField, setActiveClearField] = useState<string | null>(null)

  const clearField = (field: string) => {
    switch (field) {
      case 'especie':
        onEspecieChange('todos')
        onRazaChange('todos')
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
      {/* Link to buscadas page */}
      {!hideTipoSelector && (
        <Link
          href="/buscadas"
          className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none text-foreground dark:!text-white hover:bg-muted/50 bg-muted/30 border"
        >
          Ver&nbsp;<b>mascotas perdidas</b>, buscadas por sus familias ▶️
        </Link>
      )}

      {/* Tabs Type Selector */}
      {!hideTipoSelector && (
        <div className="flex w-full items-center justify-between gap-2 p-1 bg-muted/30 rounded-xl border">
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "perdida"
            ? "!bg-[var(--salmon)] !text-white shadow-sm dark:!bg-[var(--salmon)] dark:!text-white"
            : "text-foreground dark:!text-white hover:bg-muted/50"
            }`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "perdida" ? undefined : "perdida")}
          aria-pressed={tipoPublicacion === "perdida"}
        >
          Ver <b>mascotas perdidas</b>, que esperan ser encontradas por sus dueños 🔽
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "adopcion"
            ? "!bg-[var(--salmon)] !text-white shadow-sm dark:!bg-[var(--salmon)] dark:!text-white"
            : "text-foreground dark:!text-white hover:bg-muted/50"
            }`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "adopcion" ? undefined : "adopcion")}
          aria-pressed={tipoPublicacion === "adopcion"}
        >
          Ver <b>mascotas en adopción</b>, que buscan su primer familia 🔽
        </button>
      </div>
      )}

      {tipoPublicacion !== undefined ? (
        <div className="rounded-xl bg-[var(--salmon)] p-4 shadow-sm w-full">
          {/* Main container - column on mobile, row on lg (1024px+) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Location - full width on mobile, 1/3 on large screens (or 1/2 if wideUbicacion) */}
            <div className={`relative w-full ${wideUbicacion ? 'lg:w-1/2' : 'lg:w-1/3'}`}>
              <LocationAutocomplete
                value={ubicacion}
                onChange={(v) => onUbicacionChange(v)}
                onSelect={(place) => onUbicacionChange(place.address)}
                placeholder="Buscar por ubicación..."
                showDropdown={false}
                className="bg-[var(--salmon)] placeholder:text-white text-white !text-base placeholder:!text-base"
              />
            </div>

            {/* Filters grid - 2 columns on tablet, row on lg (1024px+) - takes 2/3 (or 1/2 if wideUbicacion) */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 w-full ${wideUbicacion ? 'lg:grid-cols-[1fr_1fr_1fr_auto] lg:w-1/2' : 'lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:w-2/3'}`}>
              {/* Tipo */}
              <Select
                value={especie === "todos" ? "" : especie}
                onValueChange={(v) => {
                  const newValue = v || "todos"
                  onEspecieChange(newValue as Especie | "todos")
                  onRazaChange("todos")
                }}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('especie')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-full !bg-[var(--salmon)] !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              {/* Raza */}
              <Select
                value={raza === "todos" ? "" : raza}
                onValueChange={(v) => onRazaChange(v || "todos")}
                disabled={especie === "todos" || especie === "otro"}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('raza')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-full !bg-[var(--salmon)] !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Raza" />
                </SelectTrigger>
                <SelectContent>
                  {especie !== "todos" && especie !== "otro" && razasPorEspecie[especie]?.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Género */}
              <Select
                value={sexo === "todos" ? "" : sexo}
                onValueChange={(v) => onSexoChange((v || "todos") as Sexo | "todos")}
              >
                <SelectTrigger
                  onFocus={() => setActiveClearField('sexo')}
                  onBlur={() => setActiveClearField(null)}
                  className="w-full !bg-[var(--salmon)] !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                  <SelectItem value="desconocido">Desconocido</SelectItem>
                </SelectContent>
              </Select>

              {/* Fecha */}
              {tipoPublicacion !== 'adopcion' && (
                <div className="w-full !text-base">
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

              {/* X button - centered on mobile/tablet, inline on lg */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearFilters}
                  className="shrink-0 hover:bg-white/20 mx-auto lg:mx-0 lg:self-center col-span-full sm:col-span-2 lg:col-span-1"
                >
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">Limpiar filtros</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--salmon)] p-6 text-center text-sm text-white">
          Selecciona arriba el tipo de mascota que estás buscando para activar los filtros de búsqueda
        </div>
      )}
    </div>
  )
}
