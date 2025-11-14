@echo off
REM Script completo con Docker para Windows

echo.
echo ========================================
echo   FormularioSystem - Docker Setup
echo ========================================
echo.

REM Verificar Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker no esta instalado
    echo.
    echo Descargalo de: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar .env
if not exist backend\.env (
    echo [AVISO] Configurando variables de entorno...
    copy backend\.env.example backend\.env
    echo.
    echo ========================================
    echo   IMPORTANTE: Configura tus credenciales
    echo ========================================
    echo.
    echo Edita: backend\.env
    echo.
    echo Antes de continuar, configura:
    echo   - SUPABASE_URL
    echo   - SUPABASE_SERVICE_KEY
    echo.
    pause
)

REM Construir e iniciar contenedores
echo.
echo [INFO] Construyendo e iniciando contenedores...
echo.
docker-compose up -d --build

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ========================================
    echo   Aplicacion iniciada correctamente!
    echo ========================================
    echo.
    echo   Frontend: http://localhost
    echo   Backend:  http://localhost:3000
    echo.
    echo   Login inicial:
    echo     Email:    admin@example.com
    echo     Password: admin123
    echo.
    echo Para detener:
    echo   docker-compose down
    echo.
) else (
    echo.
    echo [ERROR] Hubo un problema al iniciar los contenedores
    echo.
    echo Verifica:
    echo   1. Docker esta corriendo
    echo   2. backend\.env esta configurado
    echo   3. Puertos 80 y 3000 estan libres
    echo.
)

pause
