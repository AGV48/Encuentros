#!/bin/bash
set -e

echo "⏳ Esperando a que Oracle esté completamente listo..."
sleep 15

echo "🔍 Verificando si el usuario ENCUENTROS_ADMIN existe..."

# Verificar si el usuario existe
USER_EXISTS=$(sqlplus -s sys/admin@db:1521/XEPDB1 as sysdba <<EOF
SET HEADING OFF
SET FEEDBACK OFF
SET PAGESIZE 0
SELECT COUNT(*) FROM dba_users WHERE username = 'ENCUENTROS_ADMIN';
EXIT;
EOF
)

# Eliminar espacios en blanco
USER_EXISTS=$(echo "$USER_EXISTS" | tr -d ' ')

if [ "$USER_EXISTS" != "0" ]; then
  echo "✅ Usuario ENCUENTROS_ADMIN ya existe, saltando inicialización"
  exit 0
fi

echo "📝 Usuario no existe, ejecutando scripts de inicialización..."

# Ejecutar script de creación de usuario
echo "📝 Creando usuario ENCUENTROS_ADMIN..."
sqlplus -s sys/admin@db:1521/XEPDB1 as sysdba @/scripts/01-create-user.sql

# Ejecutar script de schema
echo "📝 Creando schema completo..."
sqlplus -s ENCUENTROS_ADMIN/admin@db:1521/XEPDB1 @/scripts/02-schema.sql

echo "✅ Inicialización completada exitosamente!"
