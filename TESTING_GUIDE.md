# Testing Guide - Encuentros Application

This guide provides comprehensive instructions for testing the Encuentros application in both development and production (Docker) environments.

## Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker)
2. [Testing Checklist](#testing-checklist)
3. [Database Initialization](#database-initialization)
4. [Testing User Registration](#testing-user-registration)
5. [Testing Login](#testing-login)
6. [Testing Main Features](#testing-main-features)
7. [Troubleshooting](#troubleshooting)

## Quick Start with Docker

The application is designed to work out-of-the-box with Docker Compose. All database initialization happens automatically.

### Prerequisites
- Docker Desktop 4.x or higher
- Docker Engine 20.x or higher
- Docker Compose 2.x or higher

### Starting the Application

```bash
# Clone the repository
git clone https://github.com/AGV48/Encuentros
cd Encuentros

# Build and start all services
docker-compose up --build
```

### What Happens During Startup

1. **Database Container (Oracle XE)**:
   - Oracle Database starts (can take 2-3 minutes first time)
   - Accepts connections on port 1521
   - Creates XEPDB1 pluggable database

2. **Backend Container (NestJS)**:
   - Waits for Oracle to be ready (automatic retries)
   - Connects as SYSDBA to check if `ENCUENTROS_ADMIN` user exists
   - If user doesn't exist:
     - Creates `ENCUENTROS_ADMIN` user with password `admin`
     - Grants necessary permissions (CONNECT, RESOURCE, DBA)
   - Checks if database schema exists (looks for `USUARIOS` table)
   - If schema doesn't exist:
     - Automatically executes `/app/init-db/02-schema.sql`
     - Creates all tables, sequences, views, procedures, and packages
     - Inserts test data (one test user)
   - Starts NestJS application on port 3000

3. **Frontend Container (Angular + Nginx)**:
   - Serves the Angular SPA on port 80
   - Automatically detects API location

### Verification

Once all containers are running:

- **Frontend**: http://localhost/
- **Backend API**: http://localhost:3000/
- **API Documentation (Swagger)**: http://localhost:3000/api

## Testing Checklist

### Initial Setup
- [ ] All three containers start without errors
- [ ] Backend logs show successful database initialization
- [ ] Frontend is accessible at http://localhost/
- [ ] API documentation is accessible at http://localhost:3000/api

### Database Initialization
- [ ] User `ENCUENTROS_ADMIN` is created automatically
- [ ] All tables are created (USUARIOS, ENCUENTROS, etc.)
- [ ] All sequences are created
- [ ] All views are created
- [ ] All procedures and packages are created
- [ ] Test user is inserted (email: tomi@gmail.com)

### User Registration
- [ ] Can access registration page
- [ ] Form validation works (required fields)
- [ ] Email validation works
- [ ] Password requirements are enforced
- [ ] Successful registration redirects to login
- [ ] New user appears in database
- [ ] Password is properly hashed in database

### User Login
- [ ] Can access login page
- [ ] Can login with test user (tomi@gmail.com)
- [ ] Can login with newly registered user
- [ ] Invalid credentials show appropriate error
- [ ] Successful login redirects to home
- [ ] JWT token is stored in localStorage
- [ ] User data is stored in localStorage

### Main Features
- [ ] Home page displays correctly
- [ ] Can create a new encuentro
- [ ] Can view encuentros list
- [ ] Can add participants to encuentro
- [ ] Can create budget for encuentro
- [ ] Can create pockets for encuentro
- [ ] Can add contributions to pockets
- [ ] Can view financial summary
- [ ] Search functionality works
- [ ] Friend requests work
- [ ] Notifications work

## Database Initialization

### Automatic Initialization

The backend automatically initializes the database on startup:

1. **User Creation** (if not exists):
   ```sql
   CREATE USER ENCUENTROS_ADMIN IDENTIFIED BY admin;
   GRANT CONNECT, RESOURCE, DBA TO ENCUENTROS_ADMIN;
   ALTER USER ENCUENTROS_ADMIN QUOTA UNLIMITED ON USERS;
   ```

2. **Schema Creation** (if not exists):
   - Executes `/app/init-db/02-schema.sql`
   - Creates all database objects
   - Inserts test data

### Monitoring Initialization

Check backend logs to see initialization progress:

```bash
docker-compose logs backend
```

Expected log output:
```
🌱 [DB Init] Iniciando proceso de inicialización de Oracle...
⏳ [DB Init] Oracle aún no está listo (intento 1/30)...
✅ [DB Init] Oracle aceptó conexiones (intento 5)
📝 [DB Init] Creando usuario ENCUENTROS_ADMIN...
✅ [DB Init] Usuario ENCUENTROS_ADMIN creado
📝 [DB Init] Ejecutando script 02-schema.sql completo...
   [DB Init] 50/300 statements ejecutados...
   [DB Init] 100/300 statements ejecutados...
   [DB Init] Ejecutados: 280, Omitidos: 20, Total: 300
✅ [DB Init] Script 02-schema.sql ejecutado
```

### Manual Database Check

To verify database initialization manually:

```bash
# Connect to database container
docker exec -it encuentros_db bash

# Connect to Oracle
sqlplus ENCUENTROS_ADMIN/admin@XEPDB1

# Check tables
SELECT table_name FROM user_tables;

# Check test user
SELECT nombre, email FROM USUARIOS;
```

## Testing User Registration

### Test Case 1: Successful Registration

1. Navigate to http://localhost/
2. Click "Register" or "Crear cuenta"
3. Fill in the form:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@example.com
   - Contraseña: SecurePass123!
4. Click "Registrarse"
5. **Expected**: Redirected to login page with success message

### Test Case 2: Duplicate Email

1. Try to register with email that already exists (tomi@gmail.com)
2. **Expected**: Error message indicating email is already in use

### Test Case 3: Invalid Email Format

1. Try to register with invalid email (not@valid)
2. **Expected**: Form validation error

### Verify in Database

```sql
-- Connect as ENCUENTROS_ADMIN
SELECT id_usuario, nombre, apellido, email, fecha_registro 
FROM USUARIOS 
ORDER BY fecha_registro DESC;
```

## Testing Login

### Test Case 1: Login with Test User

1. Navigate to login page
2. Enter credentials:
   - Email: tomi@gmail.com
   - Password: 123456
3. Click "Iniciar sesión"
4. **Expected**: Redirected to home page, user data in localStorage

### Test Case 2: Login with Newly Registered User

1. Use credentials from registration test
2. **Expected**: Successful login

### Test Case 3: Invalid Credentials

1. Enter incorrect password
2. **Expected**: Error message, remain on login page

### Verify in Browser

Open DevTools Console:
```javascript
// Check if token exists
localStorage.getItem('access_token')

// Check if user exists
JSON.parse(localStorage.getItem('currentUser'))
```

## Testing Main Features

### Creating an Encuentro

1. Login as any user
2. Navigate to Home page
3. Click "Crear Encuentro" or "+"
4. Fill in the form:
   - Título: Reunión de Amigos
   - Descripción: Reunión mensual
   - Lugar: Casa de Juan
   - Fecha: Select a future date
5. Click "Crear"
6. **Expected**: New encuentro appears in list

### Managing Budget

1. Open an encuentro
2. Go to "Presupuesto" section
3. Add budget items:
   - Nombre: Comida
   - Monto: 50000
4. **Expected**: Budget total updates automatically

### Managing Pockets

1. Go to "Bolsillos" section
2. Create a new pocket
3. **Expected**: Pocket appears with 0 balance

### Adding Contributions

1. Go to "Aportes" section
2. Select a pocket
3. Enter contribution amount
4. Click "Aportar"
5. **Expected**: Pocket balance updates, contribution recorded

### Adding Participants

1. Go to encuentro details
2. Click "Agregar Participantes"
3. Select friends from list
4. **Expected**: Friend added as participant

## Troubleshooting

### Backend Won't Start

**Symptoms**: Backend container exits or restarts repeatedly

**Check**:
```bash
docker-compose logs backend
```

**Common Issues**:
- Oracle not ready yet: Wait 2-3 minutes for Oracle to fully start
- Connection refused: Check if db container is running: `docker ps`
- User creation failed: Check Oracle logs: `docker-compose logs db`

**Solution**:
```bash
# Restart backend after Oracle is ready
docker-compose restart backend
```

### Database Schema Not Created

**Symptoms**: Tables don't exist, app shows database errors

**Check**:
```bash
docker-compose logs backend | grep "DB Init"
```

**Solution**:
```bash
# Stop all containers
docker-compose down -v  # Warning: This removes all data

# Start fresh
docker-compose up --build
```

### Frontend Can't Connect to Backend

**Symptoms**: API calls fail with connection errors

**Check**:
1. Backend is running: http://localhost:3000/
2. Frontend environment detection:
   - Open browser console
   - Check Network tab for failed requests

**Solution**:
- Ensure both containers are running
- Check browser console for errors
- Verify EnvironmentService is correctly detecting API URL

### User Can't Login

**Symptoms**: Login fails with 401 or 500 error

**Check**:
1. User exists in database
2. Password is correct
3. Backend logs for errors

**Verify**:
```sql
-- Check if user exists
SELECT * FROM USUARIOS WHERE email = 'user@example.com';
```

**Common Issues**:
- User doesn't exist: Register first
- Password incorrect: Reset password or create new user
- Database connection issue: Check backend logs

### CORS Errors

**Symptoms**: Browser shows CORS errors in console

**Check**: Backend CORS configuration in `main.ts`

**Current Config**:
```typescript
app.enableCors({
  origin: ['http://localhost', 'http://localhost:4200', 'http://localhost:80'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

**Solution**: If accessing from different origin, add it to the list and rebuild backend.

## Performance Notes

### First Startup
- Oracle XE initialization: 2-3 minutes
- Backend initialization: 1-2 minutes (includes waiting for Oracle)
- Frontend build: 30-60 seconds
- **Total**: ~5 minutes for first startup

### Subsequent Startups
- All containers: 30-60 seconds
- Database schema check (fast): 2-3 seconds
- **Total**: ~1 minute

### Database Operations
- User registration: < 1 second
- Login: < 1 second
- Create encuentro: < 1 second
- Complex queries (with joins): 1-2 seconds

## Additional Resources

- **Backend API Docs**: http://localhost:3000/api
- **Main README**: [README.md](README.md)
- **Security Guide**: [SECURITY_README.md](SECURITY_README.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)

## Support

If you encounter issues not covered in this guide:

1. Check the logs: `docker-compose logs`
2. Review the TROUBLESHOOTING.md guide
3. Ensure Docker resources are sufficient (4GB RAM minimum)
4. Try a clean restart: `docker-compose down -v && docker-compose up --build`
