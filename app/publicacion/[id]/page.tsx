import type { Metadata } from "next"
import Script from "next/script"
import { especieLabels, generoLabels, razasLabels } from "@/lib/labels"
import { PublicacionDetail } from "./publicacion-detail"
import Link from "next/link"
import type { Especie, Sexo, Raza } from "@/lib/types"

type Props = {
  params: Promise<{ id: string }>
}

async function fetchPublicacion(id: string) {
  try {
    const { getPublicacionById } = await import("@/lib/actions/publicaciones")
    return await getPublicacionById(id)
  } catch (e) {
    console.error("Error fetching from DB:", e)
    return null
  }
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
  const transitoTag = publicacion.transitoUrgente ? " ¡Tránsito urgente!" : ""
  const title = `${especieLabels[mascota.especie as Especie]} ${generoLabels[mascota.sexo as Sexo].toLowerCase()} ${razasLabels[mascota.raza as Raza]} encontrado en ${ubicacionSinComa}${transitoTag}`
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
      </div>
    )
  }

  // Generate JSON-LD structured data for better SEO
  const { mascota } = publicacion
  const tipoTexto = publicacion.tipoPublicacion === "buscada"
    ? "buscado/a"
    : publicacion.tipoPublicacion === "adopcion"
    ? "en adopción"
    : "encontrado/a"
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Article",
    "headline": `${especieLabels[mascota.especie as Especie]} ${razasLabels[mascota.raza as Raza]} ${tipoTexto}`,
    "description": mascota.descripcion,
    "image": mascota.imagenUrl,
    "datePublished": publicacion.fechaPublicacion.toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Encontra Tu Mascota"
    },
    "mainEntity": {
      "@type": "Pet",
      "name": `${especieLabels[mascota.especie as Especie]} ${razasLabels[mascota.raza as Raza]}`,
      "breed": razasLabels[mascota.raza as Raza],
      "image": mascota.imagenUrl,
      "description": mascota.descripcion,
      "identifier": publicacion.id,
      "potentialAction": {
        "@type": "ContactAction",
        "name": publicacion.tipoPublicacion === "buscada" ? "Reportar ubicación" : "Contactar propietario"
      }
    },
    "spatialCoverage": {
      "@type": "Place",
      "name": publicacion.ubicacion
    }
  }

  return (
    <>
      <Script
        id={`json-ld-${publicacion.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicacionDetail publicacion={publicacion} />
    </>
  )
}
