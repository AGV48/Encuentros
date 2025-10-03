# Stage 1: Build the Nodejs application
FROM node:20-alpine AS build
WORKDIR /app
# copia package-lock si existe para npm ci reproducible
COPY package*.json ./ ./ package-lock.json ./
# Instalamos dependencias
RUN npm install
RUN npm ci --silent
COPY . .
RUN npm run build


# Stage 2: Serve the application with Nodejs
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./ ./ package-lock.json ./
RUN npm ci --only=production --silent
COPY --from=build /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main"]
