import { mockPublicaciones } from "@/lib/mock-data"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RefugioContent } from "@/components/refugio-content"
import { headers } from "next/headers"
import { isDemoHost } from "@/lib/env"
import { formatHeartEmojiSpacing } from "@/lib/utils"

export default async function RefugioPage({ params }: { params: Promise<{ usuarioId: string }> }) {
  const { usuarioId } = await params
  const host = (await headers()).get("host") ?? undefined
  const isDemo = isDemoHost(host)

  let publicacionesRefugio: typeof mockPublicaciones
  let nombreRefugio: string

  if (isDemo) {
    publicacionesRefugio = mockPublicaciones.filter(
      (pub) => pub.usuarioId === usuarioId && pub.esRefugio === true
    )
    nombreRefugio = formatHeartEmojiSpacing(publicacionesRefugio[0]?.contactoNombre || "Refugio")
  } else {
    const { getPublicaciones } = await import("@/lib/actions/publicaciones")
    const { getRefugioProfileByAuthUserId } = await import("@/lib/actions/refugios")

    const publicacionesProd = await getPublicaciones(
      {
        tipoPublicacion: "adopcion",
        usuarioId,
        soloRefugios: true,
        soloActivas: true,
      },
      { forceDemo: false }
    )

    const perfil = await getRefugioProfileByAuthUserId(usuarioId)
    publicacionesRefugio = publicacionesProd as any
    nombreRefugio = formatHeartEmojiSpacing(perfil?.nombreRefugio || publicacionesProd[0]?.contactoNombre || "Refugio")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <RefugioContent
        publicaciones={publicacionesRefugio}
        nombreRefugio={nombreRefugio}
        usuarioId={usuarioId}
      />
      <Footer />
    </div>
  )
}


