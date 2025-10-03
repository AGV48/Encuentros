# Stage 1: Build the Angular application

# ===== Build stage (Usamos nodejs porque Angular se construye con Node) =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./ package-lock.json ./
# Instalamos dependencias
RUN npm install
RUN npm ci --silent
COPY . .
# build; si vamos a cambiar la configuración de salida, ajustar aquí, ajustar los flags
RUN npm run build --

# Stage 2: Serve the application with Nginx
# ===== Runtime (Angular usa Nginx por decirlo así) =====
FROM nginx:stable-alpine
# Copia los artefactos del build al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
