import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Mascotas Buscadas | Encontra Tu Mascota",
  description:
    "Explora mascotas perdidas reportadas recientemente. Ayuda a reunir mascotas con sus familias. Búsqueda por especie, raza, ubicación y más.",
  openGraph: {
    title: "Mascotas Buscadas - Encontra Tu Mascota",
    description:
      "Mascotas perdidas esperando ser encontradas. Ayuda a reunirlas con sus familias.",
    type: "website",
    locale: "es_AR",
    siteName: "Encontra Tu Mascota",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mascotas Buscadas - Encontra Tu Mascota",
    description:
      "Mascotas perdidas esperando ser encontradas. Ayuda a reunirlas con sus familias.",
  },
};

export default function BuscadasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Mascotas Buscadas",
    description: "Mascotas perdidas reportadas en Encontra Tu Mascota",
    mainEntity: {
      "@type": "ItemList",
      name: "Mascotas Buscadas",
    },
  };

  return (
    <>
      <Script
        id="buscadas-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
