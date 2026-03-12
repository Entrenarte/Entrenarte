-- Script para insertar a renngiann@gmail.com como administrador manualmente

-- 1. Insertamos un usuario en auth.users (el sistema base de Supabase)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'renngiann@gmail.com',
  crypt('Entrenarte2026!', gen_salt('bf')), -- La contraseña que creaste
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Renzo","last_name":"Giannotta"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) RETURNING id;
-- (Este script no requiere confirmación de email porque lo hacemos por detrás)
