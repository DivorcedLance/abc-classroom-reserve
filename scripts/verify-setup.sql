# Script para verificar configuración de base de datos
# Ejecutar estos comandos en el SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'classrooms', 'reservations');

-- 2. Verificar que la función trigger existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 3. Verificar que el trigger existe
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'classrooms', 'reservations');

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- 6. Crear usuario de prueba si no existe
DO $$
BEGIN
  -- Esto se debe ejecutar como service role o desde el dashboard de Supabase
  -- No desde la aplicación
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    confirmation_token,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Test User"}'::jsonb,
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;
END $$;
