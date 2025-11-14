@echo off
REM Script de inicio rápido para FormularioSystem en Windows
REM Ejecutar desde la raíz del proyecto

echo.
echo ========================================
echo    FormularioSystem - Inicio Rapido
echo ========================================
echo.

REM 1. Verificar dependencias
echo [Paso 1] Instalando dependencias del backend...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] No se pudieron instalar las dependencias
    pause
    exit /b 1
)

REM 2. Verificar .env
if not exist .env (
    echo.
    echo [AVISO] No se encontro archivo .env
    echo [INFO] Copiando .env.example a .env...
    copy .env.example .env
    echo.
    echo ========================================
    echo   IMPORTANTE: Configura tus credenciales
    echo ========================================
    echo.
    echo Edita: backend\.env
    echo.
    echo Necesitas:
    echo   - SUPABASE_URL
    echo   - SUPABASE_SERVICE_KEY
    echo.
    echo Obtenlos de: https://supabase.com
    echo   Project Settings ^> API
    echo.
    pause
)

REM 3. Iniciar backend
echo.
echo [Paso 2] Iniciando servidor backend...
echo.
echo   URL: http://localhost:3000
echo.
echo   Para detener: Ctrl + C
echo.
echo ========================================

call npm start
