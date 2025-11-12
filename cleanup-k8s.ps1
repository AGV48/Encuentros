# Script de Limpieza de Encuentros en Kubernetes
# Ejecutar con: .\cleanup-k8s.ps1

Write-Host "=====================================" -ForegroundColor Red
Write-Host "  Limpieza de Encuentros en K8s     " -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""

Write-Host "⚠️  ADVERTENCIA: Este script eliminará todos los recursos de Kubernetes" -ForegroundColor Yellow
Write-Host "⚠️  de la aplicación Encuentros, incluyendo datos almacenados." -ForegroundColor Yellow
Write-Host ""
Write-Host "¿Estás seguro de que deseas continuar? (S/N)" -ForegroundColor Red
$response = Read-Host

if ($response -ne 'S' -and $response -ne 's') {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🗑️  Eliminando recursos..." -ForegroundColor Yellow
Write-Host ""

# Opción 1: Eliminar todo el namespace (más rápido)
Write-Host "¿Deseas eliminar todo el namespace 'encuentros'? (S/N)" -ForegroundColor Yellow
Write-Host "  (Esto eliminará todos los recursos de una vez)" -ForegroundColor Gray
$deleteNamespace = Read-Host

if ($deleteNamespace -eq 'S' -or $deleteNamespace -eq 's') {
    Write-Host ""
    Write-Host "🗑️  Eliminando namespace 'encuentros'..." -ForegroundColor Yellow
    kubectl delete namespace encuentros

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Namespace eliminado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al eliminar namespace" -ForegroundColor Red
    }
} else {
    # Opción 2: Eliminar recursos individualmente
    Write-Host ""
    Write-Host "🗑️  Eliminando deployments..." -ForegroundColor Yellow
    kubectl delete -f ./kube/frontend-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/backend-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/database-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/grafana-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/prometheus-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/loki-deployment.yaml --ignore-not-found=true
    kubectl delete -f ./kube/cadvisor-deployment.yaml --ignore-not-found=true
    Write-Host "✅ Deployments eliminados" -ForegroundColor Green

    Write-Host ""
    Write-Host "🗑️  Eliminando servicios..." -ForegroundColor Yellow
    kubectl delete -f ./kube/service.yaml --ignore-not-found=true
    Write-Host "✅ Servicios eliminados" -ForegroundColor Green

    Write-Host ""
    Write-Host "🗑️  Eliminando PVCs..." -ForegroundColor Yellow
    kubectl delete -f ./kube/database-pvc.yaml --ignore-not-found=true
    Write-Host "✅ PVCs eliminados" -ForegroundColor Green

    Write-Host ""
    Write-Host "🗑️  Eliminando ConfigMaps y Secrets..." -ForegroundColor Yellow
    kubectl delete -f ./kube/configmap.yaml --ignore-not-found=true
    kubectl delete -f ./kube/secret.yaml --ignore-not-found=true
    Write-Host "✅ ConfigMaps y Secrets eliminados" -ForegroundColor Green

    Write-Host ""
    Write-Host "🗑️  Eliminando namespace..." -ForegroundColor Yellow
    kubectl delete -f ./kube/namespace.yaml --ignore-not-found=true
    Write-Host "✅ Namespace eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Verificación                      " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Recursos restantes en el namespace 'encuentros':" -ForegroundColor Cyan
kubectl get all -n encuentros 2>&1

Write-Host ""
Write-Host "✅ ¡Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener Minikube completamente, ejecuta:" -ForegroundColor Yellow
Write-Host "  minikube stop" -ForegroundColor White
Write-Host ""
Write-Host "Para eliminar el cluster de Minikube, ejecuta:" -ForegroundColor Yellow
Write-Host "  minikube delete" -ForegroundColor White
Write-Host ""
