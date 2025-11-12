# Pipeline CI/CD con Inicialización Automática de Base de Datos

## 📋 Descripción General

Este pipeline de Jenkins implementa un flujo completo de CI/CD que incluye:

1. ✅ **Compilación/Build** (Backend y Frontend)
2. ✅ **Pruebas Unitarias** (Backend y Frontend)
3. ✅ **Generación de Imágenes Docker**
4. ✅ **Inicialización Automática de Base de Datos Oracle**
5. ✅ **Publicación en DockerHub**

## 🎯 Característica Principal: Inicialización de Base de Datos

### ¿Qué hace?

Después de construir las imágenes Docker y **antes de publicarlas en DockerHub**, el pipeline automáticamente:

1. **Inicia un contenedor temporal de Oracle Database**
2. **Ejecuta los scripts SQL de inicialización:**
   - `01-create-user.sql` - Crea el usuario `ENCUENTROS_ADMIN`
   - `02-schema.sql` - Crea todas las tablas, secuencias, vistas, procedimientos almacenados y datos iniciales
3. **Verifica que la base de datos se haya inicializado correctamente**
4. **Limpia el contenedor temporal** al finalizar

### ¿Por qué es importante?

Esto garantiza que:

- ✅ Los scripts SQL son válidos y se ejecutan sin errores
- ✅ El esquema de base de datos está actualizado y funcional
- ✅ Cualquier problema con la estructura de la BD se detecta antes del despliegue
- ✅ La base de datos está lista para ser usada inmediatamente después del despliegue

## 🔄 Flujo del Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Checkout - Clonar repositorio                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Build Backend - Compilar NestJS                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Build Frontend - Compilar Angular                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Unit Tests Backend - Jest                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Unit Tests Frontend - Karma/Jasmine                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. Build Docker Images (paralelo)                             │
│     ├─ Backend Image                                           │
│     └─ Frontend Image                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Initialize Database ⭐ NUEVA ETAPA                         │
│     ├─ Iniciar Oracle Container temporal                       │
│     ├─ Copiar scripts SQL (01-create-user.sql)                 │
│     ├─ Copiar scripts SQL (02-schema.sql)                      │
│     ├─ Ejecutar 01-create-user.sql                             │
│     ├─ Ejecutar 02-schema.sql                                  │
│     └─ Esperar 60s para que Oracle esté listo                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. Verify Database - Verificar tablas creadas                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  9. Push to DockerHub - Publicar imágenes                      │
│     ├─ tomasra98/encuentros-backend:BUILD_NUMBER               │
│     ├─ tomasra98/encuentros-backend:latest                     │
│     ├─ tomasra98/encuentros-frontend:BUILD_NUMBER              │
│     └─ tomasra98/encuentros-frontend:latest                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  10. Clean Up - Limpiar contenedor Oracle e imágenes locales   │
└─────────────────────────────────────────────────────────────────┘
```

## 🗄️ Detalle de la Etapa de Inicialización de Base de Datos

### Paso 1: Iniciar Contenedor Oracle

```bash
docker run -d --name encuentros_db_temp \
    -e ORACLE_PASSWORD=admin \
    -e ORACLE_DATABASE=XEPDB1 \
    -e APP_USER=ENCUENTROS_ADMIN \
    -e APP_USER_PASSWORD=admin \
    -p 1521:1521 \
    gvenzl/oracle-xe:21-slim
```

### Paso 2: Esperar Inicialización

```bash
# Oracle tarda ~60 segundos en estar completamente listo
sleep 60
```

### Paso 3: Copiar Scripts SQL

```bash
docker cp init-db/01-create-user.sql encuentros_db_temp:/tmp/
docker cp init-db/02-schema.sql encuentros_db_temp:/tmp/
```

### Paso 4: Ejecutar Script de Usuario

```bash
docker exec encuentros_db_temp sqlplus -s \
    sys/admin@localhost:1521/XEPDB1 as sysdba \
    @/tmp/01-create-user.sql
```

Este script:

- Crea el usuario `ENCUENTROS_ADMIN`
- Otorga privilegios necesarios (CONNECT, RESOURCE, DBA, etc.)
- Desbloquea la cuenta

### Paso 5: Ejecutar Script de Schema

```bash
docker exec encuentros_db_temp sqlplus -s \
    ENCUENTROS_ADMIN/admin@localhost:1521/XEPDB1 \
    @/tmp/02-schema.sql
```

Este script crea:

- ✅ **13 Secuencias** (SEQ_USUARIOS, SEQ_ENCUENTROS, SEQ_APORTES, etc.)
- ✅ **14 Tablas** (USUARIOS, ENCUENTROS, APORTES, BOLSILLOS, GASTOS, etc.)
- ✅ **4 Vistas** (V_ENCUENTRO_RESUMEN, V_PARTICIPANTES_ENCUENTRO, etc.)
- ✅ **6 Procedimientos Almacenados** (CREAR_ENCUENTRO, AGREGAR_APORTE, etc.)
- ✅ **1 Paquete PL/SQL** (PKG_CENTRAL)
- ✅ **Índices** (30+ índices para optimización)
- ✅ **Constraints** (Primary Keys, Foreign Keys, Checks)
- ✅ **Datos Iniciales** (1 usuario de prueba)

### Paso 6: Verificar Base de Datos

```bash
docker exec encuentros_db_temp sqlplus -s \
    ENCUENTROS_ADMIN/admin@localhost:1521/XEPDB1 <<EOF
SELECT COUNT(*) AS "Total Tables" FROM user_tables;
EXIT;
EOF
```

Debería mostrar **14 tablas** creadas.

## 📊 Variables de Entorno Configurables

| Variable             | Valor por Defecto    | Descripción                    |
| -------------------- | -------------------- | ------------------------------ |
| `DOCKERHUB_USERNAME` | `tomasra98`          | Usuario de DockerHub           |
| `ORACLE_CONTAINER`   | `encuentros_db_temp` | Nombre del contenedor temporal |
| `ORACLE_PASSWORD`    | `admin`              | Contraseña de Oracle           |
| `ORACLE_USER`        | `ENCUENTROS_ADMIN`   | Usuario de la aplicación       |
| `ORACLE_DATABASE`    | `XEPDB1`             | Nombre de la PDB               |
| `IMAGE_TAG`          | `${BUILD_NUMBER}`    | Tag de las imágenes Docker     |

## ⚙️ Configuración en Jenkins

### 1. Credenciales de DockerHub

Crear credenciales con ID `dockerhub-credentials`:

- **Manage Jenkins** → **Manage Credentials**
- **Kind**: Username with password
- **ID**: `dockerhub-credentials`
- **Username**: `tomasra98`
- **Password**: Tu contraseña o token de DockerHub

### 2. Plugins Necesarios

- ✅ Docker Pipeline Plugin
- ✅ Docker Plugin
- ✅ Git Plugin
- ✅ Pipeline Plugin
- ✅ Credentials Plugin

### 3. Permisos de Docker

El usuario Jenkins debe poder ejecutar Docker:

```bash
# Linux
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verificar
sudo -u jenkins docker ps
```

## 🚀 Ejecutar el Pipeline

### Opción 1: Manualmente

1. Ir al job en Jenkins
2. Click en **Build Now**
3. Observar el progreso en **Stage View**
4. Revisar logs en **Console Output**

### Opción 2: Automáticamente (Webhook)

Configurar webhook en GitHub:

1. **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://tu-jenkins-url/github-webhook/`
3. **Events**: Push events

## 📦 Resultados Esperados

### Al finalizar exitosamente:

1. ✅ **Código compilado y probado**
2. ✅ **4 imágenes Docker publicadas en DockerHub:**
   - `tomasra98/encuentros-backend:BUILD_NUMBER`
   - `tomasra98/encuentros-backend:latest`
   - `tomasra98/encuentros-frontend:BUILD_NUMBER`
   - `tomasra98/encuentros-frontend:latest`
3. ✅ **Scripts SQL validados** (se ejecutaron sin errores)
4. ✅ **Esquema de BD verificado** (14 tablas creadas)

### Logs de Ejemplo (Éxito):

```
✅ ¡Pipeline ejecutado exitosamente!
📦 Imágenes publicadas:
   - tomasra98/encuentros-backend:42
   - tomasra98/encuentros-backend:latest
   - tomasra98/encuentros-frontend:42
   - tomasra98/encuentros-frontend:latest
🗄️ Base de datos inicializada y verificada
```

## 🛠️ Troubleshooting

### Error: "Oracle container not ready"

**Causa**: Oracle no tuvo suficiente tiempo para inicializar

**Solución**: Aumentar el tiempo de espera en el Jenkinsfile:

```groovy
sleep 90  // en lugar de 60
```

### Error: "ORA-01017: invalid username/password"

**Causa**: Credenciales incorrectas

**Solución**: Verificar las variables de entorno:

```groovy
environment {
    ORACLE_PASSWORD = 'admin'
    ORACLE_USER = 'ENCUENTROS_ADMIN'
}
```

### Error: "Table or view does not exist"

**Causa**: El script `02-schema.sql` no se ejecutó correctamente

**Solución**: Revisar los logs del pipeline en la etapa "Initialize Database"

### Error: "Permission denied (Docker)"

**Causa**: Usuario Jenkins no tiene permisos para Docker

**Solución**:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Error: "Port 1521 already in use"

**Causa**: Otro contenedor Oracle ya está usando el puerto

**Solución**:

```bash
# Detener contenedores Oracle existentes
docker stop $(docker ps -q --filter ancestor=gvenzl/oracle-xe:21-slim)
```

## 🎨 Personalización

### Cambiar el tiempo de espera de Oracle

En el Jenkinsfile, modificar:

```groovy
sleep 60  // Cambiar a 90 o 120 si es necesario
```

### Ejecutar scripts SQL adicionales

Agregar después del `02-schema.sql`:

```groovy
docker exec ${ORACLE_CONTAINER} sqlplus -s \
    ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} \
    @/tmp/03-mi-script.sql
```

### Omitir la inicialización de BD (para testing)

Comentar la etapa completa:

```groovy
// stage('Initialize Database') {
//     ... código de inicialización ...
// }
```

## 📈 Mejoras Futuras

1. **Cache de npm dependencies** para builds más rápidos
2. **Tests de integración** contra la BD inicializada
3. **Escaneo de vulnerabilidades** en imágenes Docker
4. **Notificaciones** (Email, Slack, Teams)
5. **Métricas de cobertura de código**
6. **Despliegue automático a staging**
7. **Health checks** del backend contra Oracle

## 📞 Soporte

Si tienes problemas con el pipeline:

1. Revisar **Console Output** del build en Jenkins
2. Verificar que Docker esté funcionando: `docker ps`
3. Comprobar credenciales de DockerHub
4. Validar scripts SQL manualmente:
   ```bash
   docker run -it --rm gvenzl/oracle-xe:21-slim bash
   ```

## 📄 Referencias

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [Oracle XE Docker Image](https://hub.docker.com/r/gvenzl/oracle-xe)
- [SQLPlus Reference](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqpug/)
