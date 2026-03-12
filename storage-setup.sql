-- Script para crear el "Balde" (Bucket) donde se guardarán los PDFs, Videos, etc.

-- 1. Crear el bucket llamado 'trabajos'
insert into storage.buckets (id, name, public)
values ('trabajos', 'trabajos', true)
on conflict (id) do nothing;

-- 2. Políticas de Seguridad (Quién puede subir y ver)

-- Cualquier usuario logueado (alumno o admin) puede ver los archivos guardados
create policy "Cualquiera puede ver trabajos"
  on storage.objects for select
  using ( bucket_id = 'trabajos' and auth.role() = 'authenticated' );

-- Cualquier usuario logueado puede subir un archivo
create policy "Alumnos pueden subir trabajos"
  on storage.objects for insert
  with check ( bucket_id = 'trabajos' and auth.role() = 'authenticated' );

-- Opcional: Solo el dueño del archivo o el admin pueden borrarlo
create policy "Borrar trabajos"
  on storage.objects for delete
  using ( bucket_id = 'trabajos' and auth.role() = 'authenticated' );
