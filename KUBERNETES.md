# Despliegue en Kubernetes con Minikube

Este documento detalla el proceso de despliegue de la aplicación Encuentros en un cluster de Kubernetes usando Minikube.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Instalación de Minikube](#instalación-de-minikube)
- [Configuración del Cluster](#configuración-del-cluster)
- [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
- [Verificación del Despliegue](#verificación-del-despliegue)
- [Acceso a los Servicios](#acceso-a-los-servicios)
- [Arquitectura de Kubernetes](#arquitectura-de-kubernetes)
- [Gestión del Cluster](#gestión-del-cluster)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerrequisitos

### Software Requerido

- **Docker Desktop**: 4.x o superior

  - [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)

- **kubectl**: Cliente de línea de comandos de Kubernetes

  - Windows: `choco install kubernetes-cli` (con Chocolatey)
  - O descargar desde: https://kubernetes.io/docs/tasks/tools/

- **Minikube**: Cluster local de Kubernetes
  - Windows: `choco install minikube` (con Chocolatey)
  - O descargar desde: https://minikube.sigs.k8s.io/docs/start/

### Recursos del Sistema

- **RAM**: Mínimo 4GB libres (recomendado 8GB)
- **CPU**: Mínimo 2 cores (recomendado 4)
- **Disco**: Mínimo 10GB libres

## 🚀 Instalación de Minikube

### Windows (PowerShell como Administrador)

```powershell
# Con Chocolatey
choco install minikube

# O descargar el instalador manualmente
# https://minikube.sigs.k8s.io/docs/start/
```

### Verificar la instalación

```powershell
minikube version
kubectl version --client
```

## ⚙️ Configuración del Cluster

### 1. Iniciar Minikube

```powershell
# Iniciar Minikube con configuración recomendada
minikube start --driver=docker --cpus=4 --memory=4096 --disk-size=20g

# Verificar el estado
minikube status
```

### 2. Habilitar Addons (Opcional pero recomendado)

```powershell
# Habilitar el dashboard de Kubernetes
minikube addons enable dashboard

# Habilitar métricas
minikube addons enable metrics-server

# Verificar addons habilitados
minikube addons list
```

### 3. Configurar kubectl

```powershell
# kubectl debería configurarse automáticamente
# Verificar la conexión
kubectl cluster-info
kubectl get nodes
```

## 📦 Despliegue de la Aplicación

### Opción 1: Despliegue Completo (Recomendado)

Desde la raíz del proyecto:

```powershell
# Aplicar todos los manifiestos en orden
kubectl apply -f ./kube/namespace.yaml
kubectl apply -f ./kube/secret.yaml
kubectl apply -f ./kube/configmap.yaml
kubectl apply -f ./kube/database-pvc.yaml
kubectl apply -f ./kube/database-deployment.yaml
kubectl apply -f ./kube/backend-deployment.yaml
kubectl apply -f ./kube/frontend-deployment.yaml
kubectl apply -f ./kube/service.yaml

# Observabilidad (Opcional)
kubectl apply -f ./kube/loki-deployment.yaml
kubectl apply -f ./kube/prometheus-deployment.yaml
kubectl apply -f ./kube/grafana-deployment.yaml
kubectl apply -f ./kube/cadvisor-deployment.yaml
```

### Opción 2: Despliegue con un solo comando

```powershell
# Aplicar todos los archivos de la carpeta kube
kubectl apply -f ./kube/
```

### Esperar a que los pods estén listos

```powershell
# Ver el estado de los pods
kubectl get pods -n encuentros -w

# Esperar a que todos los pods estén en estado Running
# Presiona Ctrl+C para salir del modo watch
```

## ✅ Verificación del Despliegue

### 1. Verificar todos los recursos

```powershell
# Ver todos los recursos en el namespace
kubectl get all -n encuentros

# Ver pods con más detalle
kubectl get pods -n encuentros -o wide

# Ver servicios
kubectl get svc -n encuentros

# Ver persistent volume claims
kubectl get pvc -n encuentros

# Ver deployments
kubectl get deployments -n encuentros
```

### 2. Verificar logs de los pods

```powershell
# Logs de la base de datos
kubectl logs -n encuentros deployment/database

# Logs del backend
kubectl logs -n encuentros deployment/backend

# Logs del frontend
kubectl logs -n encuentros deployment/frontend

# Seguir logs en tiempo real (Ctrl+C para salir)
kubectl logs -n encuentros deployment/backend -f
```

### 3. Verificar el estado de salud

```powershell
# Describir un pod específico
kubectl describe pod -n encuentros <nombre-del-pod>

# Ver eventos del namespace
kubectl get events -n encuentros --sort-by='.lastTimestamp'
```

## 🌐 Acceso a los Servicios

### Opción 1: Usando minikube service (Recomendado)

```powershell
# Acceder al Frontend
minikube service frontend-service -n encuentros

# Acceder a Grafana
minikube service grafana-service -n encuentros

# Acceder a Prometheus
minikube service prometheus-service -n encuentros

# Listar todos los servicios expuestos
minikube service list -n encuentros
```

### Opción 2: Port Forwarding

```powershell
# Frontend en http://localhost:8080
kubectl port-forward -n encuentros service/frontend-service 8080:80

# Backend en http://localhost:3000
kubectl port-forward -n encuentros service/backend-service 3000:3000

# Grafana en http://localhost:3030
kubectl port-forward -n encuentros service/grafana-service 3030:3000

# Prometheus en http://localhost:9090
kubectl port-forward -n encuentros service/prometheus-service 9090:9090
```

### Opción 3: Obtener URL directamente

```powershell
# Obtener la IP de Minikube
minikube ip

# Luego acceder a:
# Frontend: http://<minikube-ip>:30080
# Grafana: http://<minikube-ip>:30030
# Prometheus: http://<minikube-ip>:30090
```

### URLs de los Servicios

| Servicio   | NodePort | URL con minikube service                            |
| ---------- | -------- | --------------------------------------------------- |
| Frontend   | 30080    | `minikube service frontend-service -n encuentros`   |
| Grafana    | 30030    | `minikube service grafana-service -n encuentros`    |
| Prometheus | 30090    | `minikube service prometheus-service -n encuentros` |

## 🏗️ Arquitectura de Kubernetes

### Componentes Desplegados

```
encuentros (namespace)
│
├── ConfigMaps
│   ├── encuentros-config (configuración general)
│   ├── loki-config (configuración de Loki)
│   └── prometheus-config (configuración de Prometheus)
│
├── Secrets
│   └── encuentros-secret (credenciales)
│
├── PersistentVolumeClaims
│   ├── database-pvc (2Gi)
│   ├── loki-pvc (1Gi)
│   ├── grafana-pvc (500Mi)
│   └── prometheus-pvc (1Gi)
│
├── Deployments
│   ├── database (1 replica)
│   ├── backend (2 replicas)
│   ├── frontend (2 replicas)
│   ├── loki (1 replica)
│   ├── prometheus (1 replica)
│   └── grafana (1 replica)
│
├── DaemonSets
│   └── cadvisor
│
└── Services
    ├── database-service (ClusterIP)
    ├── backend-service (ClusterIP)
    ├── frontend-service (NodePort:30080)
    ├── loki-service (ClusterIP)
    ├── prometheus-service (NodePort:30090)
    ├── grafana-service (NodePort:30030)
    └── cadvisor-service (ClusterIP)
```

### Recursos por Pod

| Componente | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------- | ----------- | --------- | -------------- | ------------ |
| Database   | 250m        | 500m      | 256Mi          | 512Mi        |
| Backend    | 250m        | 500m      | 256Mi          | 512Mi        |
| Frontend   | 100m        | 200m      | 128Mi          | 256Mi        |
| Loki       | 100m        | 200m      | 128Mi          | 256Mi        |
| Prometheus | 200m        | 400m      | 256Mi          | 512Mi        |
| Grafana    | 100m        | 200m      | 128Mi          | 256Mi        |
| cAdvisor   | 100m        | 200m      | 128Mi          | 256Mi        |

## 🔄 Gestión del Cluster

### Escalar Deployments

```powershell
# Escalar el backend a 3 replicas
kubectl scale deployment backend -n encuentros --replicas=3

# Escalar el frontend a 3 replicas
kubectl scale deployment frontend -n encuentros --replicas=3

# Verificar el escalado
kubectl get deployments -n encuentros
```

### Actualizar Imágenes

```powershell
# Actualizar la imagen del backend
kubectl set image deployment/backend backend=joshhd01/encuentros-backend:latest -n encuentros

# Reiniciar un deployment (forzar pull de imagen)
kubectl rollout restart deployment/backend -n encuentros

# Ver el estado del rollout
kubectl rollout status deployment/backend -n encuentros
```

### Ver Historial de Despliegue

```powershell
# Ver historial de rollout
kubectl rollout history deployment/backend -n encuentros

# Revertir a versión anterior
kubectl rollout undo deployment/backend -n encuentros
```

### Acceder a un Pod

```powershell
# Listar pods
kubectl get pods -n encuentros

# Ejecutar bash en un pod
kubectl exec -it -n encuentros <nombre-del-pod> -- /bin/bash

# Ejecutar un comando específico
kubectl exec -it -n encuentros <nombre-del-pod> -- env
```

### Dashboard de Kubernetes

```powershell
# Abrir el dashboard de Kubernetes
minikube dashboard

# O acceder manualmente
kubectl proxy
# Luego ir a: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/
```

## 🧹 Limpieza y Mantenimiento

### Eliminar la aplicación

```powershell
# Eliminar todos los recursos del namespace
kubectl delete namespace encuentros

# O eliminar archivos específicos
kubectl delete -f ./kube/
```

### Limpiar recursos del cluster

```powershell
# Ver todos los recursos
kubectl get all -A

# Eliminar pods en estado Evicted o Failed
kubectl get pods -n encuentros | grep Evicted | awk '{print $1}' | ForEach-Object { kubectl delete pod $_ -n encuentros }
```

### Detener y reiniciar Minikube

```powershell
# Detener Minikube
minikube stop

# Reiniciar Minikube
minikube start

# Eliminar completamente el cluster
minikube delete
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Pods no inician (Status: Pending)

```powershell
# Ver por qué está pendiente
kubectl describe pod -n encuentros <nombre-del-pod>

# Verificar recursos del nodo
kubectl top nodes
kubectl describe node minikube
```

**Solución**: Aumentar recursos de Minikube

```powershell
minikube delete
minikube start --cpus=4 --memory=6144
```

#### 2. ImagePullBackOff

```powershell
# Ver detalles del error
kubectl describe pod -n encuentros <nombre-del-pod>

# Ver logs del pod
kubectl logs -n encuentros <nombre-del-pod>
```

**Solución**: Verificar que las imágenes existan en DockerHub

```powershell
# Forzar pull de imagen
kubectl delete pod -n encuentros <nombre-del-pod>
```

#### 3. CrashLoopBackOff

```powershell
# Ver logs del pod que falla
kubectl logs -n encuentros <nombre-del-pod> --previous

# Ver eventos
kubectl get events -n encuentros --sort-by='.lastTimestamp'
```

**Solución común**: Verificar variables de entorno y secretos

```powershell
kubectl get configmap encuentros-config -n encuentros -o yaml
kubectl get secret encuentros-secret -n encuentros -o yaml
```

#### 4. Base de datos no conecta

```powershell
# Verificar que el pod de database esté running
kubectl get pods -n encuentros -l component=database

# Verificar logs de database
kubectl logs -n encuentros deployment/database

# Probar conectividad desde el backend
kubectl exec -it -n encuentros <backend-pod> -- nc -zv database-service 5432
```

#### 5. Servicios no accesibles

```powershell
# Verificar que los servicios estén creados
kubectl get svc -n encuentros

# Verificar endpoints
kubectl get endpoints -n encuentros

# Probar desde dentro del cluster
kubectl run tmp-shell --rm -i --tty --image nicolaka/netshoot -n encuentros -- /bin/bash
# Luego dentro del pod: curl http://frontend-service
```

### Comandos de Diagnóstico

```powershell
# Ver uso de recursos
kubectl top nodes
kubectl top pods -n encuentros

# Ver todos los eventos
kubectl get events -n encuentros --sort-by='.lastTimestamp'

# Ver configuración completa de un recurso
kubectl get deployment backend -n encuentros -o yaml

# Ver estado detallado de un pod
kubectl describe pod -n encuentros <nombre-del-pod>

# Ver logs de todos los pods de un deployment
kubectl logs -n encuentros deployment/backend --all-containers=true
```

## 📊 Monitoreo

### Verificar métricas con Prometheus

1. Acceder a Prometheus:

```powershell
minikube service prometheus-service -n encuentros
```

2. Queries útiles:
   - `up` - Ver qué servicios están activos
   - `container_memory_usage_bytes` - Uso de memoria
   - `container_cpu_usage_seconds_total` - Uso de CPU

### Dashboards en Grafana

1. Acceder a Grafana:

```powershell
minikube service grafana-service -n encuentros
```

2. Credenciales por defecto:

   - Usuario: `admin`
   - Contraseña: `admin`

3. Agregar Prometheus como datasource:
   - URL: `http://prometheus-service:9090`

## 🔐 Seguridad

### Cambiar credenciales por defecto

```powershell
# Editar el secret
kubectl edit secret encuentros-secret -n encuentros

# O recrear el secret con nuevas credenciales
kubectl delete secret encuentros-secret -n encuentros
kubectl create secret generic encuentros-secret -n encuentros \
  --from-literal=POSTGRES_PASSWORD=nueva-password \
  --from-literal=GF_SECURITY_ADMIN_PASSWORD=nueva-password-grafana
```

### Ver secretos (base64 decoded)

```powershell
# Ver un secret específico
kubectl get secret encuentros-secret -n encuentros -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d
```

## 📚 Recursos Adicionales

- [Documentación de Kubernetes](https://kubernetes.io/docs/home/)
- [Documentación de Minikube](https://minikube.sigs.k8s.io/docs/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Patterns](https://www.redhat.com/en/resources/oreilly-kubernetes-patterns-cloud-native-apps)

## 🎯 Próximos Pasos

1. **Configurar Ingress** para acceso más profesional
2. **Implementar HPA** (Horizontal Pod Autoscaler)
3. **Configurar Network Policies** para seguridad
4. **Implementar CI/CD** con ArgoCD o Flux
5. **Migrar a un cluster productivo** (EKS, AKS, GKE)
