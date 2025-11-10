# Encuentros — (Instrucciones)

# ¿Qué es Encuentros?

Encuentros, una aplicación web tipo red social enfocada en facilitar la organización de salidas y reuniones sociales, educativas o laborales entre usuarios.

# ¿Para qué sirve?

Sirve para personas que desean mejorar la planificación de sus encuentros grupales, familiares o de trabajo, y buscan una herramienta centralizada donde puedan gestionar todos los aspectos de dichos eventos.

# Tecnologías principales:

## Backend:

      - Framework: NestJS (Node 20+)
      - Lenguaje: TypeScript
      - Base de datos: Oracle Database
      - Ejecuta en el puerto 3000

## Frontend:

      - Framework: Angular
      - Lenguaje: TypeScript
      - Ejecuta en el puerto 80

## Base de datos:

      - Imagen: gvenzl/oracle-xe
      - Version: Oracle XE 21c

# Prerrequisitos de la app

## Si se va a ejecutar con Docker:

      - Docker Desktop 4.x o superior (https://www.docker.com/products/docker-desktop/)
      - Docker Engine 20.x o superior
      - Docker Compose 2.x o superior

## Si se va a ejecurar Local:

      - NodeJS 20.x o superior (https://nodejs.org/en/download)
      - npm 10.x o superior
      - Oracle Database 21c (https://nodejs.org/en/download)
      - Oracle Instant client
      - Angular CLI 20.x (npm install -g @angular/cli)
      - NestJS CLI 11.x (npm install -g @nestjs/cli)

# Enlaces de las Imágenes en DockerHub

Backend:

      https://hub.docker.com/r/tomasra98/encuentros-backend

Frontend:

      https://hub.docker.com/r/tomasra98/encuentros-frontend

# ¿Cómo descargar la aplicación?

## Opción 1 - Clonar desde GitHub:

      --> Hay que tener Git instalado (https://git-scm.com/downloads)

      1. Abrir la terminal de preferencia
      2. Ejecutar el comando git clone https://github.com/AGV48/Encuentros

## Opción 2 - Descargar ZIP desde GitHub:

      1. Ir a https://github.com/AGV48/Encuentros
      2. Click en "Code" > "Download ZIP"
      3. Extraer la carpeta

# Ejecución de la aplicación

--> Estar en la carpeta raiz de la aplicación

1.  Construir y levantar todo:

        docker-compose up --build -d

2.  Esperar a que Oracle DB esté completamente inicializada:

    - Oracle XE puede tardar 2-5 minutos en inicializar la primera vez
    - Puedes verificar el estado con: docker logs encuentros_db

3.  Configurar la base de datos ejecutando los scripts SQL:

    a) Conectarse al contenedor de Oracle:

        docker exec -it encuentros_db bash

    b) Conectarse a SQL\*Plus como SYSTEM:

        sqlplus system/admin@localhost:1521/XE

    c) Ejecutar el script de creación de usuario:

        @/container-entrypoint-initdb.d/01-create-user.sql

    d) Si estás en el contenedor de Oracle, se ve así:

        bash-4.4$

    Si te encuentras ahí, pasa al paso e)

    Si sigues viendo que en la terminal aparece:

        SQL>

    Debes salir de SQL\*Plus:

        EXIT;

    e) Conectarse nuevamente como el usuario ENCUENTROS_ADMIN:

        sqlplus ENCUENTROS_ADMIN/admin@localhost:1521/XEPDB1

    f) Ejecutar el script del esquema (tablas, secuencias, procedimientos):

        @/container-entrypoint-initdb.d/02-schema.sql

    g) Salir de SQL\*Plus:

        EXIT;

    h) Salir del contenedor:

        exit

5.  Verificar que todo funcione correctamente:

    - Frontend: http://localhost/
    - Backend API: http://localhost:3000/ (Debe mostrar Hello World!)

6.  Probar la aplicación:
    - Registrar un nuevo usuario
    - Iniciar sesión
    - Crear encuentros y usar todas las funcionalidades

Notas importantes:

- Oracle XE (imagen) puede tardar varios minutos en inicializar la primera vez.
- Los scripts SQL DEBEN ejecutarse en el orden indicado (primero 01-create-user.sql, luego 02-schema.sql).
- El script 01-create-user.sql crea el usuario ENCUENTROS_ADMIN en la base de datos XEPDB1.
- El script 02-schema.sql crea todas las tablas, secuencias, procedimientos almacenados y vistas necesarias.
- Si tienes problemas de conexión, verifica los logs: docker logs encuentros_db
