# Portainer Stack Configuration

## Stack para Portainer

Copia y pega la siguiente configuración en Portainer:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: cocina-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: cocina_user
      POSTGRES_PASSWORD: cocina_password
      POSTGRES_DB: cocina_planilla
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - cocina-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cocina_user -d cocina_planilla"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    image: ${DOCKER_REGISTRY:-}/cocina-backend:latest
    container_name: cocina-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=cocina_user
      - DB_PASSWORD=cocina_password
      - DB_NAME=cocina_planilla
      - DB_SCHEMA=administradorcocina
      - JWT_SECRET=cocina-planilla-secret-key-2026-change-this
      - PORT=3001
    depends_on:
      postgres:
        condition: service_healthy
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
    ports:
      - "8080:80"
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

volumes:
  postgres_data:
    driver: local
```

## Instrucciones de Despliegue

### Opción 1: Build Local y Push a Registry

1. **Construir las imágenes:**
```bash
# Construir backend
docker build -t tu-registry/cocina-backend:latest ./backend

# Construir frontend
docker build -t tu-registry/cocina-frontend:latest ./frontend

# Push al registry
docker push tu-registry/cocina-backend:latest
docker push tu-registry/cocina-frontend:latest
```

2. **En Portainer:**
   - Ve a "Stacks" > "Add stack"
   - Nombre: `cocina-planilla`
   - Selecciona "Git Repository" o pega el docker-compose
   - Si usas registry privado, configura las credenciales
   - Haz clic en "Deploy the stack"

### Opción 2: Build desde Portainer

1. **En Portainer:**
   - Ve a "Stacks" > "Add stack"
   - Nombre: `cocina-planilla`
   - Selecciona "Upload" y sube el archivo `docker-compose.yml`
   - O selecciona "Repository" y conecta tu repositorio Git
   - Haz clic en "Deploy the stack"

### Opción 3: Usando Git Repository

1. **Configura el stack en Portainer:**
   - Ve a "Stacks" > "Add stack"
   - Nombre: `cocina-planilla`
   - Build method: "Git Repository"
   - Repository URL: `https://github.com/tu-usuario/tu-repo.git`
   - Compose path: `docker-compose.yml`
   - Haz clic en "Deploy the stack"

## Variables de Entorno Recomendadas

En Portainer, puedes configurar estas variables de entorno:

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| DB_USER | cocina_user | Usuario de PostgreSQL |
| DB_PASSWORD | cocina_password | Contraseña de PostgreSQL |
| DB_NAME | cocina_planilla | Nombre de la base de datos |
| DB_SCHEMA | administradorcocina | Schema de la base de datos |
| JWT_SECRET | (cambiar) | Clave secreta para JWT |
| PORT | 8080 | Puerto de la aplicación |

## Acceso a la Aplicación

Una vez desplegado, la aplicación estará disponible en:
- **URL:** `http://tu-servidor:8080`

## Notas Importantes

1. **Cambiar JWT_SECRET:** Por seguridad, cambia el valor de JWT_SECRET en producción
2. **Cambiar contraseñas:** Cambia las contraseñas por defecto de la base de datos
3. **HTTPS:** Considera usar un reverse proxy (Traefik/Nginx) con SSL
4. **Backups:** Configura backups del volumen `postgres_data`
