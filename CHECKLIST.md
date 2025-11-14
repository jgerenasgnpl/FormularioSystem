# ✅ Checklist de Verificación - FormularioSystem

## 1️⃣ Verificar Configuración de Supabase

### Tablas Requeridas
Ve a Supabase → **Table Editor** y verifica que existen:

- ✅ `usuariossystem` (con columnas: id, email, password, rol)
- ✅ `formulariossystem` (con columnas: id, name, is_public, created_by)
- ✅ `modulossystem` (con columnas: id, name, position, formulario_id)
- ✅ `preguntassystem` (con columnas: id, text, type, rules, position, modulo_id)
- ✅ `submissionssystem` (con columnas: id, formulario_id, usuario_id, respuestas)

**Nota:** La tabla `geografia_colombia` es opcional y puede estar compartida.

### Usuarios por Defecto
Ejecuta en SQL Editor:
```sql
SELECT id, email, rol FROM public.usuariossystem;
```

Deberías ver al menos:
- `admin@example.com` con rol `admin`
- `usuario@example.com` con rol `usuario`

---

## 2️⃣ Verificar Variables de Entorno

### Archivo backend/.env
```powershell
cat backend\.env
```

Debe contener:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

**NO debe tener valores como:**
- `your-supabase-url-here`
- `your-supabase-service-key-here`

---

## 3️⃣ Verificar Docker

### Estado de Contenedores
```powershell
docker ps
```

Ambos contenedores deben estar "Up":
- ✅ `formulariosystem-backend` → Puerto 3000
- ✅ `formulariosystem-frontend` → Puerto 80

### Logs del Backend
```powershell
docker logs formulariosystem-backend --tail 20
```

Debe mostrar:
```
Cliente de Supabase inicializado para FormularioSystem.
Servidor FormularioSystem escuchando en el puerto 3000
```

**NO debe mostrar:**
- ❌ "Error: Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar definidas"
- ❌ "Could not find the table..."

---

## 4️⃣ Verificar Frontend

### Imagen de Fondo
```powershell
Test-Path frontend\system2.PNG
```

Debe retornar: `True`

### CSS
```powershell
Select-String -Path frontend\style.css -Pattern "system2.PNG"
```

Debe mostrar la línea con: `background-image: url('system2.PNG');`

---

## 5️⃣ Probar la Aplicación

### 1. Acceder al Frontend
http://localhost

### 2. Iniciar Sesión
- **Email:** admin@example.com
- **Password:** admin123

### 3. Crear un Formulario
1. Ir a "Configuración"
2. Click en "Agregar Formulario"
3. Ingresar nombre (ej: "Test")
4. El formulario debe crearse sin errores

### 4. Agregar Módulo
1. Seleccionar el formulario creado
2. Click en "Agregar Módulo"
3. Ingresar nombre (ej: "Datos Básicos")

### 5. Agregar Pregunta
1. Seleccionar el módulo creado
2. Click en "Agregar Pregunta"
3. Configurar la pregunta y guardar

---

## 🔧 Si Algo Falla

### Backend en estado "Restarting"
```powershell
docker logs formulariosystem-backend --tail 50
docker-compose down
docker-compose up -d
```

### Error al crear formulario
1. Verifica que las tablas existan en Supabase
2. Verifica que iniciaste sesión correctamente
3. Abre la consola del navegador (F12) y busca errores

### Imagen de fondo no se muestra
```powershell
docker-compose up -d --build frontend
```

---

## 📊 Estado Actual del Sistema

✅ **Imagen de fondo:** Configurada (`system2.PNG`)
✅ **Backend:** Acepta `created_by` NULL si usuario no existe
✅ **Validación:** Mejorada para evitar errores de foreign key
✅ **Docker:** Contenedores corriendo
✅ **Supabase:** Tablas creadas con relaciones correctas

---

## 🎯 Próximos Pasos Recomendados

1. **Cambiar contraseñas por defecto** en producción
2. **Actualizar a Node.js 20** en el Dockerfile
3. **Configurar HTTPS** para producción
4. **Agregar datos a `geografia_colombia`** si usarás selección dependiente
