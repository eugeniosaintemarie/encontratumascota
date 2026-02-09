CREATE TABLE "publicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"especie" text NOT NULL,
	"raza" text NOT NULL,
	"sexo" text NOT NULL,
	"color" text NOT NULL,
	"descripcion" text NOT NULL,
	"imagen_url" text DEFAULT '',
	"ubicacion" text NOT NULL,
	"fecha_publicacion" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_encuentro" timestamp with time zone NOT NULL,
	"contacto_nombre" text NOT NULL,
	"contacto_telefono" text NOT NULL,
	"contacto_email" text NOT NULL,
	"usuario_id" text NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"en_transito" boolean DEFAULT false NOT NULL,
	"transito_urgente" boolean DEFAULT false NOT NULL,
	"motivo_cierre" text,
	"transito_contacto_nombre" text,
	"transito_contacto_telefono" text,
	"transito_contacto_email" text
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre_usuario" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"fecha_registro" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
