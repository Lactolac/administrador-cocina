# Portainer Stack Configuration

## Stack para Portainer

Copia y pega la siguiente configuración en Portainer:

```yaml
version: '3.8'

services:
  # Backend API
  backend:
    image: ${DOCKER_REGISTRY:-}/cocina-backend:latest
    container_name: cocina-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT:-5432}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - DB_SCHEMA=${DB_SCHEMA:-administradorcocina}
      - JWT_SECRET=${JWT_SECRET:-cocina-planilla-secret-key-2026}
      - PORT=3001
    networks:
      - cocina-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/api/auth/verify"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend
  frontend:
    image: ${DOCKER_REGISTRY:-}/cocina-frontend:latest
    container_name: cocina-frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - cocina-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  cocina-network:
    driver: bridge
```

## Variables de Entorno Requeridas en Portainer

Configura estas variables en el Environment de Portainer:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_HOST | Host de PostgreSQL | tu-servidor-postgres |
| DB_PORT | Puerto de PostgreSQL | 5432 |
| DB_USER | Usuario de PostgreSQL | cocina_user |
| DB_PASSWORD | Contraseña de PostgreSQL | tu_password_seguro |
| DB_NAME | Nombre de la base de datos | cocina_planilla |
| DB_SCHEMA | Schema de la base de datos | administradorcocina |
| JWT_SECRET | Clave secreta para JWT | cambia-esto-en-produccion |

## Instrucciones de Despliegue

### Opción 1: Build Local y Push a Registry

```bash
# Construir backend
docker build -t tu-registry/cocina-backend:latest ./backend

# Construir frontend
docker build -t tu-registry/cocina-frontend:latest ./frontend

# Push al registry
docker push tu-registry/cocina-backend:latest
docker push tu-registry/cocina-frontend:latest
```

### Opción 2: Desde Git Repository

1. Ve a "Stacks" > "Add stack"
2. Nombre: `cocina-planilla`
3. Build method: "Git Repository"
4. Repository URL: `https://github.com/Lactolac/administrador-cocina.git`
5. Compose path: `docker-compose.yml`
6. Configura las variables de entorno
7. Haz clic en "Deploy the stack"

## Notas

- Los contenedores no exponen puertos directamente. Usa un reverse proxy (Traefik/Nginx) para acceder a la aplicación.
- El frontend escucha en el puerto 80 internamente
- El backend escucha en el puerto 3001 internamente
