# Encuentros — (Instrucciones)

# ¿Qué es Encuentros?

Encuentros, una aplicación web tipo red social enfocada en facilitar la organización de salidas y reuniones sociales, educativas o laborales entre usuarios.

# ¿Para qué sirve?

Sirve para personas que desean mejorar la planificación de sus encuentros grupales, familiares o de trabajo, y buscan una herramienta centralizada donde puedan gestionar todos los aspectos de dichos eventos.

# Tecnologías principales:

   ## Backend: 
      - Framework: NestJS (Node 20+ recomendado)
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

# ¿Cómo descargar la aplicación?

   ## Opción 1 - Clonar desde GitHub:
      
      --> Hay que tener Git instalado (https://git-scm.com/downloads)

      1. Abrir la terminal de preferencia
      2. Ejecutar el comando git clone https://github.com/AGV48/Encuentros


   ## Opción 2 - Descargar ZIP desde GitHub:

      1. Ir a https://github.com/AGV48/Encuentros
      2. Click en "Code" > "Download ZIP"
      3. Extraer la carpeta

   ## Opción 3 - Descargar desde DockerHub:

      1. Abrir la terminal de preferencia

      --> Ejecutar en terminal los siguientes comandos:

      2. docker pull <usuario>/encuentros-back:latest
      3. docker pull <usuario>/encuentros-front:latest
      4. docker pull gvenzl/oracle-xe:21-slim

# Ejecución de la aplicación
   --> Estar en la carpeta raiz de la aplicación

   1. Construir y levantar todo:
      docker-compose up --build

   2. Verificar:

   - Frontend: http://localhost/
   - Backend API: http://localhost:3000/
   - Swagger: http://localhost:3000/api


   Push a DockerHub (si quieres subir imágenes):

   1. docker build -t <usuario>/encuentros-back:latest ./encuentros-back
   2. docker push <usuario>/encuentros-back:latest
   3. docker build -t <usuario>/encuentros-front:latest ./encuentros-front
   4. docker push <usuario>/encuentros-front:latest

Notas:

- Oracle XE (imagen) puede tardar varios minutos en inicializar la primera vez.
- Si no puedes usar la imagen pública de Oracle por políticas, hablamos de alternativas (por ejemplo usar Postgres solo para pruebas locales y mantener scripts SQL compatibles).
