-- Script para crear usuario de prueba manualmente
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Crear usuario en auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Administrador Test"}',
  'authenticated',
  'authenticated'
) 
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- 2. Obtener el ID del usuario creado
DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@test.com';
    
    -- 3. Crear perfil correspondiente
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (user_id, 'admin@test.com', 'Administrador Test', 'coordinador', now(), now())
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = now();
      
    RAISE NOTICE 'Usuario creado con ID: %', user_id;
END $$;

-- 4. Crear usuario docente también
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'docente@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Docente Test"}',
  'authenticated',
  'authenticated'
) 
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'docente@test.com';
    
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (user_id, 'docente@test.com', 'Docente Test', 'docente', now(), now())
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = now();
      
    RAISE NOTICE 'Usuario docente creado con ID: %', user_id;
END $$;
