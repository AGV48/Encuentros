# 📸 Generación de Evidencias - Kubernetes

## 🚀 Método Rápido (Automatizado)

```powershell
.\generar-evidencias.ps1
```

Esto genera automáticamente **27 archivos** en la carpeta `evidencias-k8s/` con toda la información del despliegue.

## 📋 Evidencias Principales Requeridas

### 1. Estado de Pods

```powershell
kubectl get pods -n encuentros
```

**Guardar como:** `evidencia-pods.txt`

### 2. Estado de Servicios

```powershell
kubectl get svc -n encuentros
```

**Guardar como:** `evidencia-servicios.txt`

### 3. Todos los Recursos

```powershell
kubectl get all -n encuentros
```

**Guardar como:** `evidencia-recursos.txt`

### 4. URLs de Servicios

```powershell
minikube service list -n encuentros
```

**Guardar como:** `evidencia-urls.txt`

### 5. Deployments

```powershell
kubectl get deployments -n encuentros
```

**Guardar como:** `evidencia-deployments.txt`

### 6. Almacenamiento

```powershell
kubectl get pvc -n encuentros
```

**Guardar como:** `evidencia-pvc.txt`

## 📸 Capturas de Pantalla Necesarias

### Frontend Funcionando

1. Ejecutar:
   ```powershell
   minikube service frontend-service -n encuentros
   ```
2. Capturar pantalla del navegador mostrando la aplicación

### Grafana

1. Ejecutar:
   ```powershell
   minikube service grafana-service -n encuentros
   ```
2. Login: `admin` / `admin`
3. Capturar pantalla del dashboard

### Prometheus

1. Ejecutar:
   ```powershell
   minikube service prometheus-service -n encuentros
   ```
2. Capturar pantalla mostrando métricas

### Terminal con comandos

1. Capturar `kubectl get pods -n encuentros`
2. Capturar `kubectl get svc -n encuentros`

## 📊 Contenido del Reporte Automático

El script `generar-evidencias.ps1` crea:

```
evidencias-k8s/
├── 00-REPORTE-COMPLETO.txt    # Resumen consolidado
├── 01-cluster-info.txt
├── 02-minikube-version.txt
├── 06-pods.txt                # ✅ REQUERIDO
├── 07-services.txt            # ✅ REQUERIDO
├── 08-deployments.txt         # ✅ REQUERIDO
├── 09-pvc.txt                 # ✅ REQUERIDO
├── 11-service-urls.txt        # ✅ REQUERIDO
├── 17-logs-backend.txt
├── 18-logs-frontend.txt
├── 19-logs-database.txt
└── ... (27 archivos totales)
```

## ✅ Checklist de Evidencias

- [ ] `kubectl get pods -n encuentros` → Todos en Running
- [ ] `kubectl get svc -n encuentros` → Servicios con NodePorts
- [ ] `kubectl get all -n encuentros` → Vista completa
- [ ] `minikube service list -n encuentros` → URLs de acceso
- [ ] Captura de pantalla: Frontend funcionando
- [ ] Captura de pantalla: Grafana dashboard
- [ ] Captura de pantalla: Prometheus métricas
- [ ] Carpeta `evidencias-k8s/` generada completa

## 🎬 Comando Todo-en-Uno

```powershell
# Generar evidencias y abrir servicios
.\generar-evidencias.ps1
minikube service frontend-service -n encuentros
minikube service grafana-service -n encuentros
minikube service prometheus-service -n encuentros
```

## 📝 Verificación Rápida

```powershell
# Ver que todo esté corriendo
kubectl get pods -n encuentros | Select-String "Running"

# Contar pods correctos (debe ser 9 o más)
(kubectl get pods -n encuentros --no-headers | Select-String "Running").Count

# Ver URLs disponibles
minikube service list -n encuentros
```

## 🎯 Evidencias Mínimas para Entrega

1. **Archivo:** `evidencias-k8s/00-REPORTE-COMPLETO.txt`
2. **Captura:** Frontend funcionando (navegador)
3. **Captura:** `kubectl get pods -n encuentros` (terminal)
4. **Captura:** `kubectl get svc -n encuentros` (terminal)
5. **Captura:** Grafana dashboard (navegador)

---

**Tiempo estimado:** 2-3 minutos con el script automatizado
