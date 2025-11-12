pipeline {
    agent any

    environment {
        // DockerHub credentials (configurar en Jenkins Credentials)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'tomasra98'
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/encuentros-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/encuentros-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Configuración de Oracle Database
        ORACLE_CONTAINER = 'encuentros_db_temp'
        ORACLE_PASSWORD = 'admin'
        ORACLE_USER = 'ENCUENTROS_ADMIN'
        ORACLE_DATABASE = 'XEPDB1'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Clonando el repositorio...'
                checkout scm
            }
        }

        stage('Pull Oracle Image') {
            steps {
                echo '� Descargando imagen de Oracle Database...'
                script {
                    if (isUnix()) {
                        sh 'docker pull gvenzl/oracle-xe:21-slim'
                    } else {
                        bat 'docker pull gvenzl/oracle-xe:21-slim'
                    }
                }
            }
        }

        stage('Initialize Database') {
            steps {
                echo '🗄️ Inicializando base de datos Oracle...'
                script {
                    try {
                        if (isUnix()) {
                            // Para Linux/Unix
                            sh """
                                # Iniciar contenedor Oracle temporal
                                docker run -d --name ${ORACLE_CONTAINER} \
                                    -e ORACLE_PASSWORD=${ORACLE_PASSWORD} \
                                    -e ORACLE_DATABASE=${ORACLE_DATABASE} \
                                    -e APP_USER=${ORACLE_USER} \
                                    -e APP_USER_PASSWORD=${ORACLE_PASSWORD} \
                                    -p 1521:1521 \
                                    gvenzl/oracle-xe:21-slim

                                # Esperar a que Oracle esté listo
                                echo "⏳ Esperando a que Oracle esté listo..."
                                sleep 60

                                # Copiar scripts SQL al contenedor
                                docker cp init-db/01-create-user.sql ${ORACLE_CONTAINER}:/tmp/
                                docker cp init-db/02-schema.sql ${ORACLE_CONTAINER}:/tmp/

                                # Ejecutar script de creación de usuario
                                echo "👤 Creando usuario ${ORACLE_USER}..."
                                docker exec ${ORACLE_CONTAINER} sqlplus -s sys/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} as sysdba @/tmp/01-create-user.sql

                                # Ejecutar script de schema
                                echo "📊 Creando esquema de base de datos..."
                                docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} @/tmp/02-schema.sql

                                echo "✅ Base de datos inicializada correctamente"
                            """
                        } else {
                            // Para Windows
                            bat """
                                REM Iniciar contenedor Oracle temporal
                                docker run -d --name ${ORACLE_CONTAINER} ^
                                    -e ORACLE_PASSWORD=${ORACLE_PASSWORD} ^
                                    -e ORACLE_DATABASE=${ORACLE_DATABASE} ^
                                    -e APP_USER=${ORACLE_USER} ^
                                    -e APP_USER_PASSWORD=${ORACLE_PASSWORD} ^
                                    -p 1521:1521 ^
                                    gvenzl/oracle-xe:21-slim

                                REM Esperar a que Oracle esté listo
                                echo ⏳ Esperando a que Oracle esté listo...
                                timeout /t 60 /nobreak

                                REM Copiar scripts SQL al contenedor
                                docker cp init-db/01-create-user.sql ${ORACLE_CONTAINER}:/tmp/
                                docker cp init-db/02-schema.sql ${ORACLE_CONTAINER}:/tmp/

                                REM Ejecutar script de creación de usuario
                                echo 👤 Creando usuario ${ORACLE_USER}...
                                docker exec ${ORACLE_CONTAINER} sqlplus -s sys/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} as sysdba @/tmp/01-create-user.sql

                                REM Ejecutar script de schema
                                echo 📊 Creando esquema de base de datos...
                                docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} @/tmp/02-schema.sql

                                echo ✅ Base de datos inicializada correctamente
                            """
                        }
                    } catch (Exception e) {
                        echo "⚠️ Error al inicializar la base de datos: ${e.message}"
                        throw e
                    }
                }
            }
        }

        stage('Verify Database') {
            steps {
                echo '✔️ Verificando base de datos...'
                script {
                    if (isUnix()) {
                        sh """
                            # Verificar que las tablas fueron creadas
                            docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} <<EOF
SELECT COUNT(*) AS "Total Tables" FROM user_tables;
EXIT;
EOF
                        """
                    } else {
                        bat """
                            docker exec ${ORACLE_CONTAINER} sqlplus -s ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost:1521/${ORACLE_DATABASE} @- <<EOF
SELECT COUNT(*) AS "Total Tables" FROM user_tables;
EXIT;
EOF
                        """
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo '🔨 Compilando el backend (NestJS)...'
                dir('encuentros-back') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci'
                            sh 'npm run build'
                        } else {
                            bat 'npm ci'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '🔨 Compilando el frontend (Angular)...'
                dir('encuentros-front') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci'
                            sh 'npm run build -- --configuration=production'
                        } else {
                            bat 'npm ci'
                            bat 'npm run build -- --configuration=production'
                        }
                    }
                }
            }
        }

        stage('Unit Tests Backend') {
            steps {
                echo '🧪 Ejecutando pruebas unitarias del backend...'
                dir('encuentros-back') {
                    script {
                        if (isUnix()) {
                            sh 'npm test -- --passWithNoTests'
                        } else {
                            bat 'npm test -- --passWithNoTests'
                        }
                    }
                }
            }
        }

        stage('Unit Tests Frontend') {
            steps {
                echo '🧪 Ejecutando pruebas unitarias del frontend...'
                dir('encuentros-front') {
                    script {
                        if (isUnix()) {
                            sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                        } else {
                            bat 'npm test -- --watch=false --browsers=ChromeHeadless'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Construyendo imagen Docker del backend...'
                        dir('encuentros-back') {
                            script {
                                docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}")
                                docker.build("${BACKEND_IMAGE}:latest")
                            }
                        }
                    }
                }

                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Construyendo imagen Docker del frontend...'
                        dir('encuentros-front') {
                            script {
                                docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}")
                                docker.build("${FRONTEND_IMAGE}:latest")
                            }
                        }
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo '📤 Publicando imágenes en DockerHub...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        // Push backend images
                        docker.image("${BACKEND_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()

                        // Push frontend images
                        docker.image("${FRONTEND_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ ¡Pipeline ejecutado exitosamente!'
            echo "📦 Imágenes publicadas:"
            echo "   - ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "   - ${BACKEND_IMAGE}:latest"
            echo "   - ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo "   - ${FRONTEND_IMAGE}:latest"
            echo "🗄️ Base de datos inicializada y verificada"
        }
        failure {
            echo '❌ El pipeline ha fallado. Revisa los logs.'
        }
        always {
            echo '🔚 Limpieza final...'
            script {
                try {
                    // Asegurar que el contenedor Oracle se elimine siempre
                    if (isUnix()) {
                        sh "docker stop ${ORACLE_CONTAINER} || true"
                        sh "docker rm ${ORACLE_CONTAINER} || true"
                    } else {
                        bat "docker stop ${ORACLE_CONTAINER} || exit 0"
                        bat "docker rm ${ORACLE_CONTAINER} || exit 0"
                    }
                } catch (Exception e) {
                    echo "Contenedor Oracle ya fue eliminado"
                }
            }
            cleanWs()
        }
    }
}
