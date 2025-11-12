#!/bin/bash

# Script para probar manualmente la inicialización de la base de datos Oracle
# Este script simula lo que hace el pipeline de Jenkins

set -e

echo "======================================"
echo "  Prueba de Inicialización de BD    "
echo "======================================"
echo ""

# Variables
ORACLE_CONTAINER="encuentros_db_test"
ORACLE_PASSWORD="admin"
ORACLE_USER="ENCUENTROS_ADMIN"
ORACLE_DATABASE="XEPDB1"

# Función de limpieza
cleanup() {
    echo ""
    echo "🧹 Limpiando contenedor..."
    docker stop ${ORACLE_CONTAINER} 2>/dev/null || true
    docker rm ${ORACLE_CONTAINER} 2>/dev/null || true
}

# Registrar cleanup al salir
trap cleanup EXIT

# Limpiar cualquier contenedor previo
cleanup

echo "1️⃣ Iniciando contenedor Oracle..."
docker run -d --name ${ORACLE_CONTAINER} \
    -e ORACLE_PASSWORD=${ORACLE_PASSWORD} \
    -e ORACLE_DATABASE=${ORACLE_DATABASE} \
    -e APP_USER=${ORACLE_USER} \
    -e APP_USER_PASSWORD=${ORACLE_PASSWORD} \
    -p 1521:1521 \
    gvenzl/oracle-xe:21-slim

echo ""
echo "⏳ Esperando a que Oracle esté listo (60 segundos)..."
sleep 60

echo ""
echo "2️⃣ Copiando scripts SQL al contenedor..."
docker cp init-db/01-create-user.sql ${ORACLE_CONTAINER}:/tmp/
docker cp init-db/02-schema.sql ${ORACLE_CONTAINER}:/tmp/

echo ""
echo "3️⃣ Ejecutando 01-create-user.sql..."
docker exec ${ORACLE_CONTAINER} sqlplus -s sys/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} as sysdba @/tmp/01-create-user.sql

echo ""
echo "4️⃣ Ejecutando 02-schema.sql..."
docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} @/tmp/02-schema.sql

echo ""
echo "5️⃣ Verificando base de datos..."
docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} <<EOF
SET PAGESIZE 50
SET LINESIZE 120
COLUMN table_name FORMAT A30

SELECT 'Total de Tablas Creadas: ' || COUNT(*) as resultado FROM user_tables;

SELECT table_name FROM user_tables ORDER BY table_name;

SELECT 'Total de Secuencias: ' || COUNT(*) as resultado FROM user_sequences;

SELECT 'Total de Vistas: ' || COUNT(*) as resultado FROM user_views;

SELECT 'Total de Procedimientos: ' || COUNT(*) as resultado
FROM user_procedures
WHERE object_type = 'PROCEDURE';

EXIT;
EOF

echo ""
echo "======================================"
echo "  ✅ ¡Prueba completada exitosamente!"
echo "======================================"
echo ""
echo "Para conectarte manualmente a la BD:"
echo "  docker exec -it ${ORACLE_CONTAINER} sqlplus ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE}"
echo ""
echo "Para detener y eliminar el contenedor:"
echo "  docker stop ${ORACLE_CONTAINER}"
echo "  docker rm ${ORACLE_CONTAINER}"
echo ""
