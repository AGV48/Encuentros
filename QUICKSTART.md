# 🚀 Guía Rápida - Sistema de Seguridad JWT

## ✅ ¿Qué se ha implementado?

### Backend (NestJS)
- ✅ Módulo de autenticación completo (`/auth`)
- ✅ Endpoints de login y registro
- ✅ Cifrado de contraseñas con bcrypt
- ✅ Generación y validación de tokens JWT
- ✅ Protección de todos los endpoints con JWT Guard
- ✅ Script de migración para contraseñas existentes

### Frontend (Angular)
- ✅ Servicio de autenticación centralizado
- ✅ Interceptor HTTP para tokens automáticos
- ✅ Guard de rutas para protección de páginas
- ✅ Actualización de componentes Login y SignUp
- ✅ Todas las rutas protegidas con authGuard

## 🎯 Pasos para Empezar

### 1. Backend - Primera Vez

```powershell
cd encuentros-back

# Las dependencias ya están instaladas, pero si necesitas reinstalar:
# npm install

# (Opcional) Si tienes usuarios con contraseñas en texto plano:
npm run build
node dist/migrate-passwords

# Iniciar el servidor
npm run start:dev
```

### 2. Frontend - Primera Vez

```powershell
cd encuentros-front

# Instalar dependencias si es necesario
# npm install

# Iniciar el servidor de desarrollo
npm start
```

### 3. Probar el Sistema

1. **Registrar un nuevo usuario:**
   - Ve a `http://localhost:4200/sign-up`
   - Completa el formulario
   - La contraseña se cifrará automáticamente
   - Recibirás un token JWT
   - Serás redirigido a `/home`

2. **Iniciar sesión:**
   - Ve a `http://localhost:4200`
   - Ingresa email y contraseña
   - El token se guardará automáticamente
   - Todas las peticiones incluirán el token

3. **Acceder a rutas protegidas:**
   - Intenta acceder a `/home`, `/chats`, etc.
   - Si no estás autenticado, serás redirigido a `/login`
   - Con sesión activa, accederás normalmente

## 🔧 Configuración Importante

### Cambiar el Secreto JWT (RECOMENDADO)

1. Crea un archivo `.env` en `encuentros-back/`:
```env
JWT_SECRET=tu_clave_super_secreta_aqui
```

2. O genera una clave segura:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📋 Endpoints Disponibles

### Públicos (no requieren token)
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Protegidos (requieren token JWT)
- `GET /auth/profile` - Obtener perfil
- `POST /auth/validate` - Validar token
- `GET /users/*` - Todos los endpoints de usuarios
- `GET /encuentro/*` - Todos los endpoints de encuentros
- `GET /chat/*` - Todos los endpoints de chats
- `GET /aporte/*` - Todos los endpoints de aportes
- `GET /bolsillo/*` - Todos los endpoints de bolsillos
- `GET /presupuesto/*` - Todos los endpoints de presupuestos
- `GET /participantes-encuentro/*` - Todos los endpoints de participantes

## 🧪 Probar con curl

### Registrar usuario
```powershell
curl -X POST http://localhost:3000/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"nombre\": \"Test\", \"email\": \"test@test.com\", \"contrasena\": \"password123\"}'
```

### Iniciar sesión
```powershell
curl -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"test@test.com\", \"contrasena\": \"password123\"}'
```

### Usar endpoint protegido
```powershell
curl -X GET http://localhost:3000/auth/profile `
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🐛 Solución de Problemas

### "Unauthorized" en el frontend
- Verifica que el token esté en localStorage: `localStorage.getItem('access_token')`
- Revisa la consola del navegador para ver errores
- Verifica que el backend esté corriendo en `http://localhost:3000`

### "Invalid credentials" al hacer login
- Si tienes usuarios antiguos, ejecuta el script de migración
- Verifica que el email sea correcto
- Asegúrate de que la contraseña tenga al menos 6 caracteres

### El interceptor no agrega el token
- Verifica que el interceptor esté configurado en `app.config.ts`
- Asegúrate de que `AuthService` tenga el token guardado
- Revisa la consola de red del navegador (F12 > Network)

## 📝 Próximos Pasos Recomendados

1. **Agregar botón de logout:**
```typescript
logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
```

2. **Mostrar usuario actual en el header:**
```typescript
currentUser$ = this.authService.currentUser$;
```

3. **Implementar refresh tokens** (para sesiones más largas)

4. **Agregar recuperación de contraseña**

5. **Configurar CORS** en producción

## 📚 Documentación Completa

Lee `SECURITY_README.md` para información detallada sobre:
- Arquitectura del sistema
- Mejores prácticas de seguridad
- Ejemplos de código
- Configuración avanzada
- Troubleshooting completo

## ✨ ¡Listo!

Tu aplicación ahora tiene:
- 🔐 Autenticación JWT completa
- 🔒 Contraseñas cifradas con bcrypt
- 🛡️ Endpoints protegidos
- 🎫 Tokens automáticos en todas las peticiones
- 🚪 Rutas protegidas en el frontend

**¡Feliz desarrollo seguro!** 🎉
