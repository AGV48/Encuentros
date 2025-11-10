import * as fs from 'fs';
import * as oracledb from 'oracledb';

const DEFAULT_HOST = 'db';
const DEFAULT_PORT = '1521';
const DEFAULT_SERVICE = 'XEPDB1';
const DEFAULT_APP_USER = 'ENCUENTROS_ADMIN';
const DEFAULT_APP_PASSWORD = 'admin';

type EnvRecord = Record<string, string | undefined>;
const envProvider = (globalThis as { process?: { env?: EnvRecord } }).process?.env ?? {};
const env = envProvider as EnvRecord;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function initializeDatabase(): Promise<void> {
  const host = env.DB_HOST || DEFAULT_HOST;
  const port = env.DB_PORT || DEFAULT_PORT;
  const service = env.DB_SERVICE_NAME || DEFAULT_SERVICE;
  const sysPassword = env.ORACLE_SYS_PASSWORD || 'admin';
  const appUser = env.DB_USERNAME || DEFAULT_APP_USER;
  const appPassword = env.DB_PASSWORD || DEFAULT_APP_PASSWORD;
  const manageUser = (env.DB_MANAGE_USER ?? 'true').toLowerCase() !== 'false';
  const connectString = `${host}:${port}/${service}`;

  console.log('🌱 [DB Init] Iniciando proceso de inicialización de Oracle...');

  // Esperar a que Oracle acepte conexiones
  await waitForOracle(connectString, sysPassword);

  const sysConnection = await oracledb.getConnection({
    user: 'SYS',
    password: sysPassword,
    connectString,
    privilege: oracledb.SYSDBA,
  });

  try {
    if (manageUser) {
      const userExists = await checkUserExists(sysConnection, appUser);

      if (!userExists) {
        console.log(`📝 [DB Init] Creando usuario ${appUser}...`);
        await sysConnection.execute(`CREATE USER ${appUser} IDENTIFIED BY ${appPassword}`);
        await sysConnection.execute(`GRANT CONNECT, RESOURCE, DBA TO ${appUser}`);
        await sysConnection.execute(`ALTER USER ${appUser} QUOTA UNLIMITED ON USERS`);
        console.log(`✅ [DB Init] Usuario ${appUser} creado`);
      } else {
        console.log(`✅ [DB Init] Usuario ${appUser} ya existe`);
      }
    } else {
      console.log(`ℹ️ [DB Init] Gestión de usuario deshabilitada. Se usará la cuenta configurada (${appUser}).`);
    }
  } finally {
    await sysConnection.close();
  }

  // Ejecutar schema si las tablas principales no existen
  await ensureSchema(connectString, appUser, appPassword);
}

async function waitForOracle(connectString: string, sysPassword: string): Promise<void> {
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const connection = await oracledb.getConnection({
        user: 'SYS',
        password: sysPassword,
        connectString,
        privilege: oracledb.SYSDBA,
      });
      await connection.close();
      console.log(`✅ [DB Init] Oracle aceptó conexiones (intento ${attempt})`);
      return;
    } catch (error: any) {
      console.log(`⏳ [DB Init] Oracle aún no está listo (intento ${attempt}/30): ${error.message}`);
      await sleep(4000);
    }
  }

  throw new Error('Oracle no respondió a tiempo');
}

async function checkUserExists(sysConnection: oracledb.Connection, username: string): Promise<boolean> {
  const result = await sysConnection.execute(
    `SELECT COUNT(*) AS CNT FROM dba_users WHERE username = :username`,
    {
      username,
    },
  );

  const raw = result.rows?.[0]?.[0] ?? 0;
  const exists = Number(raw) > 0;
  return exists;
}

async function ensureSchema(connectString: string, username: string, password: string): Promise<void> {
  const connection = await oracledb.getConnection({
    user: username,
    password,
    connectString,
  });

  try {
    const tableExists = await hasUsersTable(connection);
    if (tableExists) {
      console.log('✅ [DB Init] Esquema ya existe, no es necesario ejecutar 02-schema.sql');
      return;
    }

    const sqlFilePath = '/app/init-db/02-schema.sql';
    if (!fs.existsSync(sqlFilePath)) {
      console.log('⚠️ [DB Init] Archivo 02-schema.sql no encontrado, no se puede inicializar el esquema');
      return;
    }

    console.log('📝 [DB Init] Ejecutando script 02-schema.sql completo...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    const statements = splitSqlStatements(sqlContent);

    let executed = 0;
    for (const statement of statements) {
      try {
        if (!statement.trim()) continue;
        await connection.execute(statement, [], { autoCommit: false });
        executed++;
        if (executed % 50 === 0) {
          console.log(`   [DB Init] ${executed}/${statements.length} statements ejecutados...`);
        }
      } catch (error: any) {
        const message = error.message || '';
        if (
          message.includes('ORA-00955') ||
          message.includes('ORA-01408') ||
          message.includes('ORA-02260') ||
          message.includes('ORA-01430') ||
          message.includes('ORA-00001')
        ) {
          // Mensajes esperados cuando ya existe algo – ignoramos
          continue;
        }

        console.log(`⚠️ [DB Init] Error ejecutando statement: ${message}`);
      }
    }

    await connection.commit();
    console.log(`✅ [DB Init] Script 02-schema.sql ejecutado (${executed} statements)`);
  } finally {
    await connection.close();
  }
}

async function hasUsersTable(connection: oracledb.Connection): Promise<boolean> {
  try {
    const result = await connection.execute(`SELECT COUNT(*) AS CNT FROM user_tables WHERE table_name = 'USUARIOS'`);
    const raw = result.rows?.[0]?.[0] ?? 0;
    return Number(raw) > 0;
  } catch (error) {
    return false;
  }
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inPlSqlBlock = false;

  const lines = sql.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('PROMPT') || trimmed.startsWith('REM')) {
      continue;
    }

    if (/^(CREATE|CREATE OR REPLACE)\s+(PROCEDURE|FUNCTION|PACKAGE|TRIGGER)/i.test(trimmed)) {
      inPlSqlBlock = true;
    }

    current += `${line}\n`;

    if (inPlSqlBlock) {
      if (trimmed === '/') {
        statements.push(current.trim().replace(/\/$/, ''));
        current = '';
        inPlSqlBlock = false;
      }
    } else if (trimmed.endsWith(';')) {
      statements.push(current.trim().replace(/;$/, ''));
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}
