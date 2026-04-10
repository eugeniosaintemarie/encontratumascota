"use client";

import { Header } from "@/components/header";
import { PublicacionCard } from "@/components/publicacion-card";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import type { Publicacion } from "@/lib/types";

interface PublicacionDetailProps {
  publicacion: Publicacion;
}

export function PublicacionDetail({ publicacion }: PublicacionDetailProps) {
  const { isAuthenticated, requireAuth } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-lg px-4 pt-8 pb-8">
        <PublicacionCard
          publicacion={publicacion}
          isAuthenticated={isAuthenticated}
          onRequireAuth={requireAuth}
        />
      </main>
      <Footer />
    </div>
  );
}
