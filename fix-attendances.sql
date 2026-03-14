-- ============================================
-- Fix attendance grid: ensure table exists + add missing DELETE policy
-- ============================================

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.attendances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text CHECK (status IN ('present', 'absent')) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (student_id, date)
);

-- 2. Enable RLS
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any) to avoid conflicts, then recreate all
DROP POLICY IF EXISTS "Admins can view all attendances" ON public.attendances;
DROP POLICY IF EXISTS "Admins can insert attendances" ON public.attendances;
DROP POLICY IF EXISTS "Admins can update attendances" ON public.attendances;
DROP POLICY IF EXISTS "Admins can delete attendances" ON public.attendances;
DROP POLICY IF EXISTS "Students can view their own attendances" ON public.attendances;

-- 4. Recreate all policies including DELETE
CREATE POLICY "Admins can view all attendances"
  ON public.attendances FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can insert attendances"
  ON public.attendances FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update attendances"
  ON public.attendances FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete attendances"
  ON public.attendances FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Students can view their own attendances"
  ON public.attendances FOR SELECT
  USING (auth.uid() = student_id);
