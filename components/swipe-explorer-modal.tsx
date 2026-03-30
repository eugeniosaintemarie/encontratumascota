"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSharePublicacion } from "@/hooks/use-share-publicacion"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { razasLabels, tipoMascotaLabels } from "@/lib/labels"
import { especieSexoToTipo } from "@/lib/types"
import { isMestizoRaza, truncateUbicacion } from "@/lib/utils"
import { X, MapPin, RotateCcw, Share2, Check, Loader2 } from "lucide-react"

interface SwipeExplorerModalProps {
    isOpen: boolean
    onClose: () => void
}

const SWIPE_THRESHOLD = 110

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year}`
}

function formatEdad(edad?: string | null): string {
    if (!edad) return ""
    const parts = edad.trim().split(/\s+/)
    if (parts.length < 2) return edad
    const num = parseInt(parts[0], 10)
    if (isNaN(num)) return edad
    const unidad = parts[1].toLowerCase()
    if (unidad.startsWith("año")) {
        return num === 1 ? "1 año" : `${num} años`
    }
    if (unidad.startsWith("día") || unidad.startsWith("dia")) {
        return num === 1 ? "1 día" : `${num} días`
    }
    return edad
}

export function SwipeExplorerModal({ isOpen, onClose }: SwipeExplorerModalProps) {
    const router = useRouter()
    const { publicaciones, loading } = usePublicaciones()

    const deck = useMemo(
        () =>
            publicaciones.filter(
                (pub) => pub.activa && (pub.tipoPublicacion === "perdida" || pub.tipoPublicacion === "adopcion")
            ),
        [publicaciones]
    )

    const [index, setIndex] = useState(0)
    const [dragX, setDragX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    const pointerStartXRef = useRef(0)
    const timeoutRef = useRef<number | null>(null)

    const current = deck[index]
    const next = deck[index + 1]
    const { isSharing, isCopied, handleShare } = useSharePublicacion(current ?? null)

    const clearTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    const resetDeck = useCallback(() => {
        clearTimer()
        setIndex(0)
        setDragX(0)
        setIsDragging(false)
    }, [clearTimer])

    useEffect(() => {
        if (!isOpen) {
            resetDeck()
            return
        }

        // Avoid background scroll while user swipes cards.
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = "unset"
            clearTimer()
        }
    }, [isOpen, resetDeck, clearTimer])

    useEffect(() => {
        if (deck.length === 0) {
            setIndex(0)
            return
        }

        if (index >= deck.length) {
            setIndex(deck.length)
        }
    }, [deck.length, index])

    const animateAndAdvance = useCallback((direction: -1 | 1) => {
        clearTimer()
        setDragX(direction * 1200)
        setIsDragging(false)

        timeoutRef.current = window.setTimeout(() => {
            setIndex((prev) => Math.min(prev + 1, deck.length))
            setDragX(0)
        }, 180)
    }, [clearTimer, deck.length])

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (!current) return
        setIsDragging(true)
        pointerStartXRef.current = event.clientX
            ; (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const delta = event.clientX - pointerStartXRef.current
        setDragX(delta)
    }

    const handlePointerEnd = () => {
        if (!isDragging) return

        const abs = Math.abs(dragX)
        if (abs > SWIPE_THRESHOLD) {
            animateAndAdvance(dragX > 0 ? 1 : -1)
            return
        }

        setIsDragging(false)
        setDragX(0)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-transparent p-0 shadow-none sm:top-0 sm:max-w-none sm:translate-y-0"
            >
                <DialogTitle className="sr-only">Explorar publicaciones con swipe</DialogTitle>

                <div className="relative flex h-full w-full flex-col overflow-hidden bg-background/90 backdrop-blur-[48px]">
                    <div className="absolute right-4 top-4 z-50">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full border-0 bg-card/70 text-foreground hover:bg-card"
                            onClick={onClose}
                            aria-label="Cerrar explorador"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex flex-1 items-center justify-center px-4 pb-6 pt-4">
                        {loading ? (
                            <p className="text-foreground/80">Cargando publicaciones...</p>
                        ) : deck.length === 0 ? (
                            <p className="text-foreground/80">No hay mascotas publicadas para mostrar</p>
                        ) : index >= deck.length ? (
                            <div className="text-center text-foreground">
                                <p className="text-lg font-semibold">Ya viste todas las publicaciones</p>
                                <Button onClick={resetDeck} className="mt-4" variant="secondary">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Volver a empezar
                                </Button>
                            </div>
                        ) : (
                            <div className="relative h-[min(72vh,640px)] w-[min(92vw,390px)] select-none touch-none">
                                {next && (
                                    <div className="absolute inset-0 rounded-3xl bg-white/10 blur-[1px]" style={{ transform: "scale(0.96) translateY(8px)" }} />
                                )}

                                <article
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerEnd}
                                    onPointerCancel={handlePointerEnd}
                                    className="absolute inset-0 overflow-hidden rounded-3xl border border-border/70 bg-card text-card-foreground shadow-2xl"
                                    style={{
                                        transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
                                        transition: isDragging ? "none" : "transform 220ms ease-out",
                                    }}
                                >
                                    <div className="relative h-[72%]">
                                        <Image
                                            src={current?.mascota.imagenUrl || "/placeholder.svg"}
                                            alt={current ? `${tipoMascotaLabels[especieSexoToTipo(current.mascota.especie, current.mascota.sexo)]} ${razasLabels[current.mascota.raza]}` : "Mascota"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 92vw, 390px"
                                            priority={index === 0}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                                        {current && (
                                            <div className="absolute right-3 top-3 z-10">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm shadow-sm border-0 hover:bg-card transition-all"
                                                    onPointerDown={(event) => event.stopPropagation()}
                                                    onPointerUp={(event) => event.stopPropagation()}
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        event.stopPropagation()
                                                        handleShare()
                                                    }}
                                                    disabled={isSharing}
                                                    aria-label="Compartir publicación"
                                                >
                                                    {isSharing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                                    ) : isCopied ? (
                                                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                                                    ) : (
                                                        <Share2 className="h-4 w-4" aria-hidden="true" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm border-0">
                                                    {current ? tipoMascotaLabels[especieSexoToTipo(current.mascota.especie, current.mascota.sexo)] : ""}
                                                </Badge>
                                            </div>
                                            {current && isMestizoRaza(current.mascota.raza) && (
                                                <>
                                                    {current.mascota.madreRaza && (
                                                        <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0">
                                                            Madre: {razasLabels[current.mascota.madreRaza]}
                                                        </Badge>
                                                    )}
                                                    {current.mascota.padreRaza && (
                                                        <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0">
                                                            Padre: {razasLabels[current.mascota.padreRaza]}
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                            {current && !isMestizoRaza(current.mascota.raza) && (
                                                <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0">
                                                    {razasLabels[current.mascota.raza]}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="absolute left-3 bottom-3">
                                            <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs flex items-center gap-1 border-0">
                                                <MapPin className="h-4 w-4" />
                                                {truncateUbicacion(current?.ubicacion)}
                                            </Badge>
                                        </div>

                                        <div className="absolute right-3 bottom-3">
                                            <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs border-0">
                                                {current?.tipoPublicacion === "adopcion"
                                                    ? formatEdad(current?.mascota.edad)
                                                    : current?.fechaEncuentro && current.fechaEncuentro.getFullYear() > 1970
                                                        ? formatDate(current.fechaEncuentro)
                                                        : ""}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex h-[28%] flex-col justify-between p-4 text-card-foreground">
                                        <p className="text-sm text-foreground/80 line-clamp-6">
                                            <span className="font-semibold block">
                                                {current?.tipoPublicacion === "adopcion"
                                                    ? "En adopción"
                                                    : current?.tipoPublicacion === "buscada"
                                                        ? current?.mascota.sexo === "hembra" ? "Buscada" : "Buscado"
                                                        : current?.mascota.sexo === "hembra" ? "Encontrada" : "Encontrado"}
                                            </span>
                                            {current?.mascota.color && <span className="block">{current.mascota.color}</span>}
                                            {current?.mascota.descripcion && <span className="italic">{current.mascota.descripcion}</span>}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                                            <p className="text-xs font-medium text-muted-foreground"></p>
                                            <button
                                                type="button"
                                                onPointerDown={(event) => event.stopPropagation()}
                                                onPointerUp={(event) => event.stopPropagation()}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    if (!current) return
                                                    onClose()
                                                    router.push(`/publicacion/${current.id}`)
                                                }}
                                                className="inline-flex items-center gap-1 text-[#FF8A65] hover:underline"
                                            >
                                                Contacto
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
