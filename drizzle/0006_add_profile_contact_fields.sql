ALTER TABLE usuarios_perfil
  ADD COLUMN IF NOT EXISTS contacto_nombre text,
  ADD COLUMN IF NOT EXISTS contacto_telefono text,
  ADD COLUMN IF NOT EXISTS contacto_email text,
  ADD COLUMN IF NOT EXISTS mostrar_contacto_publico boolean NOT NULL DEFAULT false;

-- Comentarios adicionales para documentar los nuevos campos
COMMENT ON COLUMN usuarios_perfil.contacto_nombre IS 'Nombre que se mostrará en las publicaciones';
COMMENT ON COLUMN usuarios_perfil.contacto_telefono IS 'Teléfono principal del usuario';
COMMENT ON COLUMN usuarios_perfil.contacto_email IS 'Email de contacto que aparece en las publicaciones';
COMMENT ON COLUMN usuarios_perfil.mostrar_contacto_publico IS 'Flag que controla si el email/teléfono se muestran públicamente';
