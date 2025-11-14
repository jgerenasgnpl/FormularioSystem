#!/bin/bash

# Script de inicio rápido para FormularioSystem
# Ejecutar desde la raíz del proyecto

echo "🚀 FormularioSystem - Inicio Rápido"
echo "===================================="

# 1. Verificar dependencias
echo ""
echo "📦 Paso 1: Instalando dependencias del backend..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# 2. Verificar .env
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Copiando .env.example a .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita backend/.env con tus credenciales de Supabase"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo ""
    read -p "Presiona ENTER cuando hayas configurado .env..."
fi

# 3. Iniciar backend
echo ""
echo "🚀 Paso 2: Iniciando servidor backend..."
echo "   URL: http://localhost:3000"
echo ""

npm start
