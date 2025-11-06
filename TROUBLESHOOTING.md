# 🔧 Solución de Problemas de Login y CurrentUser

## ✅ Cambios Realizados

### 1. **UsersModule - Export de UsersService**
- ✅ Exportado `UsersService` para que esté disponible en `AuthModule`
- **Ubicación**: `encuentros-back/src/users/users.module.ts`

### 2. **AuthService - Compatibilidad con Código Existente**
- ✅ Guarda el usuario en `localStorage` con dos claves:
  - `currentUser` (nueva clave para el sistema JWT)
  - `user` (clave legacy para compatibilidad)
- ✅ Guarda `isLogged: 'true'` para compatibilidad
- ✅ Lee usuario desde ambas claves al iniciar

### 3. **Login Component - Mejor Manejo de Navegación**
- ✅ Agrega logs para debugging
- ✅ Navega después de cerrar el alert de éxito
- ✅ Muestra nombre del usuario en el mensaje

### 4. **AuthGuard - Logs de Debugging**
- ✅ Logs para verificar autenticación
- ✅ Redirige a '/' en lugar de '/login'

### 5. **Account Component - Logout Mejorado**
- ✅ Usa `AuthService.logout()` en lugar de localStorage directo
- ✅ Limpia todos los datos de sesión correctamente

## 🧪 Pasos para Probar

### 1. **Reiniciar Backend**
```powershell
cd encuentros-back
# Detener el servidor (Ctrl+C)
npm run start:dev
```

### 2. **Reiniciar Frontend**
```powershell
cd encuentros-front
# Detener el servidor (Ctrl+C)
npm start
```

### 3. **Limpiar localStorage (Importante)**
Abre la consola del navegador (F12) y ejecuta:
```javascript
localStorage.clear();
location.reload();
```

### 4. **Probar Registro**
1. Ve a `http://localhost:4200/sign-up`
2. Completa el formulario
3. Verifica en la consola que se imprima:
   - "Login exitoso: {user, access_token}"
   - "Token guardado: ey..."
   - "Usuario guardado: {...}"
4. Verifica que redirija a `/home`

### 5. **Probar Login**
1. Cierra sesión o limpia localStorage
2. Ve a `http://localhost:4200`
3. Ingresa email y contraseña
4. Verifica en la consola:
   - "Login exitoso: {user, access_token}"
   - "Token guardado: ey..."
   - "Usuario guardado: {...}"
   - "AuthGuard - isAuthenticated: true"
5. Verifica que redirija a `/home`

### 6. **Verificar localStorage**
En la consola del navegador:
```javascript
// Debe mostrar el token
console.log(localStorage.getItem('access_token'));

// Debe mostrar el usuario (ambas claves)
console.log(localStorage.getItem('currentUser'));
console.log(localStorage.getItem('user'));

// Debe ser 'true'
console.log(localStorage.getItem('isLogged'));
```

### 7. **Probar Acceso Directo a Ruta Protegida**
1. Con sesión iniciada, ve directamente a: `http://localhost:4200/home`
2. Verifica en la consola:
   - "AuthGuard - isAuthenticated: true"
   - "AuthGuard - Token: ey..."
   - "AuthGuard - CurrentUser: {id, nombre, email, ...}"
3. Debería permitir el acceso

### 8. **Probar Sin Autenticación**
1. Limpia localStorage: `localStorage.clear()`
2. Intenta ir a: `http://localhost:4200/home`
3. Verifica en la consola:
   - "AuthGuard - isAuthenticated: false"
   - "AuthGuard - Redirigiendo a login"
4. Debería redirigir a la página de login

## 🐛 Si Sigue Sin Funcionar

### Problema: "No entra después del login"

**Verificar:**
```javascript
// En la consola después del login
localStorage.getItem('access_token')  // ¿Devuelve un token?
localStorage.getItem('currentUser')   // ¿Devuelve un objeto JSON?
```

**Si no hay token:**
- Revisa la consola de red (F12 > Network)
- Busca la petición a `/auth/login`
- Verifica que la respuesta incluya `access_token`

**Si hay token pero no entra:**
- Verifica que el guard esté aplicado correctamente
- Mira los logs del AuthGuard en la consola
- Intenta sin el guard temporalmente

### Problema: "No carga el usuario en componentes"

**Verificar:**
```javascript
// Debe devolver el usuario
localStorage.getItem('user')
localStorage.getItem('currentUser')
```

**Usar AuthService en componentes:**
```typescript
// Opción 1: Obtener usuario actual
const user = this.authService.getCurrentUser();

// Opción 2: Suscribirse a cambios
this.authService.currentUser$.subscribe(user => {
  if (user) {
    console.log('Usuario actual:', user);
    this.name = user.nombre;
    this.email = user.email;
  }
});
```

### Problema: "401 Unauthorized en peticiones"

**Verificar que el token se envíe:**
1. Abre F12 > Network
2. Haz una petición a cualquier endpoint protegido
3. Click en la petición
4. Ve a "Headers"
5. Busca: `Authorization: Bearer ey...`

**Si no aparece el header:**
- Verifica que `authInterceptor` esté en `app.config.ts`
- Verifica que `AuthService.getToken()` devuelva el token

## 📝 Cambios en localStorage

### Antes (código legacy)
```javascript
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('isLogged', 'true');
```

### Ahora (compatible)
```javascript
localStorage.setItem('access_token', token);
localStorage.setItem('currentUser', JSON.stringify(user));
localStorage.setItem('user', JSON.stringify(user));  // ← Compatibilidad
localStorage.setItem('isLogged', 'true');            // ← Compatibilidad
```

## ✨ Resultado Esperado

Después de estos cambios:
- ✅ El registro funciona y guarda token + usuario
- ✅ El login funciona y guarda token + usuario
- ✅ El guard permite acceso con token válido
- ✅ El guard bloquea acceso sin token
- ✅ Los componentes pueden acceder al usuario desde localStorage
- ✅ Los componentes pueden usar AuthService para obtener el usuario
- ✅ El token se envía automáticamente en todas las peticiones HTTP
- ✅ El logout limpia correctamente toda la sesión

## 🎯 Próximo Paso

Si todo funciona, puedes empezar a migrar los componentes para usar `AuthService`:

```typescript
// Antes
const stored = localStorage.getItem('user');
const user = JSON.parse(stored);

// Después (recomendado)
const user = this.authService.getCurrentUser();
// O mejor aún:
this.authService.currentUser$.subscribe(user => {
  // Reacciona automáticamente a cambios
});
```
