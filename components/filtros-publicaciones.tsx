"use client"

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
import type { Especie, Sexo } from "@/lib/types"

interface FiltrosPublicacionesProps {
  especie: Especie | "todos"
  sexo: Sexo | "todos"
  ubicacion: string
  transitoUrgente: boolean
  onEspecieChange: (value: Especie | "todos") => void
  onSexoChange: (value: Sexo | "todos") => void
  onUbicacionChange: (value: string) => void
  onTransitoUrgenteChange: (value: boolean) => void
  onClearFilters: () => void
  onSearch: () => void
  hasActiveFilters: boolean
}

export function FiltrosPublicaciones({
  especie,
  sexo,
  ubicacion,
  transitoUrgente,
  onEspecieChange,
  onSexoChange,
  onUbicacionChange,
  onTransitoUrgenteChange,
  onClearFilters,
  onSearch,
  hasActiveFilters,
}: FiltrosPublicacionesProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <h2 className="text-lg font-semibold text-foreground shrink-0">
        Mascotas que esperan ser encontradas por sus dueños:
      </h2>
      <div className="rounded-xl border border-primary bg-primary p-4 shadow-sm flex-1">
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

        <div className="flex gap-3">
          <Select
            value={especie}
            onValueChange={(v) => onEspecieChange(v as Especie | "todos")}
          >
            <SelectTrigger className="w-[140px] bg-white/10 !text-white border-white/30 [&_svg]:!text-white/70">
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => onTransitoUrgenteChange(!transitoUrgente)}
            className={`shrink-0 ${
              transitoUrgente
                ? "bg-[#F44336] hover:bg-[#D32F2F] !border-[#F44336]"
                : "bg-white/10 hover:bg-white/20 !border-white/30"
            }`}
            title="Filtrar tránsito urgente"
          >
            <AlertTriangle className={`h-4 w-4 ${transitoUrgente ? 'text-white' : 'text-white'}`} />
            <span className="sr-only">Tránsito urgente</span>
          </Button>

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
