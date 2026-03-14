-- ============================================
-- Insertar 22 alumnos de Entrenarte 2026
-- Contraseña por defecto: Alumno2026!
-- ============================================

DO $$
DECLARE
  student_id uuid;
BEGIN

  -- 1. Addiechi, Genaro
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'genaro.addiechi@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Genaro', 'Addiechi', 'genaro.addiechi@entrenarte.edu', 'student');

  -- 2. Antonini Flores, Lucas
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'lucas.antoniniflores@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Lucas', 'Antonini Flores', 'lucas.antoniniflores@entrenarte.edu', 'student');

  -- 3. Astrada, Quidel
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'quidel.astrada@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Quidel', 'Astrada', 'quidel.astrada@entrenarte.edu', 'student');

  -- 4. Ciancio, Camila
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'camila.ciancio@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Camila', 'Ciancio', 'camila.ciancio@entrenarte.edu', 'student');

  -- 5. Dauma, Lucía
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'lucia.dauma@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Lucía', 'Dauma', 'lucia.dauma@entrenarte.edu', 'student');

  -- 6. Escudero, Simón
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'simon.escudero@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Simón', 'Escudero', 'simon.escudero@entrenarte.edu', 'student');

  -- 7. Fortunato, Guadalupe
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'guadalupe.fortunato@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Guadalupe', 'Fortunato', 'guadalupe.fortunato@entrenarte.edu', 'student');

  -- 8. Frene, Camila
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'camila.frene@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Camila', 'Frene', 'camila.frene@entrenarte.edu', 'student');

  -- 9. Goldstein, Ulises
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'ulises.goldstein@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Ulises', 'Goldstein', 'ulises.goldstein@entrenarte.edu', 'student');

  -- 10. Gomez Zelada, Yaco
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'yaco.gomezzelada@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Yaco', 'Gomez Zelada', 'yaco.gomezzelada@entrenarte.edu', 'student');

  -- 11. Jasa, Lucio Gael
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'luciogael.jasa@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Lucio Gael', 'Jasa', 'luciogael.jasa@entrenarte.edu', 'student');

  -- 12. Leon Vera, Antonella
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'antonella.leonvera@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Antonella', 'Leon Vera', 'antonella.leonvera@entrenarte.edu', 'student');

  -- 13. Martín, Mateo Rafael
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'mateorafael.martin@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Mateo Rafael', 'Martín', 'mateorafael.martin@entrenarte.edu', 'student');

  -- 14. Marty, Enzo
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'enzo.marty@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Enzo', 'Marty', 'enzo.marty@entrenarte.edu', 'student');

  -- 15. Medina, Santiago
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'santiago.medina@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Santiago', 'Medina', 'santiago.medina@entrenarte.edu', 'student');

  -- 16. Miguez, Tomás
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'tomas.miguez@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Tomás', 'Miguez', 'tomas.miguez@entrenarte.edu', 'student');

  -- 17. Perfumo, Lorenzo
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'lorenzo.perfumo@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Lorenzo', 'Perfumo', 'lorenzo.perfumo@entrenarte.edu', 'student');

  -- 18. Rodríguez Vivani, Bautista
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'bautista.rodriguezvivani@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Bautista', 'Rodríguez Vivani', 'bautista.rodriguezvivani@entrenarte.edu', 'student');

  -- 19. Rubín, Galo
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'galo.rubin@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Galo', 'Rubín', 'galo.rubin@entrenarte.edu', 'student');

  -- 20. Sanchez Ríos, Tomás
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'tomas.sanchezrios@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Tomás', 'Sanchez Ríos', 'tomas.sanchezrios@entrenarte.edu', 'student');

  -- 21. Travella, Emilia
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'emilia.travella@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Emilia', 'Travella', 'emilia.travella@entrenarte.edu', 'student');

  -- 22. Vicent, Ciro
  student_id := gen_random_uuid();
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated', 'ciro.vicent@entrenarte.edu', crypt('Alumno2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  INSERT INTO public.profiles (id, first_name, last_name, email, role) VALUES (student_id, 'Ciro', 'Vicent', 'ciro.vicent@entrenarte.edu', 'student');

  RAISE NOTICE '✅ 22 alumnos creados exitosamente';
END $$;
