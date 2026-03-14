-- ============================================
-- Mejorar sistema de entregas:
-- 1. Agregar columna link_url para compartir links
-- 2. Hacer file_url nullable (para cuando solo se comparte un link)
-- 3. Permitir que admins también suban entregas
-- ============================================

-- 1. Agregar columna link_url
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS link_url TEXT;

-- 2. Hacer file_url nullable
ALTER TABLE public.submissions ALTER COLUMN file_url DROP NOT NULL;

-- 3. Hacer file_type nullable
ALTER TABLE public.submissions ALTER COLUMN file_type DROP NOT NULL;

-- 4. Permitir que admins inserten submissions
CREATE POLICY "Admins can insert submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
