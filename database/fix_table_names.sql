-- =====================================================
-- SCRIPT DE VERIFICACIÓN Y CORRECCIÓN
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Verificar las tablas actuales
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%system%' OR table_name = 'usuarios')
ORDER BY table_name;

-- 2. Si existe 'usuarios' en lugar de 'usuariossystem', renombrar
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuariossystem'
    ) THEN
        ALTER TABLE public.usuarios RENAME TO usuariossystem;
        RAISE NOTICE 'Tabla "usuarios" renombrada a "usuariossystem"';
    END IF;
END $$;

-- 3. Verificar que la relación existe
SELECT
    tc.table_name, 
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
  AND tc.table_name = 'formulariossystem'
  AND kcu.column_name = 'created_by';

-- 4. Si la foreign key apunta a 'usuarios' en lugar de 'usuariossystem', corregir
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar el nombre de la constraint existente
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'formulariossystem'
      AND kcu.column_name = 'created_by'
    LIMIT 1;

    -- Si existe una constraint antigua, eliminarla
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.formulariossystem DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Constraint antigua eliminada: %', constraint_name;
    END IF;

    -- Crear la nueva constraint apuntando a usuariossystem
    ALTER TABLE public.formulariossystem 
    ADD CONSTRAINT formulariossystem_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES public.usuariossystem(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Nueva foreign key creada: formulariossystem.created_by -> usuariossystem.id';
END $$;

-- 5. Verificación final
SELECT 
    'OK - Tabla usuariossystem existe' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'usuariossystem';

SELECT 
    'OK - Foreign key creada correctamente' as status
FROM information_schema.table_constraints AS tc 
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'formulariossystem'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name = 'formulariossystem_created_by_fkey';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Después de ejecutar este script:
-- 1. La tabla se llamará 'usuariossystem' (no 'usuarios')
-- 2. La foreign key estará correctamente configurada
-- 3. El backend podrá crear formularios sin problemas
-- =====================================================
