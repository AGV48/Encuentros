#!/bin/sh
set -e

echo "⏳ Esperando 60 segundos para que Oracle se inicialice completamente..."
sleep 60

echo "🚀 Iniciando aplicación NestJS..."
exec node dist/main
