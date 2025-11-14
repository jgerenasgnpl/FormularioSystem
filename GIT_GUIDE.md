# 🚀 Guía de Git y GitHub - FormularioSystem

## 📦 Repositorio
**URL:** https://github.com/jgerenasgnpl/FormularioSystem

---

## 🔄 Comandos Git Básicos

### Ver estado del repositorio
```powershell
git status
```

### Ver cambios realizados
```powershell
git diff
```

### Ver historial de commits
```powershell
git log --oneline
```

---

## 📝 Guardar Cambios en GitHub

### 1. Ver qué archivos cambiaron
```powershell
git status
```

### 2. Agregar archivos modificados
```powershell
# Agregar todos los archivos
git add .

# O agregar archivos específicos
git add archivo1.js archivo2.css
```

### 3. Crear un commit con mensaje descriptivo
```powershell
git commit -m "Descripción clara de los cambios realizados"
```

**Ejemplos de mensajes:**
- `git commit -m "Fix: Corregir error de foreign key en formulariossystem"`
- `git commit -m "Feature: Agregar imagen de fondo system2.PNG"`
- `git commit -m "Update: Mejorar validación de usuarios en backend"`
- `git commit -m "Docs: Actualizar README con instrucciones de instalación"`

### 4. Subir cambios a GitHub
```powershell
git push
```

---

## 🔄 Flujo Completo (Rápido)

```powershell
# 1. Ver cambios
git status

# 2. Agregar todo
git add .

# 3. Commit con mensaje
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push
```

---

## 🌿 Trabajar con Ramas

### Crear una nueva rama
```powershell
git checkout -b nombre-de-la-rama
```

### Cambiar de rama
```powershell
git checkout main
git checkout otra-rama
```

### Subir una rama nueva a GitHub
```powershell
git push -u origin nombre-de-la-rama
```

### Fusionar una rama con main
```powershell
# Cambiarse a main
git checkout main

# Traer últimos cambios
git pull

# Fusionar la otra rama
git merge nombre-de-la-rama

# Subir a GitHub
git push
```

---

## 📥 Actualizar desde GitHub

### Traer últimos cambios
```powershell
git pull
```

---

## 🔙 Deshacer Cambios

### Deshacer cambios antes de commit
```powershell
# Deshacer cambios en un archivo específico
git checkout -- archivo.js

# Deshacer todos los cambios
git checkout -- .
```

### Deshacer último commit (mantener cambios)
```powershell
git reset --soft HEAD~1
```

### Deshacer último commit (eliminar cambios)
```powershell
git reset --hard HEAD~1
```

---

## 🚫 Archivos Ignorados

El archivo `.gitignore` contiene:
- `backend/.env` ← **Credenciales de Supabase** (NUNCA subir)
- `node_modules/` ← Dependencias de Node
- `.vscode/` ← Configuración de VS Code
- Otros archivos temporales

**IMPORTANTE:** NUNCA elimines `.env` del `.gitignore`

---

## 🔐 Seguridad

### ⚠️ Si accidentalmente subiste credenciales:

1. **Cambia inmediatamente** las credenciales en Supabase
2. **Elimina el archivo del historial:**
```powershell
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all
git push --force
```

---

## 📋 Ejemplos de Flujos Comunes

### Agregar una nueva característica
```powershell
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "Feature: Agregar nueva funcionalidad X"

# Subir rama
git push -u origin feature/nueva-funcionalidad

# Fusionar a main cuando esté listo
git checkout main
git merge feature/nueva-funcionalidad
git push
```

### Corregir un bug urgente
```powershell
# Asegurarse de estar en main actualizado
git checkout main
git pull

# Hacer cambios
git add .
git commit -m "Fix: Corregir bug crítico en login"
git push
```

### Actualizar documentación
```powershell
git add README.md TROUBLESHOOTING.md
git commit -m "Docs: Actualizar guía de instalación"
git push
```

---

## 🔗 Enlaces Útiles

- **Repositorio:** https://github.com/jgerenasgnpl/FormularioSystem
- **GitHub Desktop:** https://desktop.github.com/ (interfaz gráfica)
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

## 📞 Comandos de Ayuda

```powershell
# Ver ayuda de un comando
git help <comando>

# Ejemplos:
git help commit
git help push
git help branch
```

---

## ✅ Checklist Antes de Cada Push

- [ ] `git status` - Verificar qué cambios hay
- [ ] `git diff` - Revisar los cambios en detalle
- [ ] Verificar que `.env` NO esté en la lista de archivos
- [ ] `git add .` - Agregar cambios
- [ ] `git commit -m "mensaje claro"` - Crear commit
- [ ] `git push` - Subir a GitHub
- [ ] Verificar en GitHub que los cambios se subieron correctamente

---

## 🎯 Buenas Prácticas

1. **Commits frecuentes y pequeños** - Mejor varios commits pequeños que uno grande
2. **Mensajes descriptivos** - Explica QUÉ y POR QUÉ cambiaste algo
3. **Pull antes de Push** - Siempre trae los últimos cambios antes de subir
4. **Nunca subir credenciales** - Verifica `.gitignore`
5. **Revisar antes de commit** - Usa `git status` y `git diff`

---

## 🔄 Estado Actual del Proyecto

✅ Repositorio inicializado
✅ Primer commit realizado
✅ Conectado con GitHub
✅ Código subido exitosamente
✅ `.env` protegido en `.gitignore`
✅ README y documentación incluidos

**Próximos pasos sugeridos:**
1. Resolver el error de foreign keys en Supabase
2. Crear commit con las correcciones
3. Actualizar el README si es necesario
