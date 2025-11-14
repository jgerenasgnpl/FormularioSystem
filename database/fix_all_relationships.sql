-- =====================================================
-- SCRIPT DE CORRECCIÓN COMPLETA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Verificar foreign keys actuales
SELECT
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name LIKE '%system%' OR tc.table_name = 'formularios' OR tc.table_name = 'modulos')
ORDER BY tc.table_name, kcu.column_name;

-- 2. Eliminar constraint incorrecta de formulariossystem.created_by
ALTER TABLE public.formulariossystem 
DROP CONSTRAINT IF EXISTS formulariossystem_created_by_fkey;

-- 3. Crear la constraint correcta apuntando a usuariossystem
ALTER TABLE public.formulariossystem 
ADD CONSTRAINT formulariossystem_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.usuariossystem(id) 
ON DELETE SET NULL;

-- 4. Verificar/Crear foreign key de modulossystem.formulario_id
ALTER TABLE public.modulossystem 
DROP CONSTRAINT IF EXISTS modulossystem_formulario_id_fkey;

ALTER TABLE public.modulossystem 
ADD CONSTRAINT modulossystem_formulario_id_fkey 
FOREIGN KEY (formulario_id) 
REFERENCES public.formulariossystem(id) 
ON DELETE CASCADE;

-- 5. Verificar/Crear foreign key de preguntassystem.modulo_id
ALTER TABLE public.preguntassystem 
DROP CONSTRAINT IF EXISTS preguntassystem_modulo_id_fkey;

ALTER TABLE public.preguntassystem 
ADD CONSTRAINT preguntassystem_modulo_id_fkey 
FOREIGN KEY (modulo_id) 
REFERENCES public.modulossystem(id) 
ON DELETE CASCADE;

-- 6. Verificar/Crear foreign keys de submissionssystem
ALTER TABLE public.submissionssystem 
DROP CONSTRAINT IF EXISTS submissionssystem_formulario_id_fkey;

ALTER TABLE public.submissionssystem 
ADD CONSTRAINT submissionssystem_formulario_id_fkey 
FOREIGN KEY (formulario_id) 
REFERENCES public.formulariossystem(id) 
ON DELETE CASCADE;

ALTER TABLE public.submissionssystem 
DROP CONSTRAINT IF EXISTS submissionssystem_usuario_id_fkey;

ALTER TABLE public.submissionssystem 
ADD CONSTRAINT submissionssystem_usuario_id_fkey 
FOREIGN KEY (usuario_id) 
REFERENCES public.usuariossystem(id) 
ON DELETE SET NULL;

-- 7. Refrescar el schema cache de Supabase (IMPORTANTE)
NOTIFY pgrst, 'reload schema';

-- 8. Verificación final - todas las foreign keys deben apuntar a tablas *system
SELECT
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name LIKE '%system%'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Todas las foreign keys deben apuntar a tablas con sufijo "system":
-- - formulariossystem.created_by → usuariossystem.id
-- - modulossystem.formulario_id → formulariossystem.id
-- - preguntassystem.modulo_id → modulossystem.id
-- - submissionssystem.formulario_id → formulariossystem.id
-- - submissionssystem.usuario_id → usuariossystem.id
-- =====================================================
