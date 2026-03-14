-- ============================================
-- Agregar sistema de aprobación de usuarios
-- Los usuarios nuevos quedan en pendiente (approved = false)
-- El admin aprueba o rechaza desde el panel
-- Los 22 alumnos existentes quedan aprobados automáticamente
-- ============================================

-- 1. Agregar columna approved (por defecto false para nuevos usuarios)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

-- 2. Aprobar todos los usuarios existentes (admin + 22 alumnos ya cargados)
UPDATE public.profiles SET approved = true;

-- 3. Permitir que el admin actualice el campo approved
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
