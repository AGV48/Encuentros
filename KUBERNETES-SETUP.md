# 🚀 Guía de Despliegue en Kubernetes con Minikube

## 📋 Requisitos Previos

- **Docker Desktop** instalado y en ejecución
- **Windows PowerShell** (incluido en Windows)
- **4GB RAM** libres
- **10GB** de espacio en disco

## 🔧 Instalación de Minikube y kubectl

### Opción 1: Con Chocolatey (Recomendado)

```powershell
# Instalar Chocolatey (si no lo tienes)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Minikube y kubectl
choco install minikube kubernetes-cli -y
```

### Opción 2: Descarga Manual

1. **Minikube**: https://minikube.sigs.k8s.io/docs/start/
2. **kubectl**: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

### Verificar Instalación

```powershell
minikube version
kubectl version --client
```

## 🚀 Despliegue de la Aplicación

### Método 1: Script Automatizado (Recomendado)

```powershell
# 1. Iniciar Minikube
minikube start --driver=docker --cpus=4 --memory=4096

# 2. Desplegar aplicación
.\deploy-k8s.ps1

# 3. Acceder a servicios
minikube service frontend-service -n encuentros
```

### Método 2: Despliegue Manual

````powershell
# 1. Iniciar Minikube
minikube start --driver=docker --cpus=4 --memory=4096

## 🎯 Despliegue Rápido

Para desplegar todo de una vez:

```bash
kubectl apply -f ./kube/
````

# 2. Aplicar manifiestos

kubectl apply -f ./kube/namespace.yaml
kubectl apply -f ./kube/secret.yaml
kubectl apply -f ./kube/configmap.yaml
kubectl apply -f ./kube/database-pvc.yaml
kubectl apply -f ./kube/database-deployment.yaml
kubectl apply -f ./kube/backend-deployment.yaml
kubectl apply -f ./kube/frontend-deployment.yaml
kubectl apply -f ./kube/service.yaml

# 3. Observabilidad (Opcional)

kubectl apply -f ./kube/loki-deployment.yaml
kubectl apply -f ./kube/prometheus-deployment.yaml
kubectl apply -f ./kube/grafana-deployment.yaml
kubectl apply -f ./kube/cadvisor-deployment.yaml

# 4. Verificar despliegue

kubectl get pods -n encuentros
kubectl get svc -n encuentros

# 5. Acceder a servicios

minikube service frontend-service -n encuentros

````

## 🌐 Acceso a los Servicios

### Frontend

```powershell
minikube service frontend-service -n encuentros
# URL: http://192.168.49.2:30080
````

### Grafana (Observabilidad)

```powershell
minikube service grafana-service -n encuentros
# URL: http://192.168.49.2:30030
# Usuario: admin / Contraseña: admin
```

### Prometheus (Métricas)

```powershell
minikube service prometheus-service -n encuentros
# URL: http://192.168.49.2:30090
```

## ✅ Verificación del Despliegue

```powershell
# Ver todos los pods (deben estar Running)
kubectl get pods -n encuentros

# Ver servicios
kubectl get svc -n encuentros

# Ver todos los recursos
kubectl get all -n encuentros

# Ver logs de un componente
kubectl logs -n encuentros deployment/backend -f
```

## 📸 Generar Evidencias

```powershell
# Genera automáticamente todas las evidencias en ./evidencias-k8s/
.\generar-evidencias.ps1
```

Las evidencias incluyen:

- Estado de pods y servicios
- URLs de acceso
- Logs de componentes
- Configuración completa
- Reporte consolidado

## 🧹 Limpieza

```powershell
# Opción 1: Script automatizado
.\cleanup-k8s.ps1

# Opción 2: Manual
kubectl delete namespace encuentros

# Detener Minikube
minikube stop

# Eliminar cluster completo
minikube delete
```

## 🔧 Comandos Útiles

```powershell
# Ver estado de Minikube
minikube status

# Dashboard de Kubernetes
minikube dashboard

# Ver IP de Minikube
minikube ip

# Escalar un deployment
kubectl scale deployment backend -n encuentros --replicas=3

# Reiniciar un deployment
kubectl rollout restart deployment/backend -n encuentros

# Ejecutar comando en un pod
kubectl exec -it -n encuentros <pod-name> -- /bin/bash

# Ver eventos
kubectl get events -n encuentros --sort-by='.lastTimestamp'
```

## 🆘 Troubleshooting

### Pods no inician (Pending)

```powershell
# Ver detalles del pod
kubectl describe pod -n encuentros <pod-name>

# Aumentar recursos de Minikube
minikube delete
minikube start --cpus=4 --memory=6144
```

### Error de conexión a la base de datos

```powershell
# Verificar que el pod de database esté running
kubectl get pods -n encuentros -l component=database

# Ver logs de database
kubectl logs -n encuentros deployment/database

# Probar conectividad desde backend
kubectl exec -it -n encuentros <backend-pod> -- nc -zv database-service 5432
```

### Servicios no accesibles

```powershell
# Verificar servicios
kubectl get svc -n encuentros

# Verificar endpoints
kubectl get endpoints -n encuentros

# Listar URLs disponibles
minikube service list -n encuentros
```

## 📊 Arquitectura Desplegada

```
Frontend (2 pods) → Backend (2 pods) → Database (1 pod)
                                           ↓
                                    PostgreSQL Storage (2Gi)

Observabilidad:
Grafana → Prometheus ← cAdvisor
   ↓
 Loki (Logs)
```

## 📚 Documentación Adicional

- **[KUBERNETES.md](./KUBERNETES.md)** - Documentación completa y avanzada
- **[kube/README.md](./kube/README.md)** - Detalles de cada manifiesto YAML
- **Scripts**: `deploy-k8s.ps1`, `cleanup-k8s.ps1`, `generar-evidencias.ps1`

---

**🎯 Resumen Rápido:**

1. Instalar Minikube y kubectl
2. `minikube start --driver=docker --cpus=4 --memory=4096`
3. `.\deploy-k8s.ps1`
4. `minikube service frontend-service -n encuentros`
