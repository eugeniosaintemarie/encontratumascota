import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Mascotas Reunidas | Encontra Tu Mascota",
  description:
    "Historias exitosas de mascotas reunidas con sus familias. Celebra los felices encuentros en nuestra comunidad colaborativa.",
  openGraph: {
    title: "Mascotas Reunidas - Encontra Tu Mascota",
    description:
      "Mascotas que fueron reunidas exitosamente con sus familias. ¡Historias felices!",
    type: "website",
    locale: "es_AR",
    siteName: "Encontra Tu Mascota",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mascotas Reunidas - Encontra Tu Mascota",
    description:
      "Mascotas que fueron reunidas exitosamente con sus familias. ¡Historias felices!",
  },
};

export default function ReunidasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Mascotas Reunidas",
    description: "Mascotas reunidas exitosamente con sus familias",
    mainEntity: {
      "@type": "ItemList",
      name: "Mascotas Reunidas",
    },
  };

  return (
    <>
      <Script
        id="reunidas-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
