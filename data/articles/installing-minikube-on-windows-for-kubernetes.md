# Installing Minikube on Windows

### Prerequisites
- Windows 10/11 (64-bit)
- Virtualization enabled in BIOS
- At least 2 CPUs, 2GB RAM, 20GB disk space
- A hypervisor (Hyper-V, VirtualBox, or Docker Desktop)

---

### Method 1: Using winget (Recommended)
```powershell
winget install Kubernetes.minikube
```

### Method 2: Using Chocolatey
```powershell
choco install minikube
```

### Method 3: Manual Installation
1. Download the installer from the [official releases page](https://github.com/kubernetes/minikube/releases/latest) — get `minikube-installer.exe`
2. Run the installer as Administrator
3. Or via PowerShell:
```powershell
New-Item -Path 'c:\' -Name 'minikube' -ItemType Directory -Force
Invoke-WebRequest -OutFile 'c:\minikube\minikube.exe' -Uri 'https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe' -UseBasicParsing
```
4. Add to PATH:
```powershell
$oldPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::Machine)
if ($oldPath.Split(';') -inotcontains 'C:\minikube') {
  [Environment]::SetEnvironmentVariable('Path', $('{0};C:\minikube' -f $oldPath), [EnvironmentVariableTarget]::Machine)
}
```

---

### Start Minikube

**With Docker (most common):**
```powershell
minikube start --driver=docker
```

![image.png](https://raw.githubusercontent.com/soumya-ranjan-000/my-portfolio/main/public/images/projects/1779219154625-image.png)

![image.png](https://raw.githubusercontent.com/soumya-ranjan-000/my-portfolio/main/public/images/projects/1779219215101-image.png)

![image.png](https://raw.githubusercontent.com/soumya-ranjan-000/my-portfolio/main/public/images/projects/1779219511372-image.png)

---

**With Hyper-V:**
```powershell
minikube start --driver=hyperv
```

**With VirtualBox:**
```powershell
minikube start --driver=virtualbox
```

---

### Verify Installation
```powershell
minikube version
minikube status
kubectl get nodes
```

---

### Install kubectl (if not already installed)
```powershell
winget install Kubernetes.kubectl
```
> **Tip:** Docker Desktop is the easiest driver to set up on Windows — just install it and minikube will detect it automatically.

---
## Minikube Useful Commands

**Cluster Management**
- `minikube start` — Start the cluster
- `minikube stop` — Stop the cluster
- `minikube delete` — Delete the cluster
- `minikube pause` — Pause the cluster (saves resources)
- `minikube unpause` — Resume a paused cluster
- `minikube status` — Check cluster status

**Configuration**
- `minikube start --driver=docker` — Start with a specific driver
- `minikube start --cpus=4 --memory=8192` — Start with custom resources
- `minikube start --kubernetes-version=v1.28.0` — Use a specific K8s version
- `minikube config set driver docker` — Set default driver
- `minikube config view` — View current config

**Addons**
- `minikube addons list` — List all available addons
- `minikube addons enable ingress` — Enable an addon
- `minikube addons disable ingress` — Disable an addon
- `minikube dashboard` — Open the Kubernetes web dashboard

**Networking**
- `minikube ip` — Get cluster IP address
- `minikube tunnel` — Expose LoadBalancer services to localhost
- `minikube service <name>` — Open a service in the browser
- `minikube service <name> --url` — Get the service URL

**Docker & Images**
- `minikube docker-env` — Point shell to minikube's Docker daemon
- `minikube image load <image>` — Load a local image into minikube
- `minikube image ls` — List images in minikube
- `minikube cache add <image>` — Cache an image for offline use

**Profiles (Multiple Clusters)**
- `minikube profile list` — List all profiles
- `minikube start -p mycluster` — Create a named cluster
- `minikube profile mycluster` — Switch to a profile

**Logs & Debugging**
- `minikube logs` — View minikube logs
- `minikube logs --follow` — Stream logs in real time
- `minikube ssh` — SSH into the minikube node
- `minikube kubectl -- get pods` — Run kubectl via minikube

**Info**
- `minikube version` — Show minikube version
- `minikube update-check` — Check for updates
- `minikube node list` — List all nodes in cluster