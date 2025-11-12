# Encuentros

<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)

</div>

## Descripción

**Encuentros** es una aplicación web tipo red social diseñada para facilitar la organización de salidas y reuniones sociales, educativas o laborales entre usuarios. Permite gestionar todos los aspectos de eventos grupales de manera centralizada, incluyendo:

- Gestión de participantes
- Control de presupuestos y aportes
- Chat en tiempo real
- Seguimiento de gastos compartidos

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIOS                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Angular)                          │
│              Puerto: 8090                                │
│              nginx:alpine                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND API (NestJS)                           │
│           Puerto: 3000                                   │
│           Node.js 20 + TypeScript                        │
│           Swagger Docs: /api-docs                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         BASE DE DATOS (PostgreSQL 16)                    │
│         Puerto: 5432                                     │
│         Database: encuentros_db                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              OBSERVABILIDAD                              │
├─────────────────────────────────────────────────────────┤
│  Grafana (3020)   │  Prometheus (9095)                   │
│  Loki (3110)      │  cAdvisor (8085)                     │
│  Promtail         │                                      │
└─────────────────────────────────────────────────────────┘
```

## Tecnologías Principales

### Backend
- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript
- **Runtime**: Node.js 20+
- **ORM**: TypeORM
- **Puerto**: 3000

### Frontend
- **Framework**: Angular 19.x
- **Lenguaje**: TypeScript
- **Servidor**: Nginx Alpine
- **Puerto**: 8090

### Base de Datos
- **Motor**: PostgreSQL 16 Alpine
- **Puerto**: 5432
- **Database**: encuentros_db

### Observabilidad
- **Grafana**: Dashboards y visualización (Puerto 3020)
- **Prometheus**: Métricas del sistema (Puerto 9095)
- **Loki**: Agregación de logs (Puerto 3110)
- **cAdvisor**: Métricas de contenedores (Puerto 8085)
- **Promtail**: Recolección de logs

### CI/CD
- **Jenkins**: Pipeline automatizado para build, test y deploy
- **Docker**: Containerización de todos los servicios
- **DockerHub**: Registro de imágenes

## Imágenes en DockerHub

Todas las imágenes están disponibles públicamente en DockerHub:

- **Backend**: [joshhd01/encuentros-backend](https://hub.docker.com/r/joshhd01/encuentros-backend)
- **Frontend**: [joshhd01/encuentros-frontend](https://hub.docker.com/r/joshhd01/encuentros-frontend)
- **Database**: [joshhd01/encuentros-database](https://hub.docker.com/r/joshhd01/encuentros-database)

## Pipeline CI/CD (Jenkins)

El proyecto incluye un pipeline Jenkins completo que automatiza:

1. **Checkout**: Clonación del repositorio
2. **Build Backend**: Compilación con npm (Node.js 20-alpine)
3. **Build Frontend**: Compilación con npm (Node.js 20-alpine)
4. **Build Docker Images**: Construcción paralela de 3 imágenes
5. **Push to DockerHub**: Publicación automática con tags

Ver [JENKINS_SETUP.md](./JENKINS_SETUP.md) para configuración detallada.

## Prerrequisitos

## Prerrequisitos

### Para ejecución con Docker (Recomendado)
- Docker Desktop 4.x+ o Docker Engine 20.x+
- Docker Compose 2.x+
- 4GB RAM mínimo (8GB recomendado)
- 10GB espacio en disco

### Para desarrollo local
- Node.js 20.x+
- npm 10.x+
- PostgreSQL 16+
- Angular CLI 19.x: `npm install -g @angular/cli`
- NestJS CLI 11.x: `npm install -g @nestjs/cli`

## Inicio Rápido

### Opción 1: Usando Docker Compose (Recomendado)

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/AGV48/Encuentros.git
   cd Encuentros
   ```

2. **Levantar todos los servicios**:
   ```bash
   docker-compose up -d
   ```

3. **Verificar que los servicios estén corriendo**:
   ```bash
   docker-compose ps
   ```

4. **Acceder a la aplicación**:
   - Frontend: http://localhost:8090
   - Backend API: http://localhost:3000
   - API Docs (Swagger): http://localhost:3000/api-docs
   - Grafana: http://localhost:3020 (admin/admin)
   - Prometheus: http://localhost:9095
   - cAdvisor: http://localhost:8085

### Opción 2: Descargar desde GitHub

1. Ir a https://github.com/AGV48/Encuentros
2. Click en **"Code"** > **"Download ZIP"**
3. Extraer la carpeta
4. Seguir los pasos de Docker Compose

## Estructura del Proyecto

```
Encuentros/
├── encuentros-back/          # Backend NestJS
│   ├── src/
│   │   ├── auth/            # Autenticación JWT
│   │   ├── users/           # Gestión de usuarios
│   │   ├── encuentro/       # Gestión de encuentros
│   │   ├── chat/            # Chat en tiempo real
│   │   ├── presupuesto/     # Presupuestos
│   │   ├── bolsillo/        # Bolsillos compartidos
│   │   └── aporte/          # Aportes económicos
│   ├── Dockerfile
│   └── package.json
│
├── encuentros-front/         # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/   # Módulos por funcionalidad
│   │   │   ├── services/   # Servicios HTTP
│   │   │   ├── guards/     # Guards de autenticación
│   │   │   └── interceptors/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── database/                 # PostgreSQL
│   ├── Dockerfile
│   ├── init-schema.sql      # Esquema completo
│   └── init.sh
│
├── observability/            # Stack de observabilidad
│   ├── grafana/
│   ├── loki-config.yml
│   ├── prometheus-config.yml
│   └── promtail-config.yml
│
├── docker-compose.yml        # Orquestación de servicios
├── Jenkinsfile              # Pipeline CI/CD
└── README.md
```

## Comandos Útiles

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f [servicio]

# Detener servicios
docker-compose down

# Rebuild y restart
docker-compose up --build -d

# Ver estado de servicios
docker-compose ps

# Eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

### Desarrollo Local

```bash
# Backend
cd encuentros-back
npm install
npm run start:dev

# Frontend
cd encuentros-front
npm install
npm start
```

## Variables de Entorno

Las principales variables están configuradas en `docker-compose.yml`:

### Backend
- `DB_HOST`: database
- `DB_PORT`: 5432
- `DB_USERNAME`: encuentros_user
- `DB_PASSWORD`: encuentros_pass
- `DB_DATABASE`: encuentros_db
- `JWT_SECRET`: your-secret-key

### Database
- `POSTGRES_DB`: encuentros_db
- `POSTGRES_USER`: encuentros_user
- `POSTGRES_PASSWORD`: encuentros_pass

## Monitoreo y Observabilidad

### Grafana
- URL: http://localhost:3020
- Usuario: `admin`
- Contraseña: `admin`

### Prometheus
- URL: http://localhost:9095
- Scrape interval: 15s
- Targets: Backend, Database, cAdvisor

### Loki
- Puerto: 3110
- Integrado con Promtail para agregación de logs

## Testing

```bash
# Backend unit tests
cd encuentros-back
npm test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd encuentros-front
npm test
```

## Notas Importantes

- La base de datos PostgreSQL se inicializa automáticamente con el esquema completo
- No se requiere configuración manual de base de datos
- Todos los servicios están containerizados y orquestados
- El healthcheck de la base de datos asegura que esté lista antes de iniciar el backend
- La primera vez puede tardar 2-3 minutos en descargar todas las imágenes
- Asegúrate de que los puertos 3000, 5432, 8090, 3020, 9095, 3110, 8085 estén disponibles

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Contacto

- **Repositorio**: [github.com/AGV48/Encuentros](https://github.com/AGV48/Encuentros)
- **Issues**: [github.com/AGV48/Encuentros/issues](https://github.com/AGV48/Encuentros/issues)

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

<div align="center">
  
**Hecho con NestJS, Angular y PostgreSQL**

</div>

