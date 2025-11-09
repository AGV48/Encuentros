#!/bin/bash
set -e

echo "Esperando a que Oracle esté listo..."
sleep 30

echo "Ejecutando scripts de inicialización..."

# Ejecutar script de creación de usuario
echo "Creando usuario ENCUENTROS_ADMIN..."
sqlplus -s sys/admin@localhost:1521/XEPDB1 as sysdba @/container-entrypoint-initdb.d/01-create-user.sql

# Ejecutar script de schema
echo "Creando schema completo..."
sqlplus -s ENCUENTROS_ADMIN/admin@localhost:1521/XEPDB1 @/container-entrypoint-initdb.d/02-schema.sql

echo "Inicialización completada exitosamente!"
