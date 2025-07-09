-- Verificar usuarios en auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Verificar perfiles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- Verificar que los perfiles tienen IDs que coinciden con auth.users
SELECT 
  u.email as auth_email,
  p.email as profile_email,
  p.full_name,
  p.role,
  u.created_at as auth_created,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
