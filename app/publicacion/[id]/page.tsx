import type { Metadata } from "next";
import Script from "next/script";
import { getShareText } from "@/lib/publicacion-utils";
import { PublicacionDetail } from "./publicacion-detail";
import { tipoMascotaLabels, razasLabels } from "@/lib/labels";
import { especieSexoToTipo } from "@/lib/types";
import type { Especie, Sexo, Raza } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

async function fetchPublicacion(id: string) {
  try {
    const { getPublicacionById } = await import("@/lib/actions/publicaciones");
    return await getPublicacionById(id);
  } catch (e) {
    console.error("Error fetching from DB:", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const publicacion = await fetchPublicacion(id);

  if (!publicacion) {
    return {
      title: "Publicación no encontrada | Encontra Tu Mascota",
    };
  }

  const shareText = getShareText(publicacion);
  const lines = shareText.split("\n");
  const title = lines[0];
  const description = lines[1] || publicacion.mascota.descripcion;
  const { mascota } = publicacion;

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
  };
}

export default async function PublicacionPage({ params }: Props) {
  const { id } = await params;
  const publicacion = await fetchPublicacion(id);

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
    );
  }

  // Generate JSON-LD structured data for better SEO
  const { mascota } = publicacion;
  const tipoTexto =
    publicacion.tipoPublicacion === "buscada"
      ? "buscado/a"
      : publicacion.tipoPublicacion === "adopcion"
        ? "en adopción"
        : "encontrado/a";

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Article",
    headline: `${tipoMascotaLabels[especieSexoToTipo(mascota.especie as Especie, mascota.sexo as Sexo)]} ${razasLabels[mascota.raza as Raza]} ${tipoTexto}`,
    description: mascota.descripcion,
    image: mascota.imagenUrl,
    datePublished: publicacion.fechaPublicacion.toISOString(),
    author: {
      "@type": "Organization",
      name: "Encontra Tu Mascota",
    },
    mainEntity: {
      "@type": "Pet",
      name: `${tipoMascotaLabels[especieSexoToTipo(mascota.especie as Especie, mascota.sexo as Sexo)]} ${razasLabels[mascota.raza as Raza]}`,
      breed: razasLabels[mascota.raza as Raza],
      image: mascota.imagenUrl,
      description: mascota.descripcion,
      identifier: publicacion.id,
      potentialAction: {
        "@type": "ContactAction",
        name:
          publicacion.tipoPublicacion === "buscada"
            ? "Reportar ubicación"
            : "Contactar propietario",
      },
    },
    spatialCoverage: {
      "@type": "Place",
      name: publicacion.ubicacion,
    },
  };

  return (
    <>
      <Script
        id={`json-ld-${publicacion.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicacionDetail publicacion={publicacion} />
    </>
  );
}
