"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LocationAutocomplete from "@/components/location-autocomplete"
import DatePicker from "@/components/ui/date-picker"
import { X } from "lucide-react"
import type { TipoMascota, TipoPublicacion } from "@/lib/types"
import { getRazasPorTipoMascota } from "@/lib/labels"

interface FiltrosPublicacionesProps {
  tipoPublicacion: TipoPublicacion | undefined
  tipoMascota: TipoMascota | "todos"
  raza: string | "todos"
  ubicacion: string
  fechaDesde?: string
  transitoUrgente: boolean
  hideTipoSelector?: boolean
  wideUbicacion?: boolean
  onTipoPublicacionChange: (value: TipoPublicacion | undefined) => void
  onTipoMascotaChange: (value: TipoMascota | "todos") => void
  onRazaChange: (value: string | "todos") => void
  onUbicacionChange: (value: string) => void
  onFechaDesdeChange?: (value: string) => void
  onTransitoUrgenteChange: (value: boolean) => void
  onClearFilters: () => void
  onSearch: () => void
  hasActiveFilters: boolean
}

export function FiltrosPublicaciones({
  tipoPublicacion,
  tipoMascota,
  raza,
  ubicacion,
  fechaDesde,
  onTipoPublicacionChange,
  onTipoMascotaChange,
  onRazaChange,
  onUbicacionChange,
  onFechaDesdeChange,
  onClearFilters,
  hasActiveFilters,
  hideTipoSelector = false,
  wideUbicacion = false,
}: FiltrosPublicacionesProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tabs Type Selector */}
      {!hideTipoSelector && (
        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2 p-1 bg-muted/30 rounded-xl border">
          <Link
            href="/buscadas"
            className="flex w-full sm:flex-1 items-center justify-center px-4 py-2 text-sm font-medium text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none text-foreground dark:!text-white hover:bg-muted/50 bg-muted/30 whitespace-nowrap"
          >
            Ver mascotas{"\u00A0"}<b> perdidas</b>
          </Link>
          <button
            className={`px-4 py-2 text-sm font-medium w-full sm:flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "perdida"
              ? "!bg-[var(--salmon)] !text-white shadow-sm dark:!bg-[var(--salmon)] dark:!text-white"
              : "text-foreground dark:!text-white hover:bg-muted/50"
              }`}
            onClick={() => onTipoPublicacionChange(tipoPublicacion === "perdida" ? undefined : "perdida")}
            aria-pressed={tipoPublicacion === "perdida"}
          >
            Ver mascotas{"\u00A0"}<b> encontradas</b>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium w-full sm:flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "adopcion"
              ? "!bg-[var(--salmon)] !text-white shadow-sm dark:!bg-[var(--salmon)] dark:!text-white"
              : "text-foreground dark:!text-white hover:bg-muted/50"
              }`}
            onClick={() => onTipoPublicacionChange(tipoPublicacion === "adopcion" ? undefined : "adopcion")}
            aria-pressed={tipoPublicacion === "adopcion"}
          >
            Ver mascotas en{"\u00A0"}<b> adopción</b>
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
                value={tipoMascota === "todos" ? "" : tipoMascota}
                onValueChange={(v) => {
                  const newValue = v || "todos"
                  onTipoMascotaChange(newValue as TipoMascota | "todos")
                  onRazaChange("todos")
                }}
              >
                <SelectTrigger
                  className="w-full !bg-[var(--salmon)] !text-white border-white/30 [&_svg]:!text-white/70"
                >
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

              {/* Raza */}
              <Select
                value={raza === "todos" ? "" : raza}
                onValueChange={(v) => onRazaChange(v || "todos")}
                disabled={tipoMascota === "todos" || tipoMascota === "otro"}
              >
                <SelectTrigger
                  className="w-full !bg-[var(--salmon)] !text-white border-white/30 [&_svg]:!text-white/70"
                >
                  <SelectValue placeholder="Raza" />
                </SelectTrigger>
                <SelectContent>
                  {tipoMascota !== "todos" && tipoMascota !== "otro" && getRazasPorTipoMascota(tipoMascota)?.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fecha */}
              {tipoPublicacion !== 'adopcion' && (
                <div className="w-full !text-base">
                  <DatePicker
                    id="fecha-buscador"
                    value={fechaDesde}
                    onChange={(v) => onFechaDesdeChange?.(v)}
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
                  aria-label="Limpiar filtros"
                >
                  <X className="h-4 w-4 text-white" aria-hidden="true" />
                  <span className="sr-only">Limpiar filtros</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--salmon)] p-6 text-center text-sm text-white">
          Selecciona <b>encontradas</b> o en <b>adopción</b> para activar los filtros de búsqueda
        </div>
      )}
    </div>
  )
}
