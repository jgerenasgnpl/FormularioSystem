-- =====================================================
-- SCRIPT SQL PARA CREAR TABLAS DEL FORMULARIO SYSTEM
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Proyecto: FormularioSystem
-- Fecha: 2025-11-14
-- =====================================================

-- 1. Tabla de Usuarios del Sistema
CREATE TABLE IF NOT EXISTS public.usuariossystem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario' NOT NULL CHECK (rol IN ('admin', 'usuario'))
);

COMMENT ON TABLE public.usuariossystem IS 'Usuarios del sistema de formularios. Roles: admin, usuario';
COMMENT ON COLUMN public.usuariossystem.rol IS 'Rol del usuario: admin (administrador) o usuario (normal)';

-- 2. Tabla de Formularios
CREATE TABLE IF NOT EXISTS public.formulariossystem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_by UUID REFERENCES public.usuariossystem(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.formulariossystem IS 'Almacena la definición de cada formulario maestro.';
COMMENT ON COLUMN public.formulariossystem.is_public IS 'Indica si el formulario es accesible públicamente sin autenticación';
COMMENT ON COLUMN public.formulariossystem.created_by IS 'ID del usuario que creó el formulario';

-- 3. Tabla de Módulos
CREATE TABLE IF NOT EXISTS public.modulossystem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 1 NOT NULL,
  formulario_id UUID REFERENCES public.formulariossystem(id) ON DELETE CASCADE NOT NULL
);

COMMENT ON TABLE public.modulossystem IS 'Módulos o secciones que componen un formulario.';
COMMENT ON COLUMN public.modulossystem.position IS 'Orden de visualización del módulo dentro del formulario';

-- 4. Tabla de Preguntas
CREATE TABLE IF NOT EXISTS public.preguntassystem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('texto', 'numero', 'fecha', 'booleano', 'seleccion_unica', 'seleccion_multiple', 'seleccion_dependiente', 'repartidor', 'listado_definido', 'terminos')),
  rules JSONB,
  position INTEGER DEFAULT 1 NOT NULL,
  modulo_id UUID REFERENCES public.modulossystem(id) ON DELETE CASCADE NOT NULL
);

COMMENT ON TABLE public.preguntassystem IS 'Preguntas individuales dentro de cada módulo.';
COMMENT ON COLUMN public.preguntassystem.type IS 'Tipo de pregunta: texto, numero, fecha, booleano, seleccion_unica, seleccion_multiple, seleccion_dependiente, repartidor, listado_definido, terminos';
COMMENT ON COLUMN public.preguntassystem.rules IS 'Reglas de validación y opciones en formato JSON';
COMMENT ON COLUMN public.preguntassystem.position IS 'Orden de visualización de la pregunta dentro del módulo';

-- 5. Tabla de Envíos (Submissions)
CREATE TABLE IF NOT EXISTS public.submissionssystem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  formulario_id UUID REFERENCES public.formulariossystem(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.usuariossystem(id) ON DELETE SET NULL,
  respuestas JSONB NOT NULL
);

COMMENT ON TABLE public.submissionssystem IS 'Almacena los envíos completos de formularios con todas las respuestas en formato JSON.';
COMMENT ON COLUMN public.submissionssystem.usuario_id IS 'ID del usuario que envió el formulario. NULL para envíos públicos anónimos';
COMMENT ON COLUMN public.submissionssystem.respuestas IS 'Objeto JSON con todas las respuestas del formulario. Clave: texto de la pregunta, Valor: respuesta';

-- 6. Tabla de Geografía de Colombia (para selección dependiente)
CREATE TABLE IF NOT EXISTS public.geografia_colombia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL
);

COMMENT ON TABLE public.geografia_colombia IS 'Datos geográficos de Colombia para preguntas de selección dependiente (Departamento/Municipio)';

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índice para formularios públicos
CREATE INDEX IF NOT EXISTS idx_formulariossystem_public 
ON public.formulariossystem(is_public) 
WHERE is_public = TRUE;

-- Índice para búsqueda de módulos por formulario
CREATE INDEX IF NOT EXISTS idx_modulossystem_formulario 
ON public.modulossystem(formulario_id, position);

-- Índice para búsqueda de preguntas por módulo
CREATE INDEX IF NOT EXISTS idx_preguntassystem_modulo 
ON public.preguntassystem(modulo_id, position);

-- Índice para búsqueda de envíos por formulario
CREATE INDEX IF NOT EXISTS idx_submissionssystem_formulario 
ON public.submissionssystem(formulario_id, created_at DESC);

-- Índice para búsqueda de envíos por usuario
CREATE INDEX IF NOT EXISTS idx_submissionssystem_usuario 
ON public.submissionssystem(usuario_id, created_at DESC);

-- Índice para geografía
CREATE INDEX IF NOT EXISTS idx_geografia_departamento 
ON public.geografia_colombia(departamento);

CREATE INDEX IF NOT EXISTS idx_geografia_municipio 
ON public.geografia_colombia(departamento, municipio);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Crear usuario administrador por defecto (Cambiar la contraseña en producción)
INSERT INTO public.usuariossystem (email, password, rol) 
VALUES ('admin@example.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Crear usuario normal de ejemplo
INSERT INTO public.usuariossystem (email, password, rol) 
VALUES ('usuario@example.com', 'user123', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%system%'
ORDER BY table_name;

-- Verificar columnas de formulariossystem
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'formulariossystem'
ORDER BY ordinal_position;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Todas las tablas tienen sufijo "system" para diferenciarlas
-- 2. Las relaciones están correctamente configuradas con CASCADE/SET NULL
-- 3. La tabla submissions usa JSONB para almacenar respuestas flexibles
-- 4. Los envíos públicos tienen usuario_id = NULL
-- 5. El campo is_public permite formularios sin autenticación
-- =====================================================
