# Portainer Stack Configuration

## Stack para Portainer

```yaml
version: '3.8'

services:
  backend:
    image: 'docker-registry.yes.com.sv/cocina-planilla:backend'
    container_name: cocina-back
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_HOST=${DB_HOST:-192.168.101.77}
      - DB_PORT=${DB_PORT:-5432}
      - DB_NAME=${DB_NAME:-cocina_planilla}
      - DB_USER=${DB_USER:-cocina_user}
      - DB_PASSWORD=${DB_PASSWORD:-Lac2025+}
      - DB_SCHEMA=${DB_SCHEMA:-administradorcocina}
      - JWT_SECRET=${JWT_SECRET:-cocina-planilla-secret-key-2026}
    networks:
      - network1
    logging:
      driver: gelf
      options:
        gelf-address: "udp://${LOG_SERVER:-192.168.101.175}:12201"
        tag: "cocina-back"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/auth/verify"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    expose:
      - "3001"
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  frontend:
    image: 'docker-registry.yes.com.sv/cocina-planilla:frontend'
    container_name: cocina-front
    restart: unless-stopped
    expose:
      - "80"
    depends_on:
      - backend
    networks:
      - network1
    logging:
      driver: gelf
      options:
        gelf-address: "udp://${LOG_SERVER:-192.168.101.175}:12201"
        tag: "cocina-front"
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

networks:
  network1:
    name: nginx-proxy-manager_default
    external: true
```

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| DB_HOST | 192.168.101.77 | Host de PostgreSQL |
| DB_PORT | 5432 | Puerto de PostgreSQL |
| DB_NAME | cocina_planilla | Nombre de la base de datos |
| DB_USER | cocina_user | Usuario de PostgreSQL |
| DB_PASSWORD | Lac2025+ | Contraseña de PostgreSQL |
| DB_SCHEMA | administradorcocina | Schema de la base de datos |
| JWT_SECRET | cocina-planilla-secret-key-2026 | Clave secreta para JWT |
| LOG_SERVER | 192.168.101.175 | Servidor de logs |

## Instrucciones de Despliegue

### Build y Push al Registry

```bash
# Construir y push backend
docker build -t docker-registry.yes.com.sv/cocina-planilla:backend ./backend
docker push docker-registry.yes.com.sv/cocina-planilla:backend

# Construir y push frontend
docker build -t docker-registry.yes.com.sv/cocina-planilla:frontend ./frontend
docker push docker-registry.yes.com.sv/cocina-planilla:frontend
```

### En Portainer

1. Ve a "Stacks" > "Add stack"
2. Nombre: `cocina-planilla`
3. Build method: "Git Repository"
4. Repository URL: `https://github.com/Lactolac/administrador-cocina.git`
5. Compose path: `docker-compose.yml`
6. Haz clic en "Deploy the stack"

### Configurar Nginx Proxy Manager

1. Ve a Nginx Proxy Manager
2. Crea un nuevo Proxy Host
3. Domain: `cocina.yes.com.sv` (o el dominio que prefieras)
4. Forward Hostname/IP: `cocina-front`
5. Forward Port: `80`
6. Habilita SSL si es necesario
