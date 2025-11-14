# 🔧 Solución de Problemas - FormularioSystem

## ❌ Error: "Could not find the 'is_public' column of 'formulariossystem'"

### Causa
Las tablas no fueron creadas correctamente en Supabase o falta la columna `is_public`.

### Solución
1. Ve a Supabase → **SQL Editor**
2. Ejecuta este comando para verificar las columnas:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'formulariossystem';
```
3. Si la columna `is_public` no existe, ejecuta:
```sql
ALTER TABLE public.formulariossystem 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE NOT NULL;
```
4. **RECOMENDADO**: Ejecuta el script completo `database/create_tables_system.sql` nuevamente

---

## ❌ Error: "Could not find a relationship between 'formulariossystem' and 'modulossystem'"

### Causa
Las tablas no existen en Supabase o no se crearon las relaciones (foreign keys).

### Solución
1. Ve a Supabase → **SQL Editor**
2. Ejecuta **TODO** el contenido del archivo `database/create_tables_system.sql`
3. Verifica que las tablas existen:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%system%'
ORDER BY table_name;
```
4. Deberías ver al menos:
   - `formulariossystem`
   - `modulossystem`
   - `preguntassystem`
   - `submissionssystem`
   - `usuariossystem`
   
**Nota:** La tabla `geografia_colombia` es opcional y puede estar compartida con otros proyectos.

---

## ❌ Error: "insert or update on table 'formulariossystem' violates foreign key constraint"

### Causa
El `created_by` (ID del usuario) que se está enviando no existe en la tabla `usuariossystem`, O la tabla de usuarios tiene un nombre incorrecto (ej: `usuarios` en lugar de `usuariossystem`).

### Solución Rápida
Si tienes una tabla llamada `usuarios` en lugar de `usuariossystem`, ejecuta en Supabase SQL Editor:
```sql
ALTER TABLE public.usuarios RENAME TO usuariossystem;
```

### Solución Completa
Ejecuta el script `database/fix_table_names.sql` en Supabase SQL Editor. Este script:
1. Verifica si existe `usuarios` y la renombra a `usuariossystem`
2. Corrige las foreign keys si es necesario
3. Verifica que todo esté correctamente configurado

### Alternativa Manual
Este error ya está parcialmente solucionado en la versión actual del backend. El sistema ahora:
- Verifica si el usuario existe antes de crear el formulario
- Si el usuario no existe, usa `NULL` en el campo `created_by`
- Permite crear formularios sin problemas

Si sigues viendo este error:
1. Reinicia el backend:
```powershell
docker-compose restart backend
```
2. Verifica que el usuario que estás usando para login exista en Supabase:
```sql
SELECT id, email, rol FROM public.usuariossystem;
```
3. Verifica el nombre de la tabla:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name = 'usuarios' OR table_name = 'usuariossystem');
```

---

## ❌ Error: "Failed to fetch"

### Causa
El backend no está corriendo o no puede conectarse a Supabase.

### Solución
1. Verifica que el backend esté corriendo:
```powershell
docker ps
```
Deberías ver `formulariosystem-backend` con status "Up"

2. Si está en "Restarting", verifica los logs:
```powershell
docker logs formulariosystem-backend
```

3. Si ves "Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar definidas":
   - Edita `backend/.env` con tus credenciales reales
   - Reinicia los servicios:
```powershell
docker-compose down
docker-compose up -d
```

---

## ❌ Error: Backend en estado "Restarting"

### Causa
Variables de entorno no configuradas o credenciales incorrectas.

### Solución
1. Verifica que `backend/.env` tenga valores reales:
```powershell
cat backend\.env
```

2. Debe contener algo como:
```env
SUPABASE_URL=https://pmvxhlhwhuomuukwdrxv.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

3. NO debe tener:
   - `your-supabase-url-here`
   - `your-supabase-service-key-here`

4. Reinicia los servicios:
```powershell
docker-compose down
docker-compose up -d
```

---

## 🔍 Comandos Útiles para Diagnóstico

### Ver estado de contenedores
```powershell
docker ps -a
```

### Ver logs del backend (últimas 50 líneas)
```powershell
docker logs formulariosystem-backend --tail 50
```

### Ver logs en tiempo real
```powershell
docker logs -f formulariosystem-backend
```

### Ver logs del frontend
```powershell
docker logs formulariosystem-frontend --tail 50
```

### Reiniciar servicios
```powershell
docker-compose restart
```

### Detener y limpiar todo
```powershell
docker-compose down
docker system prune -f
```

### Reconstruir desde cero
```powershell
docker-compose down
docker-compose up -d --build
```

---

## 🗄️ Verificar Configuración de Supabase

### Verificar que las tablas existen
1. Ve a Supabase → **Table Editor**
2. Deberías ver las tablas en el menú lateral
3. O ejecuta en SQL Editor:
```sql
\dt public.*system*
```

### Verificar estructura de formulariossystem
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'formulariossystem'
ORDER BY ordinal_position;
```

Debe incluir:
- `id` (uuid)
- `created_at` (timestamp with time zone)
- `name` (text)
- `is_public` (boolean)
- `created_by` (uuid)

### Verificar foreign keys
```sql
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
  AND tc.table_name LIKE '%system%';
```

---

## 🌐 Problemas con la Imagen de Fondo

### La imagen no se muestra
1. Verifica que `system2.PNG` esté en la carpeta `frontend/`
2. Verifica que `style.css` tenga:
```css
body {
    background-image: url('system2.PNG');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
```
3. Reconstruye el frontend:
```powershell
docker-compose up -d --build frontend
```

---

## 📞 Contacto

Si los problemas persisten:
1. Revisa los logs del backend: `docker logs formulariosystem-backend`
2. Verifica la consola del navegador (F12)
3. Asegúrate de haber ejecutado el script SQL completo en Supabase
