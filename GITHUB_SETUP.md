# 🚀 Guía Rápida: Subir FormularioSystem a GitHub

## Paso 1: Inicializar Git

```bash
cd C:\Users\j.gerena\FormularioSystem
git init
git add .
git commit -m "Initial commit: FormularioSystem con tablas system en Supabase"
```

## Paso 2: Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. **Repository name:** FormularioSystem
3. **Description:** Sistema de formularios dinámicos con Supabase (tablas system)
4. **Public** o **Private** según prefieras
5. **NO** marcar "Initialize with README" (ya lo tenemos)
6. Click en **Create repository**

## Paso 3: Conectar y Subir

```bash
git remote add origin https://github.com/jgerenasgnpl/FormularioSystem.git
git branch -M main
git push -u origin main
```

## Paso 4: Verificar

Visita: https://github.com/jgerenasgnpl/FormularioSystem

Deberías ver:
- ✅ README.md con documentación completa
- ✅ Carpetas backend/ y frontend/
- ✅ Carpeta database/ con SQL
- ✅ docker-compose.yml
- ✅ .gitignore

## Paso 5: Configurar en Supabase

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Copia y pega el contenido de `database/create_tables_system.sql`
4. Click en **Run**
5. Verifica que las tablas se crearon:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%system%'
ORDER BY table_name;
```

Deberías ver:
- ✅ formulariossystem
- ✅ modulossystem
- ✅ preguntassystem
- ✅ submissionssystem
- ✅ usuariossystem

## Paso 6: Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
PORT=3000
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Paso 7: Probar Localmente

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend (usar Live Server o similar)
cd frontend
# Abrir index.html con Live Server en VS Code
# O: python -m http.server 8080
```

Accede a: http://localhost:8080 (o el puerto de tu servidor)

Login inicial:
- **Email:** admin@example.com
- **Password:** admin123

## Paso 8: (Opcional) Desplegar

### Opción A: Render.com

**Backend:**
1. Ve a https://dashboard.render.com
2. New → Web Service
3. Conecta tu repo: jgerenasgnpl/FormularioSystem
4. Settings:
   - **Root Directory:** backend
   - **Build Command:** npm install
   - **Start Command:** node server.js
5. Environment Variables:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
6. Deploy

**Frontend:**
1. New → Static Site
2. Same repo
3. Settings:
   - **Root Directory:** frontend
   - **Build Command:** (vacío)
   - **Publish Directory:** .
4. Deploy

**Actualizar URLs:**
- Edita `frontend/script.js` y `frontend/public-form.js`
- Cambia `API_BASE_URL` a la URL del backend en Render

### Opción B: Docker Local/VPS

```bash
docker-compose up -d
```

## ✅ Checklist Final

- [ ] Código en GitHub
- [ ] Tablas creadas en Supabase
- [ ] Variables de entorno configuradas
- [ ] Backend funcionando (http://localhost:3000)
- [ ] Frontend funcionando
- [ ] Login exitoso
- [ ] Crear formulario de prueba
- [ ] Marcar formulario como público
- [ ] Probar formulario público

## 🎉 ¡Listo!

Tu proyecto **FormularioSystem** está:
- ✅ En GitHub: https://github.com/jgerenasgnpl/FormularioSystem
- ✅ Con base de datos Supabase configurada
- ✅ Listo para desarrollo o producción

## 📝 Notas Importantes

1. **NO** incluir `.env` en el repositorio (ya está en .gitignore)
2. **CAMBIAR** contraseñas por defecto en producción
3. **ACTUALIZAR** API_BASE_URL en frontend antes de desplegar
4. **REVISAR** el README.md para más detalles

## 🆘 Si algo sale mal...

1. Verifica que ejecutaste el SQL correctamente
2. Revisa que las variables de entorno están bien
3. Chequea los logs del backend: `npm start`
4. Revisa la consola del navegador (F12)

---

**Creado para:** FormularioSystem  
**Fecha:** 2025-11-14  
**Autor:** jgerenasgnpl
