-- Crear usuarios de prueba en Supabase usando el método correcto
-- Estos comandos deben ejecutarse desde el dashboard de Supabase SQL Editor

-- Primero, eliminar usuarios existentes si los hay
DELETE FROM auth.users WHERE email IN ('test@example.com', 'admin@example.com', 'user@example.com');
DELETE FROM public.profiles WHERE email IN ('test@example.com', 'admin@example.com', 'user@example.com');

-- Insertar usuarios en auth.users (Supabase maneja el hash automáticamente)
-- Para hacer esto correctamente, necesitamos usar la API de Supabase

-- Función para crear usuarios con Supabase Auth API
-- Este script debe ejecutarse desde el dashboard de Supabase

-- Usuario de prueba básico
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  '',
  '',
  '',
  ''
);

-- Obtener el ID del usuario recién creado para crear el perfil
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Obtener el ID del usuario recién creado
    SELECT id INTO user_id FROM auth.users WHERE email = 'test@example.com';
    
    -- Crear el perfil correspondiente
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'test@example.com',
        'Test User',
        'student',
        NOW(),
        NOW()
    );
END $$;
