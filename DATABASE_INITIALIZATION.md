# Automated Database Initialization - Implementation Summary

This document describes the automated database initialization system implemented for the Encuentros application.

## Overview

The application now features **fully automated database initialization** that runs when the backend starts. No manual intervention is required - the database schema, procedures, and test data are all set up automatically.

## How It Works

### 1. Startup Sequence

When you run `docker-compose up --build`, the following happens:

```
┌─────────────────┐
│  Docker starts  │
│  3 containers   │
└────────┬────────┘
         │
         ├─► Database (Oracle XE)
         │   └─► Initializes Oracle (2-3 min)
         │
         ├─► Backend (NestJS)
         │   └─► Waits for Oracle
         │       └─► Runs initialization
         │           └─► Starts app
         │
         └─► Frontend (Angular)
             └─► Serves static files
```

### 2. Backend Initialization Process

The initialization is handled by `src/database/seeder.service.ts` and runs automatically before the NestJS application starts (called from `main.ts`).

#### Step-by-Step Process:

1. **Wait for Oracle to be Ready**
   ```typescript
   // Automatically retries connection every 4 seconds
   // Up to 30 attempts (2 minutes)
   await waitForOracle(connectString, sysPassword);
   ```

2. **Connect as SYSDBA**
   ```typescript
   const sysConnection = await oracledb.getConnection({
     user: 'SYS',
     password: sysPassword,
     connectString,
     privilege: oracledb.SYSDBA,
   });
   ```

3. **Check if Application User Exists**
   ```typescript
   const userExists = await checkUserExists(sysConnection, 'ENCUENTROS_ADMIN');
   ```

4. **Create User if Needed**
   ```typescript
   if (!userExists) {
     await sysConnection.execute(`CREATE USER ENCUENTROS_ADMIN IDENTIFIED BY admin`);
     await sysConnection.execute(`GRANT CONNECT, RESOURCE, DBA TO ENCUENTROS_ADMIN`);
     await sysConnection.execute(`ALTER USER ENCUENTROS_ADMIN QUOTA UNLIMITED ON USERS`);
   }
   ```

5. **Check if Schema Exists**
   ```typescript
   // Looks for the USUARIOS table
   const tableExists = await hasUsersTable(connection);
   ```

6. **Execute Schema Script if Needed**
   ```typescript
   if (!tableExists) {
     const sqlContent = fs.readFileSync('/app/init-db/02-schema.sql', 'utf8');
     const statements = splitSqlStatements(sqlContent);
     
     for (const statement of statements) {
       await connection.execute(statement);
     }
   }
   ```

### 3. SQL Statement Parsing

The system intelligently parses the SQL file to handle:

- **Regular SQL statements** (CREATE TABLE, CREATE SEQUENCE, etc.)
- **PL/SQL blocks** (PROCEDURE, FUNCTION, PACKAGE, PACKAGE BODY, TRIGGER)
- **Comments** (-- and REM)
- **Multi-line statements**

#### Parsing Logic:

```typescript
function splitSqlStatements(sql: string): string[] {
  // Detects PL/SQL blocks by looking for:
  // CREATE [OR REPLACE] [EDITIONABLE] PROCEDURE|FUNCTION|PACKAGE|PACKAGE BODY|TRIGGER
  
  // PL/SQL blocks end with '/' on its own line
  // Regular statements end with ';'
  
  // Skips comment lines starting with '--', 'PROMPT', or 'REM'
}
```

### 4. Error Handling

The system gracefully handles expected errors:

```typescript
// These Oracle errors are ignored (object already exists):
- ORA-00955: name is already used by an existing object
- ORA-01408: such column list already indexed
- ORA-02260: table can have only one primary key
- ORA-01430: column being added already exists
- ORA-00001: unique constraint violated
- ORA-02264: name already used by an existing constraint
```

Any unexpected errors are logged with:
- Statement number
- Error message
- Statement preview (first 100 characters)

## Configuration

### Environment Variables

The backend uses these environment variables (set in `docker-compose.yml`):

```yaml
DB_HOST: db                    # Database hostname
DB_PORT: 1521                  # Database port
DB_USERNAME: ENCUENTROS_ADMIN  # Application user
DB_PASSWORD: admin             # Application password
DB_SERVICE_NAME: XEPDB1        # Oracle service name
ORACLE_SYS_PASSWORD: admin     # SYS password for initial setup
```

### Optional Configuration

You can disable automatic user management:

```yaml
DB_MANAGE_USER: "false"  # Set to false to skip user creation
```

This is useful if you're connecting to an existing database where the user already exists.

## File Structure

```
encuentros-back/
├── src/
│   ├── main.ts                  # Calls initializeDatabase()
│   └── database/
│       └── seeder.service.ts    # Database initialization logic
│
init-db/                         # Mounted as volume
├── 02-schema.sql                # Complete database schema
└── (other files)                # Not used by automated system
```

## What Gets Created

### Tables (13)
- USUARIOS
- ENCUENTROS
- PARTICIPANTES_ENCUENTRO
- PRESUPUESTOS
- ITEMS_PRESUPUESTO
- BOLSILLOS
- APORTES
- GASTOS
- MENSAJES
- AMISTADES
- RELACIONES_AMISTADES
- SOLICITUDES_AMISTAD
- RECORDATORIOS
- migrations (TypeORM)
- typeorm_metadata (TypeORM)

### Sequences (13)
- SEQ_USUARIOS
- SEQ_ENCUENTROS
- SEQ_PARTICIPANTES
- SEQ_PRESUPUESTOS
- SEQ_ITEMS_PRESUPUESTO
- SEQ_BOLSILLOS
- SEQ_APORTES
- SEQ_GASTOS
- SEQ_MENSAJES
- SEQ_AMISTADES
- SEQ_RELACIONES_AMISTADES
- SEQ_SOLICITUDES_AMISTAD
- SEQ_RECORDATORIOS

### Views (4)
- VISTAPARTICIPANTESAPORTES
- VISTAPRESUPUESTOSGASTOS
- V_ENCUENTRO_RESUMEN
- V_PARTICIPANTES_ENCUENTRO

### Stored Procedures (5)
- ACEPTAR_SOLICITUD_AMISTAD
- AGREGAR_APORTE
- AGREGAR_GASTO
- AGREGAR_ITEM_PRESUPUESTO
- AGREGAR_PARTICIPANTE_ENCUENTRO
- CREAR_ENCUENTRO
- CREAR_SOLICITUD_AMISTAD
- ESTADISTICAS_EVENTOS_FINANCIEROS

### Packages (1)
- PKG_CENTRAL (with package body)

### Test Data
- 1 user: tomi@gmail.com (password: 123456, hashed with bcrypt)

## Idempotency

The initialization is **idempotent**, meaning:
- Safe to run multiple times
- Won't fail if objects already exist
- Won't duplicate data
- Won't break existing data

### How It's Achieved:

1. **User Check**: Queries `dba_users` before creating user
2. **Schema Check**: Queries `user_tables` before running schema script
3. **Error Handling**: Ignores "already exists" errors
4. **Transaction Safety**: Uses `autoCommit: false` with explicit commit

## Monitoring

### Successful Initialization Logs:

```
🌱 [DB Init] Iniciando proceso de inicialización de Oracle...
⏳ [DB Init] Oracle aún no está listo (intento 1/30): ORA-12514...
⏳ [DB Init] Oracle aún no está listo (intento 2/30): ORA-12514...
✅ [DB Init] Oracle aceptó conexiones (intento 5)
📝 [DB Init] Creando usuario ENCUENTROS_ADMIN...
✅ [DB Init] Usuario ENCUENTROS_ADMIN creado
📝 [DB Init] Ejecutando script 02-schema.sql completo...
   [DB Init] 50/300 statements ejecutados...
   [DB Init] 100/300 statements ejecutados...
   [DB Init] 150/300 statements ejecutados...
   [DB Init] 200/300 statements ejecutados...
   [DB Init] 250/300 statements ejecutados...
   [DB Init] Ejecutados: 280, Omitidos: 20, Total: 300
✅ [DB Init] Script 02-schema.sql ejecutado (280 statements)
```

### Subsequent Startups (Schema Already Exists):

```
🌱 [DB Init] Iniciando proceso de inicialización de Oracle...
✅ [DB Init] Oracle aceptó conexiones (intento 1)
✅ [DB Init] Usuario ENCUENTROS_ADMIN ya existe
✅ [DB Init] Esquema ya existe, no es necesario ejecutar 02-schema.sql
```

## Frontend Environment Detection

The frontend automatically detects the environment and configures API URLs:

### EnvironmentService Logic:

```typescript
const hostname = window.location.hostname;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Development: http://localhost:3000
  this.apiUrl = 'http://localhost:3000';
} else {
  // Production (Docker): http://{hostname}:3000
  this.apiUrl = `http://${hostname}:3000`;
}
```

### How Components Use It:

```typescript
export class MyComponent {
  http = inject(HttpClient);
  env = inject(EnvironmentService);
  apiUrl = this.env.getApiUrl();
  
  loadData() {
    this.http.get(`${this.apiUrl}/endpoint`).subscribe(...);
  }
}
```

## Benefits

### For Development:
- ✅ No manual database setup required
- ✅ Consistent environment for all developers
- ✅ Easy to reset: `docker-compose down -v && docker-compose up --build`
- ✅ Works on any machine with Docker

### For Production:
- ✅ Automated deployment
- ✅ No SQL scripts to run manually
- ✅ Automatic schema updates possible
- ✅ Consistent behavior across environments

### For Testing:
- ✅ Fresh database on every build
- ✅ Predictable test data
- ✅ Fast iteration (schema check is quick)
- ✅ No drift between environments

## Troubleshooting

### "Oracle not ready" messages for too long

**Cause**: Oracle XE takes time to initialize on first start

**Solution**: Wait up to 5 minutes on first startup. Subsequent starts are faster.

### "Schema execution failed"

**Cause**: Syntax error in 02-schema.sql or Oracle issue

**Solution**: 
1. Check backend logs for specific error
2. Verify SQL syntax in 02-schema.sql
3. Try manual execution to identify the problematic statement

### Schema not updated after changes to 02-schema.sql

**Cause**: Schema check sees existing USUARIOS table and skips

**Solution**:
```bash
# Option 1: Destroy volumes and rebuild
docker-compose down -v
docker-compose up --build

# Option 2: Drop user manually and restart backend
docker exec -it encuentros_db sqlplus sys/admin@XEPDB1 as sysdba
SQL> DROP USER ENCUENTROS_ADMIN CASCADE;
SQL> exit
docker-compose restart backend
```

## Security Considerations

### Credentials in docker-compose.yml

⚠️ **Warning**: The default credentials (admin/admin) are for development only.

For production:
1. Use environment files not committed to git
2. Use Docker secrets
3. Rotate passwords regularly
4. Restrict database access

### SYSDBA Access

The backend requires SYSDBA access temporarily to create the application user. After creation, it only uses the application user (ENCUENTROS_ADMIN).

### Password Hashing

User passwords in the database are hashed with bcrypt (salt rounds: 10):
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

## Future Enhancements

Possible improvements:

1. **Migration System**: Track schema versions and apply incremental changes
2. **Seed Data Options**: Different data sets for dev/test/prod
3. **Health Checks**: Expose endpoint to verify database setup
4. **Rollback Support**: Ability to undo schema changes
5. **Multi-tenancy**: Support for multiple application databases

## Conclusion

The automated initialization system ensures that:
- ✅ Database is always in a consistent state
- ✅ No manual steps are required
- ✅ Development and deployment are simplified
- ✅ The application is truly "docker-compose up and go"

All of this happens transparently when you start the application - just run `docker-compose up --build` and everything is ready to use!
