#!/bin/bash
# Script de Verificación - Encuentros Docker Environment

echo "🔍 VERIFICANDO ESTADO DE DOCKERIZACIÓN..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi
echo "✅ Docker instalado"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi
echo "✅ Docker Compose instalado"

echo ""
echo "📦 ESTADO DE CONTENEDORES:"
echo ""

# Verificar contenedores
docker-compose ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 VERIFICACIÓN DE SERVICIOS:"
echo ""

# Frontend
echo -n "Frontend (http://localhost/): "
if curl -s http://localhost/ > /dev/null 2>&1; then
    echo "✅ Respondiendo"
else
    echo "❌ No responde"
fi

# Backend
echo -n "Backend (http://localhost:3000): "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Respondiendo"
else
    echo "⏳ Inicializando... (normal si acaba de empezar)"
fi

# Database
echo -n "Database (localhost:1521): "
if nc -z localhost 1521 > /dev/null 2>&1; then
    echo "✅ Puerto accesible"
else
    echo "⏳ Inicializando... (tarda ~5-10 min)"
fi

echo ""
echo "✨ ¡Verificación completada!"
