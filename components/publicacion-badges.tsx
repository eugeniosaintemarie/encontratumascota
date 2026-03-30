import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin } from "lucide-react"
import { getPublicacionInfo, formatEdad } from "@/lib/publicacion-utils"
import type { Publicacion } from "@/lib/types"

interface PublicacionBadgesProps {
  publicacion: Publicacion
  className?: string
  badgeClassName?: string
}

export function PublicacionBadges({ publicacion, className = "", badgeClassName = "" }: PublicacionBadgesProps) {
  const info = getPublicacionInfo(publicacion)

  return (
    <>
      {/* Arriba a la izquierda: Tipo (Perro/a/etc) */}
      <div className={`absolute left-3 top-3 ${className}`}>
        <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm border-0 ${badgeClassName}`}>
          {info.tipo}
        </Badge>
      </div>

      {/* Centro superior: edad/fecha en que se perdió/encontró */}
      <div className={`absolute left-1/2 top-3 -translate-x-1/2 ${className}`}>
        <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs border-0 ${badgeClassName}`}>
          {info.edadOFecha}
        </Badge>
      </div>

      {/* Abajo a la izquierda: raza */}
      <div className={`absolute left-3 bottom-3 flex flex-col gap-1.5 ${className}`}>
        {info.transitoUrgente && (
          <Badge variant="secondary" className={`text-white backdrop-blur-sm text-xs flex items-center gap-1 border-0 w-fit ${badgeClassName}`} style={{ backgroundColor: "#F44336" }}>
            <AlertTriangle className="h-3 w-3" />
            Tránsito urgente
          </Badge>
        )}
        {info.esMestizo ? (
          <>
            <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0 text-xs ${badgeClassName}`}>
              {info.razaDetalle?.split("\n")[0]}
            </Badge>
            <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0 text-xs ${badgeClassName}`}>
              {info.razaDetalle?.split("\n")[1]}
            </Badge>
          </>
        ) : info.raza ? (
          <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0 text-xs ${badgeClassName}`}>
            {info.raza}
          </Badge>
        ) : null}
      </div>

      {/* Abajo a la derecha: ubicación */}
      <div className={`absolute right-3 bottom-3 ${className}`}>
        <Badge variant="secondary" className={`bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs flex items-center gap-1 border-0 ${badgeClassName}`}>
          <MapPin className="h-3 w-3" />
          {info.ubicacionCorta}
        </Badge>
      </div>
    </>
  )
}

interface PublicacionDetalleProps {
  publicacion: Publicacion
  className?: string
}

export function PublicacionDetalle({ publicacion, className = "" }: PublicacionDetalleProps) {
  const info = getPublicacionInfo(publicacion)
  
  const descripcionLimitada = info.descripcion.length > 100
    ? info.descripcion.slice(0, 100).trim() + "..."
    : info.descripcion
  const descripcionFormateada = descripcionLimitada.charAt(0).toUpperCase() + descripcionLimitada.slice(1).toLowerCase()

  return (
    <div className={className}>
      <p className="text-sm text-foreground/80 line-clamp-6 mb-[10px] min-h-[120px]">
        <span className="font-semibold block">
          {info.categoria}
        </span>
        {info.color && <span className="block">{info.color}</span>}
        {descripcionFormateada && <span className="italic">{descripcionFormateada}</span>}
      </p>
    </div>
  )
}
