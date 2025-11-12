# Script de Generación de Evidencias para Kubernetes
# Ejecutar con: .\generar-evidencias.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Generación de Evidencias K8s      " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Crear carpeta de evidencias
$evidenciasDir = "./evidencias-k8s"
if (!(Test-Path $evidenciasDir)) {
    New-Item -ItemType Directory -Force -Path $evidenciasDir | Out-Null
    Write-Host "✅ Carpeta de evidencias creada: $evidenciasDir" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Carpeta de evidencias ya existe: $evidenciasDir" -ForegroundColor Yellow
}

Write-Host ""

# Función para ejecutar comando y guardar
function Save-Evidence {
    param(
        [string]$Command,
        [string]$OutputFile,
        [string]$Description
    )

    Write-Host "📝 $Description..." -ForegroundColor Yellow
    try {
        Invoke-Expression $Command | Out-File -FilePath "$evidenciasDir/$OutputFile" -Encoding UTF8
        Write-Host "   ✅ Guardado en: $OutputFile" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error al generar: $OutputFile" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

# Información del cluster
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  1. Información del Cluster        " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl cluster-info" -OutputFile "01-cluster-info.txt" -Description "Información del cluster"
Save-Evidence -Command "minikube version" -OutputFile "02-minikube-version.txt" -Description "Versión de Minikube"
Save-Evidence -Command "kubectl version --client" -OutputFile "03-kubectl-version.txt" -Description "Versión de kubectl"
Save-Evidence -Command "minikube status" -OutputFile "04-minikube-status.txt" -Description "Estado de Minikube"

Write-Host ""

# Estado de los recursos
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  2. Estado de Recursos             " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl get all -n encuentros -o wide" -OutputFile "05-all-resources.txt" -Description "Todos los recursos"
Save-Evidence -Command "kubectl get pods -n encuentros -o wide" -OutputFile "06-pods.txt" -Description "Pods"
Save-Evidence -Command "kubectl get svc -n encuentros -o wide" -OutputFile "07-services.txt" -Description "Servicios"
Save-Evidence -Command "kubectl get deployments -n encuentros -o wide" -OutputFile "08-deployments.txt" -Description "Deployments"
Save-Evidence -Command "kubectl get pvc -n encuentros" -OutputFile "09-pvc.txt" -Description "PersistentVolumeClaims"
Save-Evidence -Command "kubectl get pv" -OutputFile "10-pv.txt" -Description "PersistentVolumes"

Write-Host ""

# URLs de servicios
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  3. URLs de Servicios              " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "minikube service list -n encuentros" -OutputFile "11-service-urls.txt" -Description "URLs de servicios"
Save-Evidence -Command "minikube ip" -OutputFile "12-minikube-ip.txt" -Description "IP de Minikube"

Write-Host ""

# ConfigMaps y Secrets
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  4. Configuración                  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl get configmap -n encuentros" -OutputFile "13-configmaps.txt" -Description "ConfigMaps"
Save-Evidence -Command "kubectl get secret -n encuentros" -OutputFile "14-secrets.txt" -Description "Secrets"
Save-Evidence -Command "kubectl describe configmap encuentros-config -n encuentros" -OutputFile "15-describe-configmap.txt" -Description "Detalle de ConfigMap"

Write-Host ""

# Eventos
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  5. Eventos                        " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl get events -n encuentros --sort-by='.lastTimestamp'" -OutputFile "16-events.txt" -Description "Eventos del namespace"

Write-Host ""

# Logs de pods
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  6. Logs de Pods                   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl logs -n encuentros deployment/backend --tail=100" -OutputFile "17-logs-backend.txt" -Description "Logs del Backend"
Save-Evidence -Command "kubectl logs -n encuentros deployment/frontend --tail=100" -OutputFile "18-logs-frontend.txt" -Description "Logs del Frontend"
Save-Evidence -Command "kubectl logs -n encuentros deployment/database --tail=100" -OutputFile "19-logs-database.txt" -Description "Logs de la Database"

Write-Host ""

# Descripción de deployments
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  7. Descripción de Deployments     " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl describe deployment backend -n encuentros" -OutputFile "20-describe-backend.txt" -Description "Descripción del Backend"
Save-Evidence -Command "kubectl describe deployment frontend -n encuentros" -OutputFile "21-describe-frontend.txt" -Description "Descripción del Frontend"
Save-Evidence -Command "kubectl describe deployment database -n encuentros" -OutputFile "22-describe-database.txt" -Description "Descripción de la Database"

Write-Host ""

# Descripción de servicios
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  8. Descripción de Servicios       " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl describe service backend-service -n encuentros" -OutputFile "23-describe-backend-svc.txt" -Description "Descripción del Servicio Backend"
Save-Evidence -Command "kubectl describe service frontend-service -n encuentros" -OutputFile "24-describe-frontend-svc.txt" -Description "Descripción del Servicio Frontend"
Save-Evidence -Command "kubectl describe service database-service -n encuentros" -OutputFile "25-describe-database-svc.txt" -Description "Descripción del Servicio Database"

Write-Host ""

# Namespace
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  9. Información del Namespace      " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Save-Evidence -Command "kubectl describe namespace encuentros" -OutputFile "26-describe-namespace.txt" -Description "Descripción del Namespace"
Save-Evidence -Command "kubectl get all -A" -OutputFile "27-all-namespaces.txt" -Description "Todos los recursos en todos los namespaces"

Write-Host ""

# Generar reporte consolidado
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  10. Reporte Consolidado           " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$reportFile = "$evidenciasDir/00-REPORTE-COMPLETO.txt"

"==============================================" | Out-File $reportFile
"  REPORTE DE DESPLIEGUE EN KUBERNETES        " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Fecha de generación: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" | Out-File $reportFile -Append
"Generado por: $env:USERNAME" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  1. INFORMACIÓN DEL CLUSTER                 " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl cluster-info | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Versión de Minikube:" | Out-File $reportFile -Append
minikube version | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Estado de Minikube:" | Out-File $reportFile -Append
minikube status | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  2. PODS DESPLEGADOS                        " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get pods -n encuentros -o wide | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  3. SERVICIOS EXPUESTOS                     " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get svc -n encuentros -o wide | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  4. URLS DE ACCESO                          " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"IP de Minikube: $(minikube ip)" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Servicios disponibles:" | Out-File $reportFile -Append
minikube service list -n encuentros | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Acceso rápido:" | Out-File $reportFile -Append
"  - Frontend:   minikube service frontend-service -n encuentros" | Out-File $reportFile -Append
"  - Grafana:    minikube service grafana-service -n encuentros" | Out-File $reportFile -Append
"  - Prometheus: minikube service prometheus-service -n encuentros" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  5. DEPLOYMENTS                             " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get deployments -n encuentros -o wide | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  6. PERSISTENT VOLUME CLAIMS                " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get pvc -n encuentros | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  7. CONFIGMAPS Y SECRETS                    " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"ConfigMaps:" | Out-File $reportFile -Append
kubectl get configmap -n encuentros | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
"Secrets:" | Out-File $reportFile -Append
kubectl get secret -n encuentros | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  8. EVENTOS RECIENTES                       " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get events -n encuentros --sort-by='.lastTimestamp' | Select-Object -Last 20 | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  9. RESUMEN DE RECURSOS                     " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append
"" | Out-File $reportFile -Append
kubectl get all -n encuentros | Out-File $reportFile -Append
"" | Out-File $reportFile -Append

"==============================================" | Out-File $reportFile -Append
"  FIN DEL REPORTE                            " | Out-File $reportFile -Append
"==============================================" | Out-File $reportFile -Append

Write-Host "   ✅ Reporte consolidado generado" -ForegroundColor Green

Write-Host ""

# Resumen final
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Resumen                           " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$fileCount = (Get-ChildItem $evidenciasDir -File).Count
Write-Host "✅ Se generaron $fileCount archivos de evidencia" -ForegroundColor Green
Write-Host "📁 Ubicación: $evidenciasDir" -ForegroundColor Cyan
Write-Host ""

Write-Host "📄 Archivos principales:" -ForegroundColor Yellow
Write-Host "   - 00-REPORTE-COMPLETO.txt (Reporte consolidado)" -ForegroundColor White
Write-Host "   - 06-pods.txt (Estado de pods)" -ForegroundColor White
Write-Host "   - 07-services.txt (Servicios)" -ForegroundColor White
Write-Host "   - 11-service-urls.txt (URLs de acceso)" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Para acceder a los servicios:" -ForegroundColor Cyan
Write-Host "   Frontend:   minikube service frontend-service -n encuentros" -ForegroundColor White
Write-Host "   Grafana:    minikube service grafana-service -n encuentros" -ForegroundColor White
Write-Host "   Prometheus: minikube service prometheus-service -n encuentros" -ForegroundColor White
Write-Host ""

Write-Host "📸 No olvides tomar capturas de pantalla de:" -ForegroundColor Yellow
Write-Host "   ✓ Frontend funcionando" -ForegroundColor White
Write-Host "   ✓ Dashboard de Grafana" -ForegroundColor White
Write-Host "   ✓ Prometheus mostrando métricas" -ForegroundColor White
Write-Host "   ✓ Terminal con kubectl get pods" -ForegroundColor White
Write-Host ""

Write-Host "✅ ¡Generación de evidencias completada!" -ForegroundColor Green
