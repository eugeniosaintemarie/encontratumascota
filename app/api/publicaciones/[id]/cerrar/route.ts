import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";
import {
  sanitizeText,
  sanitizePhone,
  sanitizeEmail,
} from "@/lib/sanitize-server";
import type { Publicacion } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };
type SessionUser = { id: string; isReadOnly?: boolean };
type Transferencia = NonNullable<Publicacion["historialTransferencias"]>[number];
type CerrarPayload = {
  motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro";
  transitoContacto?: { nombre: string; telefono: string; email: string };
  confirmarTransferenciaMultiple?: boolean;
};

// POST /api/publicaciones/[id]/cerrar (requiere ser el dueno)
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const session = await getServerSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const sessionUser = session.user as SessionUser;

    // Bloquear usuarios demo (modo solo lectura)
    if (sessionUser.isReadOnly) {
      return NextResponse.json(
        { error: "Modo demo solo permite visualización" },
        { status: 403 },
      );
    }

    const { getPublicacionById, cerrarPublicacionDB } =
      await import("@/lib/actions/publicaciones");
    const { isDemoRequest } = await import("@/lib/env");

    // Verificar que la publicacion pertenece al usuario
    const existing = await getPublicacionById(id, {
      forceDemo: isDemoRequest(request),
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Publicacion no encontrada" },
        { status: 404 },
      );
    }
    if (existing.usuarioId !== sessionUser.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { motivo, transitoContacto, confirmarTransferenciaMultiple } =
      (await request.json()) as CerrarPayload;

    // Sanitizar datos de contacto de transito si existen
    const transitoContactoSanitizado = transitoContacto
      ? {
          nombre: sanitizeText(transitoContacto.nombre),
          telefono: sanitizePhone(transitoContacto.telefono),
          email: sanitizeEmail(transitoContacto.email),
        }
      : undefined;

    // Si es tránsito, validar si ya tiene historial de transferencias
    let historialActualizado:
      | Array<{
          nombre: string;
          telefono: string;
          email: string;
          fecha: string;
        }>
      | undefined;

    if (motivo === "en_transito" && transitoContactoSanitizado) {
      const historialActual: Transferencia[] =
        existing.historialTransferencias != null
          ? [...existing.historialTransferencias]
          : [];

      // Si ya tiene una transferencia previa, mostrar advertencia
      if (historialActual.length > 0) {
        // Si no confirma, solo devolver la advertencia sin actualizar
        if (!confirmarTransferenciaMultiple) {
          return NextResponse.json(
            {
              error: "Esta mascota ya fue transitada previamente",
              advertenciaTransferenciaMultiple: true,
              contactoAnterior: historialActual[historialActual.length - 1],
            },
            { status: 400 },
          );
        }
      }

      // Si confirma (o es primera transferencia), agregar contacto actual al historial
      historialActual.push({
        nombre: existing.mascota.contactoNombre || existing.contactoNombre,
        telefono:
          existing.mascota.contactoTelefono || existing.contactoTelefono,
        email: existing.mascota.contactoEmail || existing.contactoEmail,
        fecha: new Date().toISOString(),
      });
      historialActualizado = historialActual;
    }

    const publicacion = await cerrarPublicacionDB(
      id,
      motivo,
      transitoContactoSanitizado,
      historialActualizado,
    );

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicacion no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      publicacion,
      advertenciaTransferenciaMultiple: false,
    });
  } catch (error) {
    console.error("Error cerrando publicacion:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
