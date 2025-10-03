# Encuentros — Entrega 2 (Instrucciones)

Tecnologías principales:

- Frontend: Angular 20.x (Node 20+ recomendado)
- Backend: NestJS (Node 20+)
- Base de datos: Oracle XE (imagen: gvenzl/oracle-xe)

Cómo ejecutar con Docker (desde la raíz del repo):

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
