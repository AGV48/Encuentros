# Stage 1: Construir la aplicación Node.js (NestJS)

FROM node:20-alpine AS build

# Definir el directorio de trabajo
WORKDIR /app

# Copiamos metadatos de dependencias para aprovechar cache de capas
COPY package*.json ./

# Instalamos dependencias para compilar
RUN npm ci --silent
# Copiamos el resto de la aplicación
COPY . .

# Construimos la aplicación
RUN npm run build

# Stage 2: Servir la aplicación con Node.js
FROM node:20-alpine

# Definir el directorio de trabajo
WORKDIR /app

# Copiamos metadatos de dependencias
COPY package*.json ./

# Instalamos solo las dependencias de producción
RUN npm ci --omit=dev --silent

# Copia los archivos generados en el build
COPY --from=build /app/dist ./dist

# Exponemos el puerto 3000
EXPOSE 3000

# Establecer la variable de entorno para producción
ENV NODE_ENV=production

# Comando CMD para ejecutar la aplicación
CMD ["node", "dist/main"]
