"use client";

import { ListadoPublicaciones } from "@/components/listado-publicaciones";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import type { Publicacion } from "@/lib/types";

interface RefugioContentProps {
  publicaciones: Publicacion[];
  nombreRefugio: string;
  usuarioId: string;
}

export function RefugioContent({
  publicaciones,
  nombreRefugio,
}: RefugioContentProps) {
  if (publicaciones.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Refugio no encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            No hay publicaciones para este refugio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-7xl px-4 pt-6">
        <div className="rounded-2xl border bg-gradient-to-br from-[#FF8A65]/20 via-background to-background p-6 sm:p-8">
          <Link
            href="/refugios"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#d66528] hover:opacity-80"
          >
            <HeartHandshake className="h-4 w-4" />
            Red de refugios
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {nombreRefugio}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {publicaciones.length} mascota
            {publicaciones.length !== 1 ? "s" : ""} en adopción
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6">
        <ListadoPublicaciones
          isAuthenticated={true}
          publicacionesBase={publicaciones}
          fixedTipoPublicacion="adopcion"
          hideTipoSelector={true}
          emptyTitle="Este refugio no tiene mascotas en adopción"
          emptyDescription="Todavía no hay publicaciones activas para este perfil"
        />
      </div>
    </main>
  );
}
