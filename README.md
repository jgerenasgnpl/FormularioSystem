# 📋 FormularioSystem

Sistema completo de gestión de formularios dinámicos con **autenticación**, **formularios públicos** y **base de datos Supabase**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## 🌟 Características

- ✅ **Autenticación de Usuarios** (Admin y Usuario)
- ✅ **Formularios Dinámicos** completamente configurables
- ✅ **Módulos y Preguntas** organizados jerárquicamente
- ✅ **10+ Tipos de Preguntas** (texto, número, fecha, selección, etc.)
- ✅ **Formularios Públicos** sin necesidad de login
- ✅ **Preguntas Condicionales** (mostrar según respuestas previas)
- ✅ **Reordenamiento** de módulos y preguntas (drag & drop logic)
- ✅ **Exportación a CSV** de resultados
- ✅ **Tema Azul Profesional** con logo personalizado
- ✅ **Responsive Design** con Poppins font
- ✅ **Docker Ready** para despliegue rápido

## 📦 Estructura del Proyecto

```
FormularioSystem/
├── backend/                 # Servidor Express.js
│   ├── server.js           # Aplicación principal
│   ├── package.json        # Dependencias de Node
│   ├── Dockerfile          # Contenedor del backend
│   └── .env.example        # Variables de entorno de ejemplo
├── frontend/               # Interfaz web
│   ├── index.html          # Página principal (admin)
│   ├── public-form.html    # Página de formularios públicos
│   ├── script.js           # Lógica principal
│   ├── public-form.js      # Lógica de formularios públicos
│   ├── style.css           # Estilos azules profesionales
│   ├── system2.PNG         # Logo de la aplicación
│   └── Dockerfile          # Contenedor del frontend
├── database/               # Scripts SQL
│   └── create_tables_system.sql  # Creación de tablas
├── docker-compose.yml      # Orquestación de contenedores
├── .gitignore             # Archivos ignorados por Git
└── README.md              # Esta documentación
```

## 🗄️ Base de Datos (Supabase)

### Tablas Utilizadas

Este proyecto usa tablas con sufijo `system` para diferenciarlas:

| Tabla | Descripción |
|-------|-------------|
| `usuariossystem` | Usuarios del sistema (admin/usuario) |
| `formulariossystem` | Definición de formularios maestros |
| `modulossystem` | Módulos/secciones de cada formulario |
| `preguntassystem` | Preguntas individuales |
| `submissionssystem` | Envíos de formularios completados |
| `geografia_colombia` | Datos para selección dependiente |

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js >= 18.0.0
- Cuenta en [Supabase](https://supabase.com)
- Docker (opcional, pero recomendado)

### 1️⃣ Configurar Supabase

**IMPORTANTE: Este paso es OBLIGATORIO antes de ejecutar la aplicación**

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al **SQL Editor** en el menú lateral
3. Click en **"New query"**
4. Copia y pega **TODO** el contenido del archivo `database/create_tables_system.sql`
5. Click en **"RUN"** o presiona `Ctrl+Enter` para ejecutar el script
6. Verifica que se crearon las tablas:
   - `usuariossystem`
   - `formulariossystem` (con columna `is_public`)
   - `modulossystem`
   - `preguntassystem`
   - `submissionssystem`
   - `geografia_colombia`
7. Obtén tus credenciales en **Project Settings > API**:
   - `SUPABASE_URL`: Project URL (ejemplo: https://xxxxx.supabase.co)
   - `SUPABASE_SERVICE_KEY`: service_role key (NO usar la anon key)

### 2️⃣ Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
```

### 3️⃣ Configurar Frontend

Edita `frontend/script.js` y `frontend/public-form.js`:

```javascript
// Cambiar esta línea en ambos archivos:
const API_BASE_URL = 'http://localhost:3000'; // Para desarrollo local

// O para producción:
const API_BASE_URL = 'https://tu-backend-url.com';
```

### 4️⃣ Ejecutar con Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Accede a:
- Frontend: http://localhost
- Backend API: http://localhost:3000

### 4️⃣ O Ejecutar Manualmente

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
# Abrir con un servidor web (ej: Live Server en VS Code)
# O usar Python: python -m http.server 8080
```

## 👤 Usuarios por Defecto

Después de ejecutar el script SQL, tendrás:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@example.com | admin123 | admin |
| usuario@example.com | user123 | usuario |

**⚠️ IMPORTANTE:** Cambia estas contraseñas en producción.

## 📖 Guía de Uso

### Para Administradores

1. **Iniciar Sesión** con credenciales de admin
2. **Ir a Configuración** para crear formularios
3. **Crear Formulario** → Agregar Módulos → Agregar Preguntas
4. **Marcar como Público** si quieres que sea accesible sin login
5. **Copiar enlace público** (icono 🔗) para compartir
6. **Ver Resultados** para analizar envíos
7. **Exportar a CSV** para análisis en Excel

### Tipos de Preguntas Disponibles

1. **Texto** - Con validación por patrón regex
2. **Número** - Input numérico
3. **Fecha** - Selector de fecha
4. **Booleano** - Checkbox Sí/No
5. **Selección Única** - Dropdown o radio buttons (con cantidad opcional)
6. **Selección Múltiple** - Checkboxes (con cantidad opcional)
7. **Selección Dependiente** - Departamento/Municipio (cascada)
8. **Repartidor** - Listas dinámicas con sub-preguntas
9. **Listado Definido** - Lista de items con cantidades
10. **Términos** - Checkbox de aceptación

### Formularios Públicos

1. Admin marca formulario como "Público"
2. Se genera URL: `https://tu-dominio.com/public-form.html?id=FORMULARIO_ID`
3. Usuarios anónimos pueden completarlo
4. Envíos se guardan con `usuario_id = NULL`

## 🎨 Personalización

### Cambiar Colores

Edita `frontend/style.css`:

```css
:root {
    --color-primary: #1e5a9e;        /* Azul principal */
    --color-primary-darker: #14417a; /* Azul oscuro */
    --color-primary-light: #2b6cb8;  /* Azul claro */
    --color-accent: #4a90d9;         /* Azul acento */
}
```

### Cambiar Logo

Reemplaza `frontend/system2.PNG` con tu logo.

## 🌐 Despliegue a Producción

### Opción 1: Render.com

**Backend:**
1. Conecta tu repo de GitHub
2. Crea un nuevo **Web Service**
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && node server.js`
5. Agrega variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)

**Frontend:**
1. Crea un **Static Site**
2. Build Command: vacío
3. Publish Directory: `frontend`
4. Actualiza `API_BASE_URL` en JS con la URL del backend

### Opción 2: Vercel (Frontend) + Render (Backend)

Similar al anterior, pero usa Vercel para el frontend.

### Opción 3: VPS con Docker

```bash
# En tu servidor
git clone https://github.com/jgerenasgnpl/FormularioSystem
cd FormularioSystem
cp backend/.env.example backend/.env
nano backend/.env  # Editar credenciales
docker-compose up -d
```

## 🔒 Seguridad

- ✅ Contraseñas **NO** están hasheadas (agregar bcrypt en producción)
- ✅ Solo admins pueden crear/editar formularios
- ✅ Validación de datos en backend
- ✅ CORS configurado
- ✅ Service role key protegida en variables de entorno

**Recomendaciones:**
1. Implementar JWT para autenticación
2. Hashear contraseñas con bcrypt
3. Implementar rate limiting
4. Agregar HTTPS en producción

## 🛠️ Desarrollo

```bash
# Instalar dependencias
cd backend && npm install

# Modo desarrollo con auto-reload
npm run dev

# Ejecutar en modo producción
npm start
```

## 📊 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario (solo admin)

### Formularios
- `GET /formularios` - Listar todos (autenticado)
- `GET /formularios/public/:id` - Obtener formulario público
- `POST /formularios` - Crear formulario (admin)
- `PUT /formularios/:id/public` - Toggle público (admin)

### Módulos
- `POST /formularios/:id/modulos` - Crear módulo (admin)
- `PUT /modulos/:id` - Actualizar módulo (admin)
- `DELETE /modulos/:id` - Eliminar módulo (admin)

### Preguntas
- `POST /modulos/:id/preguntas` - Crear pregunta (admin)
- `PUT /preguntas/:id` - Actualizar pregunta (admin)
- `DELETE /preguntas/:id` - Eliminar pregunta (admin)

### Envíos
- `GET /submissions` - Listar envíos (admin)
- `POST /formularios/:id/envios` - Enviar con auth
- `POST /formularios/:id/envios/public` - Enviar público

### Utilidades
- `POST /reorder` - Reordenar items (admin)
- `GET /geodata/departamentos` - Listar departamentos
- `GET /geodata/municipios/:dept` - Listar municipios

## 🐛 Solución de Problemas

### Error: "SUPABASE_URL no definida"
- Verifica que existe `backend/.env` con las credenciales correctas

### Error: "Cannot find module '@supabase/supabase-js'"
- Ejecuta `cd backend && npm install`

### Frontend no se conecta al backend
- Verifica que `API_BASE_URL` en `script.js` apunte al backend correcto
- Verifica que CORS está habilitado en `server.js`

### No aparecen formularios públicos
- Verifica que ejecutaste `create_tables_system.sql` completo
- Verifica que la columna `is_public` existe en `formulariossystem`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Agregar nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📧 Contacto

- **Autor:** jgerenasgnpl
- **GitHub:** [https://github.com/jgerenasgnpl](https://github.com/jgerenasgnpl)
- **Repositorio:** [https://github.com/jgerenasgnpl/FormularioSystem](https://github.com/jgerenasgnpl/FormularioSystem)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Base de datos PostgreSQL
- [Express.js](https://expressjs.com) - Framework web
- [Poppins Font](https://fonts.google.com/specimen/Poppins) - Tipografía
- [Docker](https://docker.com) - Contenedorización

---

**⭐ Si te gustó este proyecto, dale una estrella en GitHub!**

