"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, X, AlertTriangle } from "lucide-react"
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
  transitoUrgente: boolean
  onTipoPublicacionChange: (value: TipoPublicacion | undefined) => void
  onEspecieChange: (value: Especie | "todos") => void
  onRazaChange: (value: string | "todos") => void
  onSexoChange: (value: Sexo | "todos") => void
  onUbicacionChange: (value: string) => void
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
  transitoUrgente,
  onTipoPublicacionChange,
  onEspecieChange,
  onRazaChange,
  onSexoChange,
  onUbicacionChange,
  onTransitoUrgenteChange,
  onClearFilters,
  onSearch,
  hasActiveFilters,
}: FiltrosPublicacionesProps) {
  const [hintFirst, setHintFirst] = useState(false)
  const [hintSecond, setHintSecond] = useState(false)

  useEffect(() => {
    // Play a subtle hint animation: first button, then second
    const t1 = setTimeout(() => setHintFirst(true), 300)
    const t2 = setTimeout(() => setHintFirst(false), 900)
    const t3 = setTimeout(() => setHintSecond(true), 1100)
    const t4 = setTimeout(() => setHintSecond(false), 1700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])
  return (
    <div className="flex flex-col gap-4">
      {/* Tabs Type Selector */}
      <div className="flex w-full items-center justify-between gap-2 p-1 bg-muted/30 rounded-xl border">
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "perdida"
            ? "bg-[#FF8A65] text-white shadow-sm"
            : "text-muted-foreground hover:bg-muted/50"
            } ${hintFirst ? 'shadow-lg ring-2 ring-primary/30' : ''}`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "perdida" ? undefined : "perdida")}
          aria-pressed={tipoPublicacion === "perdida"}
        >
          Mascotas perdidas, que esperan ser encontradas por sus dueños
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium flex-1 text-center rounded-lg transform-gpu transition-all duration-150 active:scale-95 active:translate-y-0.5 focus:outline-none cursor-pointer select-none ${tipoPublicacion === "adopcion"
            ? "bg-[#FF8A65] text-white shadow-sm"
            : "text-muted-foreground hover:bg-muted/50"
            } ${hintSecond ? 'shadow-lg ring-2 ring-primary/30' : ''}`}
          onClick={() => onTipoPublicacionChange(tipoPublicacion === "adopcion" ? undefined : "adopcion")}
          aria-pressed={tipoPublicacion === "adopcion"}
        >
          Mascotas en adopcion, que buscan su primer familia
        </button>
      </div>

      <div className="rounded-xl border border-primary bg-primary p-4 shadow-sm w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por ubicacion..."
              value={ubicacion}
              onChange={(e) => onUbicacionChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="bg-white/10 border-white/30 placeholder:text-white/70"
              style={{ color: 'white' }}
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
              <SelectTrigger className="w-full sm:w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70">
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
              <SelectTrigger className="w-full sm:w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70">
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
              <SelectTrigger className="w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70">
                <SelectValue placeholder="Genero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Genero</SelectItem>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="hembra">Hembra</SelectItem>
                <SelectItem value="desconocido">Desconocido</SelectItem>
              </SelectContent>
            </Select>

            {tipoPublicacion === "perdida" && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onTransitoUrgenteChange(!transitoUrgente)}
                className={`shrink-0 ${transitoUrgente
                  ? "bg-[#B71C1C] hover:bg-[#D32F2F] !border-[#B71C1C]"
                  : "bg-white/10 hover:bg-white/20 !border-white/30"
                  }`}
                title="Filtrar tránsito urgente"
              >
                <AlertTriangle className={`h-4 w-4 ${transitoUrgente ? 'text-white' : 'text-white'}`} />
                <span className="sr-only">Tránsito urgente</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onSearch}
              className="shrink-0 bg-white/10 hover:bg-white/20 !border-white/30"
            >
              <Search className="h-4 w-4 text-white" />
              <span className="sr-only">Buscar</span>
            </Button>

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
    </div>
  )
}
