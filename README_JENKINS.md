# 🚀 Pipeline CI/CD Jenkins - Proyecto Encuentros

## 📌 Resumen Ejecutivo

Este pipeline de Jenkins implementa un flujo completo de CI/CD que cumple con **TODOS** los requisitos solicitados:

### ✅ Requisitos Implementados

| Requisito                              | Estado          | Etapa del Pipeline                           |
| -------------------------------------- | --------------- | -------------------------------------------- |
| 🔨 Compilación/Build                   | ✅ Implementado | `Build Backend` + `Build Frontend`           |
| 🧪 Pruebas Unitarias                   | ✅ Implementado | `Unit Tests Backend` + `Unit Tests Frontend` |
| 🐳 Generación de Imágenes Docker       | ✅ Implementado | `Build Docker Images`                        |
| 📤 Publicación en DockerHub            | ✅ Implementado | `Push to DockerHub`                          |
| 🗄️ **Inicialización Automática de BD** | ✅ **EXTRA**    | `Initialize Database` + `Verify Database`    |

## 🎯 Característica Especial: Inicialización Automática de Base de Datos

### ¿Qué hace?

El pipeline **automáticamente ejecuta** los scripts SQL (`01-create-user.sql` y `02-schema.sql`) después de construir las imágenes Docker y antes de publicarlas en DockerHub. Esto garantiza que:

- ✅ Los scripts SQL son válidos
- ✅ El esquema de BD está correcto
- ✅ Todas las tablas, vistas, procedimientos y secuencias se crean sin errores
- ✅ La aplicación está lista para despliegue inmediato

### ¿Cómo funciona?

1. **Inicia un contenedor Oracle temporal** durante el pipeline
2. **Copia y ejecuta** `01-create-user.sql` (crea usuario ENCUENTROS_ADMIN)
3. **Copia y ejecuta** `02-schema.sql` (crea 14 tablas, 13 secuencias, 4 vistas, 6 procedimientos, etc.)
4. **Verifica** que todo se creó correctamente
5. **Limpia** el contenedor temporal al finalizar

## 📂 Archivos Creados

### 1. `Jenkinsfile` - Pipeline Principal

El archivo principal que define todo el flujo CI/CD.

**Características:**

- Compatible con Linux y Windows
- Ejecución paralela de builds de imágenes Docker
- Inicialización automática de BD
- Verificación de schema
- Limpieza automática de recursos

**Ubicación:** `./Jenkinsfile`

### 2. `JENKINS_DB_SETUP.md` - Documentación Completa

Guía detallada sobre el pipeline y la inicialización de base de datos.

**Incluye:**

- Diagrama de flujo del pipeline
- Explicación detallada de cada etapa
- Configuración de Jenkins
- Troubleshooting
- Variables de entorno
- Ejemplos de logs

**Ubicación:** `./JENKINS_DB_SETUP.md`

### 3. `test-db-init.sh` y `test-db-init.bat` - Scripts de Prueba

Scripts para probar manualmente la inicialización de BD antes de ejecutar el pipeline.

**Uso:**

```bash
# Linux/Mac
chmod +x test-db-init.sh
./test-db-init.sh

# Windows
test-db-init.bat
```

**Ubicación:** `./test-db-init.sh` y `./test-db-init.bat`

## 🔧 Configuración Rápida en Jenkins

### Paso 1: Crear Credenciales de DockerHub

1. **Manage Jenkins** → **Manage Credentials** → **Add Credentials**
2. Configurar:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: `tomasra98`
   - **Password**: Tu contraseña o token de DockerHub
   - **ID**: `dockerhub-credentials` ⚠️ **MUY IMPORTANTE**
   - **Description**: DockerHub credentials

### Paso 2: Instalar Plugins

En **Manage Jenkins** → **Manage Plugins**, instalar:

- Docker Pipeline
- Docker Plugin
- Git Plugin
- Pipeline Plugin
- Credentials Binding Plugin

### Paso 3: Verificar Permisos de Docker

```bash
# Linux
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verificar
sudo -u jenkins docker ps
```

### Paso 4: Crear el Job de Pipeline

1. **New Item** → Nombre: `Encuentros-CI-CD` → Tipo: **Pipeline**
2. En **Pipeline**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/AGV48/Encuentros.git`
   - **Branch**: `*/Docker-Compose-With-DockerHub`
   - **Script Path**: `Jenkinsfile`
3. **Save**

### Paso 5: Ejecutar

Click en **Build Now** y observar el progreso.

## 📊 Etapas del Pipeline

| #   | Etapa                   | Descripción                                      | Tiempo Aprox. |
| --- | ----------------------- | ------------------------------------------------ | ------------- |
| 1   | Checkout                | Clonar repositorio                               | 10s           |
| 2   | Build Backend           | Compilar NestJS (`npm ci` + `npm run build`)     | 2-3 min       |
| 3   | Build Frontend          | Compilar Angular (`npm ci` + `npm run build`)    | 3-4 min       |
| 4   | Unit Tests Backend      | Ejecutar tests con Jest                          | 30s           |
| 5   | Unit Tests Frontend     | Ejecutar tests con Karma                         | 1 min         |
| 6   | Build Docker Images     | Construir imágenes backend y frontend (paralelo) | 3-5 min       |
| 7   | **Initialize Database** | **Iniciar Oracle, ejecutar SQLs, verificar**     | **2-3 min**   |
| 8   | **Verify Database**     | **Contar tablas y validar schema**               | **10s**       |
| 9   | Push to DockerHub       | Publicar 4 imágenes (2 tags cada una)            | 2-3 min       |
| 10  | Clean Up                | Eliminar contenedor Oracle e imágenes locales    | 30s           |

**Tiempo Total Estimado:** 15-20 minutos

## 🎬 Lo que se Ejecuta en "Initialize Database"

### Scripts SQL Ejecutados:

#### 1. `01-create-user.sql`

```sql
-- Conectar a XEPDB1
ALTER SESSION SET CONTAINER = XEPDB1;

-- Crear usuario ENCUENTROS_ADMIN
CREATE USER ENCUENTROS_ADMIN IDENTIFIED BY admin ...

-- Otorgar privilegios
GRANT CONNECT, RESOURCE, DBA TO ENCUENTROS_ADMIN;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW... TO ENCUENTROS_ADMIN;
```

#### 2. `02-schema.sql`

Crea:

- ✅ **13 Secuencias** (SEQ_USUARIOS, SEQ_ENCUENTROS, SEQ_APORTES, etc.)
- ✅ **14 Tablas**:
  - USUARIOS
  - ENCUENTROS
  - PARTICIPANTES_ENCUENTRO
  - APORTES
  - BOLSILLOS
  - PRESUPUESTOS
  - ITEMS_PRESUPUESTO
  - GASTOS
  - MENSAJES
  - RECORDATORIOS
  - AMISTADES
  - RELACIONES_AMISTADES
  - SOLICITUDES_AMISTAD
  - migrations, typeorm_metadata
- ✅ **4 Vistas**:
  - V_ENCUENTRO_RESUMEN
  - V_PARTICIPANTES_ENCUENTRO
  - VISTAPARTICIPANTESAPORTES
  - VISTAPRESUPUESTOSGASTOS
- ✅ **6 Procedimientos Almacenados**:
  - CREAR_ENCUENTRO
  - AGREGAR_PARTICIPANTE_ENCUENTRO
  - AGREGAR_ITEM_PRESUPUESTO
  - AGREGAR_APORTE
  - AGREGAR_GASTO
  - CREAR_SOLICITUD_AMISTAD
  - ACEPTAR_SOLICITUD_AMISTAD
  - ESTADISTICAS_EVENTOS_FINANCIEROS
- ✅ **1 Paquete PL/SQL**: PKG_CENTRAL
- ✅ **30+ Índices** para optimización
- ✅ **Constraints** (PKs, FKs, Checks)
- ✅ **1 Usuario de prueba** inicial

## 📦 Resultado Final

Al finalizar exitosamente el pipeline, se habrán publicado en DockerHub:

```
tomasra98/encuentros-backend:1    (número de build)
tomasra98/encuentros-backend:latest

tomasra98/encuentros-frontend:1   (número de build)
tomasra98/encuentros-frontend:latest
```

Y se habrá verificado que:

- ✅ El código compila sin errores
- ✅ Los tests unitarios pasan
- ✅ Las imágenes Docker se construyen correctamente
- ✅ **Los scripts SQL se ejecutan sin errores**
- ✅ **El esquema de BD está completo y funcional**

## 🧪 Probar Antes de Ejecutar el Pipeline

Usa los scripts de prueba incluidos:

### En Linux/Mac:

```bash
chmod +x test-db-init.sh
./test-db-init.sh
```

### En Windows (PowerShell):

```powershell
.\test-db-init.bat
```

Estos scripts simulan exactamente lo que hace el pipeline con la base de datos.

## 🔍 Verificar Resultados

### Ver las imágenes publicadas:

Visita: https://hub.docker.com/u/tomasra98

### Ver los logs del pipeline:

1. En Jenkins, ir al build
2. Click en **Console Output**
3. Buscar:
   ```
   ✅ ¡Pipeline ejecutado exitosamente!
   📦 Imágenes publicadas:
      - tomasra98/encuentros-backend:X
      - tomasra98/encuentros-backend:latest
      - tomasra98/encuentros-frontend:X
      - tomasra98/encuentros-frontend:latest
   🗄️ Base de datos inicializada y verificada
   ```

### Conectarse a la BD temporal (durante el pipeline):

```bash
docker exec -it encuentros_db_temp sqlplus ENCUENTROS_ADMIN/admin@localhost:1521/XEPDB1
```

## 🛠️ Solución de Problemas Comunes

### ❌ Error: "docker: command not found"

**Solución:**

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### ❌ Error: "Credentials not found"

**Solución:** Verificar que las credenciales se crearon con ID exactamente: `dockerhub-credentials`

### ❌ Error: "Oracle container not ready"

**Solución:** En el Jenkinsfile, aumentar el tiempo de espera:

```groovy
sleep 90  // en lugar de 60
```

### ❌ Error: "ORA-01017: invalid username/password"

**Solución:** Verificar las variables de entorno en el Jenkinsfile:

```groovy
ORACLE_PASSWORD = 'admin'
ORACLE_USER = 'ENCUENTROS_ADMIN'
```

## 📈 Mejoras Opcionales Futuras

1. **Cache de dependencias npm** para builds más rápidos
2. **Tests de integración E2E** contra la BD inicializada
3. **Análisis de código estático** (SonarQube)
4. **Escaneo de vulnerabilidades** (Trivy, Snyk)
5. **Notificaciones** (Slack, Email, Teams)
6. **Despliegue automático** a ambiente de staging
7. **Métricas de performance** y cobertura de código

## 📞 Contacto y Soporte

Para problemas o dudas:

1. Revisar `JENKINS_DB_SETUP.md` para guía detallada
2. Ejecutar `test-db-init.sh` para probar localmente
3. Revisar logs en **Console Output** de Jenkins
4. Verificar que Docker está funcionando: `docker ps`

## 📄 Archivos del Proyecto

```
Encuentros/
├── Jenkinsfile                    ← Pipeline principal
├── JENKINS_DB_SETUP.md           ← Documentación detallada
├── README_JENKINS.md             ← Este archivo
├── test-db-init.sh               ← Script de prueba (Linux)
├── test-db-init.bat              ← Script de prueba (Windows)
├── docker-compose.yml            ← Compose para deployment
├── encuentros-back/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── encuentros-front/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── init-db/
    ├── 00-init.sh
    ├── 01-create-user.sql        ← Creación de usuario
    └── 02-schema.sql             ← Schema completo de BD
```

## ✨ Características Destacadas

- 🚀 **Pipeline completo end-to-end**
- 🔄 **Builds paralelos** para mayor velocidad
- 🗄️ **Inicialización automática de BD** con validación
- 🐳 **Multi-plataforma** (Linux y Windows)
- 🧹 **Auto-limpieza** de recursos temporales
- ✅ **Verificación en cada etapa**
- 📊 **Logs detallados y descriptivos**
- 🔐 **Manejo seguro de credenciales**

---

**¡Todo listo para ejecutar tu pipeline CI/CD con inicialización automática de base de datos!** 🎉
