# Script de Despliegue de Encuentros en Kubernetes
# Ejecutar con: .\deploy-k8s.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Despliegue de Encuentros en K8s   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que kubectl esté instalado
Write-Host "🔍 Verificando kubectl..." -ForegroundColor Yellow
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl no está instalado. Por favor, instálalo primero." -ForegroundColor Red
    exit 1
}
Write-Host "✅ kubectl encontrado" -ForegroundColor Green

# Verificar que minikube esté instalado
Write-Host "🔍 Verificando minikube..." -ForegroundColor Yellow
if (!(Get-Command minikube -ErrorAction SilentlyContinue)) {
    Write-Host "❌ minikube no está instalado. Por favor, instálalo primero." -ForegroundColor Red
    exit 1
}
Write-Host "✅ minikube encontrado" -ForegroundColor Green

# Verificar que minikube esté corriendo
Write-Host ""
Write-Host "🔍 Verificando estado de minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Minikube no está corriendo. ¿Deseas iniciarlo? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host "🚀 Iniciando minikube..." -ForegroundColor Cyan
        minikube start --driver=docker --cpus=4 --memory=4096 --disk-size=20g
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al iniciar minikube" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Minikube iniciado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Minikube debe estar corriendo para continuar" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Minikube está corriendo" -ForegroundColor Green
}

# Aplicar manifiestos
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Aplicando Manifiestos de K8s      " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📦 1. Creando namespace..." -ForegroundColor Yellow
kubectl apply -f ./kube/namespace.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear namespace" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Namespace creado" -ForegroundColor Green

Write-Host ""
Write-Host "🔐 2. Creando secrets..." -ForegroundColor Yellow
kubectl apply -f ./kube/secret.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear secrets" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Secrets creados" -ForegroundColor Green

Write-Host ""
Write-Host "⚙️  3. Creando configmaps..." -ForegroundColor Yellow
kubectl apply -f ./kube/configmap.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear configmaps" -ForegroundColor Red
    exit 1
}
Write-Host "✅ ConfigMaps creados" -ForegroundColor Green

Write-Host ""
Write-Host "💾 4. Creando PersistentVolumeClaims..." -ForegroundColor Yellow
kubectl apply -f ./kube/database-pvc.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear PVCs" -ForegroundColor Red
    exit 1
}
Write-Host "✅ PVCs creados" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️  5. Desplegando base de datos..." -ForegroundColor Yellow
kubectl apply -f ./kube/database-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar base de datos" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Base de datos desplegada" -ForegroundColor Green

Write-Host ""
Write-Host "⏳ Esperando a que la base de datos esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
kubectl wait --for=condition=ready pod -l component=database -n encuentros --timeout=120s
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  La base de datos está tardando más de lo esperado" -ForegroundColor Yellow
} else {
    Write-Host "✅ Base de datos lista" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 6. Desplegando backend..." -ForegroundColor Yellow
kubectl apply -f ./kube/backend-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend desplegado" -ForegroundColor Green

Write-Host ""
Write-Host "🎨 7. Desplegando frontend..." -ForegroundColor Yellow
kubectl apply -f ./kube/frontend-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend desplegado" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 8. Creando servicios..." -ForegroundColor Yellow
kubectl apply -f ./kube/service.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear servicios" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Servicios creados" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  ¿Deseas desplegar componentes de observabilidad? (Loki, Prometheus, Grafana) (S/N)" -ForegroundColor Yellow
$deployObservability = Read-Host
if ($deployObservability -eq 'S' -or $deployObservability -eq 's') {
    Write-Host ""
    Write-Host "📊 9. Desplegando componentes de observabilidad..." -ForegroundColor Yellow

    kubectl apply -f ./kube/loki-deployment.yaml
    kubectl apply -f ./kube/prometheus-deployment.yaml
    kubectl apply -f ./kube/grafana-deployment.yaml
    kubectl apply -f ./kube/cadvisor-deployment.yaml

    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Algunos componentes de observabilidad fallaron" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Componentes de observabilidad desplegados" -ForegroundColor Green
    }
}

# Resumen del despliegue
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Resumen del Despliegue            " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Pods desplegados:" -ForegroundColor Cyan
kubectl get pods -n encuentros

Write-Host ""
Write-Host "🌐 Servicios disponibles:" -ForegroundColor Cyan
kubectl get svc -n encuentros

Write-Host ""
Write-Host "💾 Almacenamiento:" -ForegroundColor Cyan
kubectl get pvc -n encuentros

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Acceso a los Servicios            " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para acceder al Frontend, ejecuta:" -ForegroundColor Green
Write-Host "  minikube service frontend-service -n encuentros" -ForegroundColor White
Write-Host ""

if ($deployObservability -eq 'S' -or $deployObservability -eq 's') {
    Write-Host "Para acceder a Grafana, ejecuta:" -ForegroundColor Green
    Write-Host "  minikube service grafana-service -n encuentros" -ForegroundColor White
    Write-Host ""

    Write-Host "Para acceder a Prometheus, ejecuta:" -ForegroundColor Green
    Write-Host "  minikube service prometheus-service -n encuentros" -ForegroundColor White
    Write-Host ""
}

Write-Host "Para ver los logs de un pod:" -ForegroundColor Green
Write-Host "  kubectl logs -n encuentros deployment/backend" -ForegroundColor White
Write-Host ""

Write-Host "Para ver todos los recursos:" -ForegroundColor Green
Write-Host "  kubectl get all -n encuentros" -ForegroundColor White
Write-Host ""

Write-Host "✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📘 Para más información, consulta KUBERNETES.md" -ForegroundColor Cyan
