import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";
import { isDemoRequest } from "@/lib/env";
import {
  sanitizeObject,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
} from "@/lib/sanitize-server";
import { mockPublicaciones } from "@/lib/mock-data";
import { isMestizoRaza } from "@/lib/utils";
import type { Especie, Sexo, TipoPublicacion } from "@/lib/types";

const VALID_ESPECIES: Especie[] = ["perro", "gato", "otro"];
const VALID_SEXOS: Sexo[] = ["macho", "hembra", "desconocido"];
const VALID_TIPOS_PUBLICACION: TipoPublicacion[] = [
  "perdida",
  "adopcion",
  "buscada",
];

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  isReadOnly?: boolean;
};

type PublicacionBody = {
  tipoPublicacion: TipoPublicacion;
  especie: Especie;
  raza: string;
  padreRaza?: string;
  madreRaza?: string;
  sexo: Sexo;
  color: string;
  descripcion: string;
  fechaNacimiento?: string;
  imagenUrl?: string;
  ubicacion: string;
  fechaEncuentro?: string;
  transitoUrgente?: boolean;
};

// GET /api/publicaciones - Listar publicaciones (publico)
export async function GET(request: Request) {
  try {
    const { getPublicaciones } = await import("@/lib/actions/publicaciones");

    const { searchParams } = new URL(request.url);
    const especieParam = searchParams.get("especie");
    const sexoParam = searchParams.get("sexo");
    const especie =
      especieParam && VALID_ESPECIES.includes(especieParam as Especie)
        ? (especieParam as Especie)
        : undefined;
    const sexo =
      sexoParam && VALID_SEXOS.includes(sexoParam as Sexo)
        ? (sexoParam as Sexo)
        : undefined;
    const ubicacion = searchParams.get("ubicacion") || undefined;
    const transitoUrgente = searchParams.get("transitoUrgente") === "true";
    const soloEnTransito = searchParams.get("soloEnTransito") === "true";
    const soloActivasParam = searchParams.get("soloActivas");
    const soloActivas =
      soloActivasParam === null ? undefined : soloActivasParam === "true";

    const publicaciones = await getPublicaciones(
      {
        especie,
        sexo,
        ubicacion,
        transitoUrgente: transitoUrgente || undefined,
        soloEnTransito: soloEnTransito || undefined,
        soloActivas: soloActivas,
      },
      { forceDemo: isDemoRequest(request) },
    );

    return NextResponse.json({ publicaciones });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API /publicaciones GET] Error fetching publicaciones:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Si hay fallo de DB, solo usar mocks en entorno demo.
    if (
      errorMessage.includes("DATABASE_URL") ||
      errorMessage.includes("database")
    ) {
      if (isDemoRequest(request)) {
        console.warn(
          "[API /publicaciones GET] Using demo fallback due to database error",
        );
        return NextResponse.json({ publicaciones: mockPublicaciones });
      }

      return NextResponse.json(
        {
          error: "Base de datos temporalmente no disponible",
          publicaciones: [],
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Error interno", publicaciones: [] },
      { status: 500 },
    );
  }
}

// POST /api/publicaciones - Crear publicacion (requiere autenticacion)
export async function POST(request: Request) {
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

    const { crearPublicacion } = await import("@/lib/actions/publicaciones");
    const body = (await request.json()) as Partial<PublicacionBody>;

    const tipoPublicacion =
      body.tipoPublicacion &&
      VALID_TIPOS_PUBLICACION.includes(body.tipoPublicacion)
        ? body.tipoPublicacion
        : undefined;

    if (!tipoPublicacion) {
      return NextResponse.json(
        { error: "Tipo de publicación inválido" },
        { status: 400 },
      );
    }

    // Sanitizar inputs de texto para prevenir XSS
    const datosSanitizados = sanitizeObject({
      color: body.color,
      descripcion: body.descripcion,
      ubicacion: body.ubicacion,
      padreRaza: body.padreRaza,
      madreRaza: body.madreRaza,
    });
    const colorSanitizado =
      typeof datosSanitizados.color === "string" ? datosSanitizados.color : "";
    const descripcionSanitizada =
      typeof datosSanitizados.descripcion === "string"
        ? datosSanitizados.descripcion
        : "";

    // Validar campos obligatorios
    if (!body.especie) {
      return NextResponse.json(
        { error: "El tipo de mascota es obligatorio" },
        { status: 400 },
      );
    }

    if (!body.raza) {
      return NextResponse.json(
        { error: "La raza es obligatoria" },
        { status: 400 },
      );
    }

    const esRazaMestizo = isMestizoRaza(body.raza);
    if (
      esRazaMestizo &&
      (!datosSanitizados.padreRaza || !datosSanitizados.madreRaza)
    ) {
      return NextResponse.json(
        { error: "Madre y padre son obligatorios para mascotas mestizas" },
        { status: 400 },
      );
    }

    if (!body.sexo) {
      return NextResponse.json(
        { error: "El género es obligatorio" },
        { status: 400 },
      );
    }

    if (!datosSanitizados.ubicacion?.trim()) {
      return NextResponse.json(
        { error: "La ubicación es obligatoria" },
        { status: 400 },
      );
    }

    if (
      (tipoPublicacion === "perdida" || tipoPublicacion === "buscada") &&
      !body.fechaEncuentro
    ) {
      return NextResponse.json(
        { error: "La fecha es obligatoria" },
        { status: 400 },
      );
    }

    // Validar fecha de encuentro/perdida para publicaciones "perdida" y "buscada"
    if (
      (tipoPublicacion === "perdida" || tipoPublicacion === "buscada") &&
      body.fechaEncuentro
    ) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const fecha = new Date(body.fechaEncuentro);
      fecha.setHours(0, 0, 0, 0);

      if (fecha > today) {
        return NextResponse.json(
          { error: "La fecha no puede ser posterior a hoy" },
          { status: 400 },
        );
      }

      if (fecha < sevenDaysAgo) {
        return NextResponse.json(
          { error: "La fecha no puede ser anterior a hace 7 días" },
          { status: 400 },
        );
      }
    }

    const { getRefugioProfileByAuthUserId } =
      await import("@/lib/actions/refugios");
    const profile = await getRefugioProfileByAuthUserId(sessionUser.id);
    const contactoNombre = sanitizeText(
      profile?.contactoNombre ?? sessionUser.name ?? "",
    );
    const contactoTelefono = sanitizePhone(profile?.contactoTelefono ?? "");
    const contactoEmail = sanitizeEmail(
      profile?.contactoEmail ?? sessionUser.email ?? "",
    );
    const mostrarContactoPublico = profile?.mostrarContactoPublico ?? false;

    const publicacion = await crearPublicacion({
      tipoPublicacion,
      especie: body.especie,
      raza: body.raza,
      padreRaza: datosSanitizados.padreRaza,
      madreRaza: datosSanitizados.madreRaza,
      sexo: body.sexo,
      color: colorSanitizado,
      descripcion: descripcionSanitizada,
      fechaNacimiento: body.fechaNacimiento
        ? new Date(body.fechaNacimiento)
        : undefined,
      imagenUrl: body.imagenUrl || "",
      ubicacion: datosSanitizados.ubicacion,
      fechaEncuentro: body.fechaEncuentro
        ? new Date(body.fechaEncuentro)
        : undefined,
      contactoNombre,
      contactoTelefono,
      contactoEmail,
      mostrarContactoPublico,
      usuarioId: sessionUser.id,
      transitoUrgente: !!body.transitoUrgente,
    });

    return NextResponse.json({ publicacion }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API /publicaciones POST] Error creating publicacion:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Error al crear publicacion" },
      { status: 500 },
    );
  }
}
