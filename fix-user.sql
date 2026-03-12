-- 1. Confirmar el email a la fuerza para poder loguearse
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'renngiann@gmail.com';

-- 2. Asegurarnos de que tengas tu perfil de administrador creado
INSERT INTO public.profiles (id, first_name, last_name, email, role, updated_at)
SELECT id, 'Renzo', 'Giannotta', email, 'admin', now()
FROM auth.users
WHERE email = 'renngiann@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';
