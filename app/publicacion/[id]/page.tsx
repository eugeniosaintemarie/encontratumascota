import type { Metadata } from "next"
import { publicacionesMock } from "@/lib/mock-data"
import { especieLabels, generoLabels, razasLabels } from "@/lib/labels"
import { PublicacionDetail } from "./publicacion-detail"
import Link from "next/link"

type Props = {
  params: Promise<{ id: string }>
}

// Helper para obtener una publicacion por ID (DB o mock)
async function fetchPublicacion(id: string) {
  // Intentar desde la DB
  if (process.env.DATABASE_URL) {
    try {
      const { getPublicacionById } = await import("@/lib/actions/publicaciones")
      const pub = await getPublicacionById(id)
      if (pub) return pub
    } catch (e) {
      console.error("Error fetching from DB:", e)
    }
  }
  // Fallback a mock
  return publicacionesMock.find((p) => p.id === id) || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const publicacion = await fetchPublicacion(id)

  if (!publicacion) {
    return {
      title: "Publicación no encontrada | Encontra Tu Mascota",
    }
  }

  const { mascota } = publicacion
  const ubicacionSinComa = publicacion.ubicacion.replace(",", "")
  const transitoTag = publicacion.transitoUrgente ? " - Transito urgente" : ""
  const title = `${especieLabels[mascota.especie]} ${generoLabels[mascota.sexo].toLowerCase()} ${razasLabels[mascota.raza]} encontrado en ${ubicacionSinComa}${transitoTag}`
  const description = mascota.descripcion

  return {
    title: `${title} | Encontra Tu Mascota`,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: mascota.imagenUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      siteName: "Encontra Tu Mascota",
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [mascota.imagenUrl],
    },
  }
}

export default async function PublicacionPage({ params }: Props) {
  const { id } = await params
  const publicacion = await fetchPublicacion(id)

  if (!publicacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          Publicación no encontrada
        </h1>
        <p className="text-muted-foreground mb-8">
          La publicación que buscás no existe o fue eliminada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return <PublicacionDetail publicacion={publicacion} />
}
