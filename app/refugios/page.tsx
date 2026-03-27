import Link from "next/link"
import { headers } from "next/headers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, HeartHandshake, MapPin, PawPrint } from "lucide-react"
import { mockPublicaciones } from "@/lib/mock-data"
import { isDemoHost } from "@/lib/env"

interface RefugioLandingItem {
  usuarioId: string
  nombre: string
  ubicacion: string
  publicacionesActivas: number
}

function getDemoRefugios(): RefugioLandingItem[] {
  const refugioPublicaciones = mockPublicaciones.filter(
    (pub) => pub.esRefugio === true && pub.tipoPublicacion === "adopcion"
  )

  const grouped = new Map<string, RefugioLandingItem>()

  for (const pub of refugioPublicaciones) {
    const existing = grouped.get(pub.usuarioId)
    if (!existing) {
      grouped.set(pub.usuarioId, {
        usuarioId: pub.usuarioId,
        nombre: pub.contactoNombre,
        ubicacion: pub.ubicacion,
        publicacionesActivas: pub.activa ? 1 : 0,
      })
      continue
    }

    existing.publicacionesActivas += pub.activa ? 1 : 0
  }

  return Array.from(grouped.values())
}

async function getProdRefugios(): Promise<RefugioLandingItem[]> {
  try {
    const { listRefugioProfiles } = await import("@/lib/actions/refugios")
    const { getPublicaciones } = await import("@/lib/actions/publicaciones")

    const [profiles, publicacionesRefugio] = await Promise.all([
      listRefugioProfiles(true),
      getPublicaciones(
        {
          tipoPublicacion: "adopcion",
          soloRefugios: true,
          soloActivas: true,
        },
        { forceDemo: false }
      ),
    ])

    const counts = new Map<string, number>()
    const ubicaciones = new Map<string, string>()

    for (const pub of publicacionesRefugio) {
      counts.set(pub.usuarioId, (counts.get(pub.usuarioId) || 0) + 1)
      if (!ubicaciones.has(pub.usuarioId)) {
        ubicaciones.set(pub.usuarioId, pub.ubicacion)
      }
    }

    return profiles.map((profile) => ({
      usuarioId: profile.authUserId,
      nombre: profile.nombreRefugio || "Refugio",
      ubicacion: ubicaciones.get(profile.authUserId) || "Argentina",
      publicacionesActivas: counts.get(profile.authUserId) || 0,
    }))
  } catch {
    return []
  }
}

export default async function RefugiosPage() {
  const host = (await headers()).get("host") ?? undefined
  const isDemo = isDemoHost(host)

  const refugios = isDemo ? getDemoRefugios() : await getProdRefugios()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-10">
        <section className="rounded-2xl border bg-gradient-to-br from-[#FF8A65]/20 via-background to-background p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#d66528]">
                <HeartHandshake className="h-4 w-4" />
                Red de refugios
              </p>
              <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Refugios</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Conocé los refugios que publican en la plataforma y explorá sus mascotas en adopción
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {refugios.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
              <PawPrint className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
              <h2 className="text-lg font-semibold text-foreground">
                {isDemo ? "Todavía no hay refugios publicados" : "No hay refugios para mostrar actualmente"}
              </h2>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {refugios.map((refugio) => (
                <Card key={refugio.usuarioId} className="border-border/80 gap-1">
                  <div className="px-6 pb-0">
                    <h2 className="text-lg font-semibold leading-tight text-foreground">
                      {refugio.nombre}
                    </h2>
                  </div>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {refugio.ubicacion}
                      </p>
                      <p>
                        {refugio.publicacionesActivas} mascota
                        {refugio.publicacionesActivas !== 1 ? "s" : ""} en adopción
                      </p>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/refugio/${refugio.usuarioId}`}>
                        Ver perfil
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
