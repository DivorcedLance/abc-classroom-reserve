-- Insert sample classrooms
INSERT INTO public.classrooms (name, capacity, location, equipment) VALUES
('Aula A-101', 30, 'Edificio A - Piso 1', ARRAY['Proyector', 'Pizarra', 'Audio']),
('Aula A-102', 25, 'Edificio A - Piso 1', ARRAY['Proyector', 'Pizarra']),
('Aula B-201', 40, 'Edificio B - Piso 2', ARRAY['Proyector', 'Pizarra', 'Audio', 'Computadoras']),
('Aula B-202', 35, 'Edificio B - Piso 2', ARRAY['Proyector', 'Pizarra', 'Audio']),
('Laboratorio C-301', 20, 'Edificio C - Piso 3', ARRAY['Computadoras', 'Proyector', 'Audio']),
('Auditorio Principal', 100, 'Edificio Principal', ARRAY['Proyector', 'Audio', 'Micrófonos', 'Iluminación']);

-- Note: Users will be created automatically when they sign up through Supabase Auth
-- You can manually update user roles in the profiles table after they sign up
