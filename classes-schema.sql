-- ============================================
-- Sistema de Clases tipo Google Classroom
-- ============================================

-- 1. Tabla de clases
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver las clases
CREATE POLICY "Authenticated users can view classes"
  ON public.classes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Solo admins pueden crear/editar/eliminar
CREATE POLICY "Admins can insert classes"
  ON public.classes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update classes"
  ON public.classes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete classes"
  ON public.classes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Tabla de materiales de clase
CREATE TABLE IF NOT EXISTS public.class_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  file_url text,
  link_url text,
  file_name text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.class_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view materials"
  ON public.class_materials FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert materials"
  ON public.class_materials FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update materials"
  ON public.class_materials FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete materials"
  ON public.class_materials FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
