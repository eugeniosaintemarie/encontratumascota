"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListadoPublicaciones } from "@/components/listado-publicaciones"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { isAuthenticated, requireAuth } = useAuth()

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <main id="main" className="mx-auto max-w-7xl px-4 pt-4 pb-8" tabIndex={-1}>
          <ListadoPublicaciones
            isAuthenticated={isAuthenticated}
            onRequireAuth={requireAuth}
          />
        </main>
        <Footer />
      </div>
    )
  }

