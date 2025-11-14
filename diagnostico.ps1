#!/usr/bin/env pwsh
# Script de diagnóstico para FormularioSystem
# Ejecutar: .\diagnostico.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTICO - FormularioSystem" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1. Estado de Docker Containers:" -ForegroundColor Yellow
docker ps -a --filter "name=formulariosystem"
Write-Host ""

# 2. Verificar archivo .env
Write-Host "2. Contenido de backend/.env:" -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env"
    foreach ($line in $envContent) {
        if ($line -match "SUPABASE_URL=(.+)") {
            $url = $matches[1]
            if ($url -like "*your-supabase*") {
                Write-Host "   ❌ SUPABASE_URL no configurada (valor de ejemplo)" -ForegroundColor Red
            } elseif ($url -like "https://*.supabase.co") {
                Write-Host "   ✅ SUPABASE_URL configurada correctamente" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  SUPABASE_URL: $url (verificar formato)" -ForegroundColor Yellow
            }
        }
        if ($line -match "SUPABASE_SERVICE_KEY=(.+)") {
            $key = $matches[1]
            if ($key -like "*your-supabase*") {
                Write-Host "   ❌ SUPABASE_SERVICE_KEY no configurada (valor de ejemplo)" -ForegroundColor Red
            } elseif ($key.Length -gt 50) {
                Write-Host "   ✅ SUPABASE_SERVICE_KEY configurada (longitud: $($key.Length) caracteres)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  SUPABASE_SERVICE_KEY parece corta (longitud: $($key.Length) caracteres)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "   ❌ Archivo backend\.env NO ENCONTRADO" -ForegroundColor Red
}
Write-Host ""

# 3. Logs del Backend
Write-Host "3. Últimos logs del Backend:" -ForegroundColor Yellow
docker logs formulariosystem-backend --tail 10 2>&1
Write-Host ""

# 4. Verificar imagen de fondo
Write-Host "4. Imagen de fondo en frontend:" -ForegroundColor Yellow
if (Test-Path "frontend\system2.PNG") {
    Write-Host "   ✅ system2.PNG encontrada" -ForegroundColor Green
} else {
    Write-Host "   ❌ system2.PNG NO ENCONTRADA" -ForegroundColor Red
}

if (Test-Path "frontend\style.css") {
    $cssContent = Get-Content "frontend\style.css" -Raw
    if ($cssContent -match "background-image:\s*url\('system2\.PNG'\)") {
        Write-Host "   ✅ style.css configurado para usar system2.PNG" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  style.css NO está usando system2.PNG" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ style.css NO ENCONTRADO" -ForegroundColor Red
}
Write-Host ""

# 5. Resumen
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   RESUMEN Y PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$backendRunning = docker ps --filter "name=formulariosystem-backend" --filter "status=running" --format "{{.Names}}"
$frontendRunning = docker ps --filter "name=formulariosystem-frontend" --filter "status=running" --format "{{.Names}}"

if ($backendRunning) {
    Write-Host "✅ Backend CORRIENDO" -ForegroundColor Green
    Write-Host "   Acceso: http://localhost:3000" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend NO está corriendo o está en estado Restarting" -ForegroundColor Red
    Write-Host "   Solución:" -ForegroundColor Yellow
    Write-Host "   1. Verifica backend\.env con credenciales reales de Supabase" -ForegroundColor Gray
    Write-Host "   2. Ejecuta: docker-compose down && docker-compose up -d" -ForegroundColor Gray
}
Write-Host ""

if ($frontendRunning) {
    Write-Host "✅ Frontend CORRIENDO" -ForegroundColor Green
    Write-Host "   Acceso: http://localhost" -ForegroundColor Gray
} else {
    Write-Host "❌ Frontend NO está corriendo" -ForegroundColor Red
    Write-Host "   Solución: docker-compose up -d frontend" -ForegroundColor Gray
}
Write-Host ""

Write-Host "📋 IMPORTANTE: ¿Creaste las tablas en Supabase?" -ForegroundColor Yellow
Write-Host "   Si no lo has hecho:" -ForegroundColor Gray
Write-Host "   1. Ve a Supabase → SQL Editor" -ForegroundColor Gray
Write-Host "   2. Ejecuta TODO el contenido de database\create_tables_system.sql" -ForegroundColor Gray
Write-Host "   3. Verifica que se crearon las 6 tablas con sufijo 'system'" -ForegroundColor Gray
Write-Host ""
Write-Host "Ver más ayuda: TROUBLESHOOTING.md" -ForegroundColor Cyan
