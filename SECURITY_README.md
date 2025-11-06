# Sistema de Seguridad - Encuentros App

## 🔐 Descripción General

Se ha implementado un sistema completo de autenticación y autorización usando **JWT (JSON Web Tokens)** y **bcrypt** para el cifrado de contraseñas.

## 📋 Características Implementadas

### Backend (NestJS)

#### 1. **Módulo de Autenticación (`/auth`)**
- **POST /auth/register**: Registrar nuevo usuario
  - Valida que el email no esté registrado
  - Cifra la contraseña con bcrypt (salt rounds: 10)
  - Genera token JWT válido por 24 horas
  - Retorna usuario y token de acceso

- **POST /auth/login**: Iniciar sesión
  - Valida credenciales
  - Compara contraseña con bcrypt
  - Genera token JWT
  - Retorna usuario (sin contraseña) y token

- **GET /auth/profile**: Obtener perfil del usuario autenticado
  - Requiere token JWT válido
  - Retorna información del usuario actual

- **POST /auth/validate**: Validar token
  - Verifica si el token es válido
  - Retorna estado de validación y usuario

#### 2. **Cifrado de Contraseñas**
- Todas las contraseñas se cifran con **bcrypt** antes de guardarse
- Salt rounds: 10 (recomendado para balance seguridad/rendimiento)
- Las contraseñas nunca se almacenan en texto plano
- Al actualizar contraseñas, se verifica la anterior antes de cambiar

#### 3. **Protección de Endpoints**
Todos los controladores principales están protegidos con `@UseGuards(JwtAuthGuard)`:
- `/users/*` - Gestión de usuarios
- `/encuentro/*` - Encuentros
- `/chat/*` - Chats
- `/aporte/*` - Aportes
- `/bolsillo/*` - Bolsillos
- `/presupuesto/*` - Presupuestos
- `/participantes-encuentro/*` - Participantes

#### 4. **Configuración JWT**
```typescript
// Secreto: puede configurarse con variable de entorno JWT_SECRET
secret: process.env.JWT_SECRET || 'encuentros_secret_key_2025'
expiresIn: '24h' // Token válido por 24 horas
```

### Frontend (Angular)

#### 1. **AuthService** (`app/services/auth.service.ts`)
Servicio centralizado para gestión de autenticación:
- `register()`: Registrar nuevo usuario
- `login()`: Iniciar sesión
- `logout()`: Cerrar sesión
- `getToken()`: Obtener token actual
- `isAuthenticated()`: Verificar si hay sesión activa
- `getCurrentUser()`: Obtener usuario actual
- `validateToken()`: Validar token en el servidor

**Almacenamiento:**
- Token guardado en `localStorage` como `access_token`
- Usuario guardado en `localStorage` como `currentUser`
- Observable `currentUser$` para suscribirse a cambios de usuario

#### 2. **Auth Interceptor** (`app/interceptors/auth.interceptor.ts`)
Interceptor HTTP que automáticamente:
- Agrega el header `Authorization: Bearer {token}` a todas las peticiones HTTP
- Funciona de forma transparente sin modificar componentes existentes

#### 3. **Auth Guard** (`app/guards/auth.guard.ts`)
Guard de ruta para proteger páginas que requieren autenticación:
```typescript
// Ejemplo de uso en routes:
{
  path: 'home',
  component: Home,
  canActivate: [authGuard]
}
```

#### 4. **Componentes Actualizados**
- **Login**: Usa `AuthService.login()`
- **Sign Up**: Usa `AuthService.register()`
- Ambos redirigen a `/home` tras autenticación exitosa

## 🚀 Cómo Usar

### Flujo de Registro
```typescript
// En cualquier componente
constructor(private authService: AuthService) {}

registrar() {
  this.authService.register(
    'Juan',
    'juan@email.com',
    'password123',
    'Pérez'
  ).subscribe({
    next: (response) => {
      console.log('Usuario registrado:', response.user);
      // Token se guarda automáticamente
      // Redirigir a home o dashboard
    },
    error: (err) => {
      console.error('Error:', err.error.message);
    }
  });
}
```

### Flujo de Login
```typescript
login() {
  this.authService.login('juan@email.com', 'password123')
    .subscribe({
      next: (response) => {
        console.log('Login exitoso:', response.user);
        // Token se guarda automáticamente
      },
      error: (err) => {
        console.error('Credenciales inválidas');
      }
    });
}
```

### Obtener Usuario Actual
```typescript
// Opción 1: Sincrónico
const user = this.authService.getCurrentUser();

// Opción 2: Observable (recomendado para templates)
this.authService.currentUser$.subscribe(user => {
  console.log('Usuario actual:', user);
});
```

### Cerrar Sesión
```typescript
logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
```

### Proteger Rutas
```typescript
// En app.routes.ts
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  // ... más rutas protegidas
];
```

## 🔧 Configuración de Variables de Entorno

### Backend
Crear archivo `.env` en `encuentros-back/`:
```env
JWT_SECRET=tu_clave_secreta_super_segura_aqui
PORT=3000
```

### Frontend
Si el backend está en un servidor diferente, actualizar en `auth.service.ts`:
```typescript
private apiUrl = 'https://tu-servidor.com/auth';
```

## 📦 Dependencias Instaladas

### Backend
```json
{
  "@nestjs/jwt": "^11.x",
  "@nestjs/passport": "^11.x",
  "passport": "^0.x",
  "passport-jwt": "^4.x",
  "bcrypt": "^5.x",
  "@types/passport-jwt": "^4.x",
  "@types/bcrypt": "^5.x"
}
```

### Frontend
No se requieren dependencias adicionales (usa APIs nativas de Angular).

## ⚠️ Consideraciones de Seguridad

1. **Token en localStorage**: Los tokens se guardan en localStorage. Para mayor seguridad en producción, considera usar httpOnly cookies.

2. **HTTPS**: En producción, SIEMPRE usa HTTPS para proteger los tokens en tránsito.

3. **Secreto JWT**: Cambia el secreto por defecto usando una variable de entorno segura.

4. **Expiración de Tokens**: Los tokens expiran en 24h. Ajusta según tus necesidades.

5. **Refresh Tokens**: Para sesiones más largas, considera implementar refresh tokens.

6. **CORS**: Configura CORS apropiadamente en el backend para permitir solo dominios confiables.

## 🔄 Migración de Usuarios Existentes

Si ya tienes usuarios con contraseñas en texto plano en la base de datos, necesitas:

1. Crear una migración para cifrar contraseñas existentes:
```typescript
// Ejemplo conceptual - ajustar según tu caso
import * as bcrypt from 'bcrypt';

async migratePasswords() {
  const users = await this.userRepository.find();
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.contrasena, 10);
    await this.userRepository.update(user.id, { contrasena: hashedPassword });
  }
}
```

2. O solicitar a usuarios que restablezcan sus contraseñas.

## 📝 Pruebas

### Probar Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@test.com",
    "contrasena": "password123"
  }'
```

### Probar Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "contrasena": "password123"
  }'
```

### Probar Endpoint Protegido
```bash
curl -X GET http://localhost:3000/encuentro \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🐛 Troubleshooting

### Error: "Unauthorized"
- Verifica que el token esté presente en el header
- Verifica que el token no haya expirado
- Verifica que el secreto JWT sea el mismo en toda la aplicación

### Error: "User not found"
- Verifica que el usuario exista en la base de datos
- Verifica que el ID en el payload del token sea correcto

### Error: "Invalid credentials"
- Verifica que el email sea correcto
- Verifica que la contraseña sea correcta
- Si migras de texto plano a bcrypt, actualiza las contraseñas existentes

## 📚 Recursos Adicionales

- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [bcrypt - npm](https://www.npmjs.com/package/bcrypt)
- [Angular HTTP Interceptors](https://angular.io/guide/http-interceptor-use-cases)

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025
