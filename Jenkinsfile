pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USER = 'joshhd01'
        BACKEND_IMAGE = "${DOCKERHUB_USER}/encuentros-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/encuentros-frontend"
        DATABASE_IMAGE = "${DOCKERHUB_USER}/encuentros-database"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('encuentros-back') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('encuentros-front') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('encuentros-back') {
                            sh 'npm test -- --coverage --watchAll=false'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('encuentros-front') {
                            sh 'npm test -- --watch=false --browsers=ChromeHeadless'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('encuentros-back') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('encuentros-front') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }
                stage('Build Database Image') {
                    steps {
                        dir('database') {
                            sh "docker build -t ${DATABASE_IMAGE}:${IMAGE_TAG} -t ${DATABASE_IMAGE}:latest ."
                        }
                    }
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
                
                sh "docker push ${DATABASE_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DATABASE_IMAGE}:latest"
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo 'Pipeline ejecutado exitosamente!'
            echo "Imágenes publicadas:"
            echo "- ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "- ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo "- ${DATABASE_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline falló. Revisa los logs.'
        }
    }
}
